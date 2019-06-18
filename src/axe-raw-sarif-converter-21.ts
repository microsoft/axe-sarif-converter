// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { isEmpty } from './array-utils';
import { getArtifactProperties } from './artifact-property-provider';
import {
    AxeRawCheckResult,
    AxeRawNodeResult,
    AxeRawResult,
} from './axe-raw-result';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { DictionaryStringTo } from './dictionary-types';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromEnvironment } from './environment-data-provider';
import { getInvocations21 } from './invocation-provider-21';
import { escapeForMarkdown, isNotEmpty } from './string-utils';
import { axeTagsToWcagLinkData, WCAGLinkData } from './wcag-link-data';
import { WCAGLinkDataIndexer } from './wcag-link-data-indexer';
import { getWcagTaxonomy } from './wcag-taxonomy-provider';

export function defaultAxeRawSarifConverter21(): AxeRawSarifConverter21 {
    return new AxeRawSarifConverter21(
        getConverterProperties,
        getAxeToolProperties21,
        getInvocations21,
        getArtifactProperties,
    );
}

export class AxeRawSarifConverter21 {
    private readonly tagsToWcagLinkData: DictionaryStringTo<
        WCAGLinkData
    > = axeTagsToWcagLinkData;
    private readonly wcagLinkDataIndexer: WCAGLinkDataIndexer = new WCAGLinkDataIndexer(
        this.tagsToWcagLinkData,
    );
    public constructor(
        private getConverterToolProperties: () => Sarif.Run['conversion'],
        private getAxeProperties: () => Sarif.ToolComponent,
        private invocationConverter: (
            environmentData: EnvironmentData,
        ) => Sarif.Invocation[],
        private getArtifactProperties: (
            environmentData: EnvironmentData,
        ) => Sarif.Artifact,
    ) {}

    public convert(
        results: AxeRawResult[],
        converterOptions: ConverterOptions,
        environmentData: EnvironmentData,
    ): Sarif.Log {
        return {
            version: '2.1.0',
            runs: [this.convertRun(results, converterOptions, environmentData)],
        };
    }

    private convertRun(
        results: AxeRawResult[],
        converterOptions: ConverterOptions,
        environmentData: EnvironmentData,
    ): Sarif.Run {
        const run: Sarif.Run = {
            conversion: this.getConverterToolProperties(),
            tool: {
                driver: {
                    ...this.getAxeProperties(),
                    // rules: this.convertResultsToRules(results),
                },
            },
            invocations: this.invocationConverter(environmentData),
            artifacts: [
                this.getArtifactProperties(getEnvironmentDataFromEnvironment()),
            ],
            results: this.convertRawResults(
                results,
                this.getExtraSarifResultProperties(converterOptions),
                environmentData,
            ),
            taxonomies: [
                getWcagTaxonomy(
                    this.wcagLinkDataIndexer.getSortedWcagTags(),
                    this.tagsToWcagLinkData,
                ),
            ],
        };

        this.fillInRunPropertiesFromOptions(run, converterOptions);

        return run;
    }

    private getExtraSarifResultProperties(
        converterOptions: ConverterOptions,
    ): DictionaryStringTo<string> {
        let extraSarifResultProperties: DictionaryStringTo<string> = {};
        if (converterOptions && converterOptions.scanName !== undefined) {
            extraSarifResultProperties = {
                scanName: converterOptions.scanName,
            };
        }
        return extraSarifResultProperties;
    }

    private fillInRunPropertiesFromOptions(
        run: Sarif.Run,
        converterOptions: ConverterOptions,
    ): void {
        if (converterOptions.testCaseId !== undefined) {
            run.properties!.testCaseId = converterOptions.testCaseId;
        }

        if (converterOptions.scanId !== undefined) {
            // run.logicalId = converterOptions.scanId;
        }
    }

    private convertRawResults(
        results: AxeRawResult[],
        extraSarifResultProperties: DictionaryStringTo<string>,
        environmentData: EnvironmentData,
    ): Sarif.Result[] {
        const resultArray: Sarif.Result[] = [];

        for (const result of results) {
            const axeRawNodeResultArrays = [
                result.violations,
                result.passes,
                result.incomplete,
                result.inapplicable,
            ];

            for (const axeRawNodeResultArray of axeRawNodeResultArrays) {
                if (!axeRawNodeResultArray) {
                    continue;
                }
                resultArray.push(
                    ...this.convertRawNodeResults(
                        axeRawNodeResultArray,
                        extraSarifResultProperties,
                        environmentData.targetPageUrl,
                        result.id,
                    ),
                );
            }
            if (axeRawNodeResultArrays.every(isEmpty)) {
                resultArray.push(
                    this.generateResultForInapplicableRule(
                        extraSarifResultProperties,
                        result.id,
                    ),
                );
            }
        }

        return resultArray;
    }

    private convertRawNodeResults(
        rawNodeResults: AxeRawNodeResult[],
        extraSarifResultProperties: DictionaryStringTo<string>,
        targetPageUrl: string,
        ruleId: string,
    ): Sarif.Result[] {
        if (rawNodeResults) {
            return rawNodeResults.map(rawNodeResult =>
                this.convertRawNodeResult(
                    rawNodeResult,
                    extraSarifResultProperties,
                    targetPageUrl,
                    ruleId,
                ),
            );
        }
        return [];
    }

    private convertRawNodeResult(
        axeRawNodeResult: AxeRawNodeResult,
        extraSarifResultProperties: DictionaryStringTo<string>,
        targetPageUrl: string,
        ruleId: string,
    ): Sarif.Result {
        // const level = this.getSarifResultLevel(axeRawNodeResult.result);
        const kind = 'fail';
        const selector = this.getLogicalNameFromRawNode(axeRawNodeResult);
        return {
            ruleId: ruleId,
            // level: level,
            message: this.convertMessage(axeRawNodeResult, kind),
            locations: [
                {
                    // physicalLocation: {
                    //     fileLocation: {
                    //         uri: targetPageUrl,
                    //     },
                    // },
                    // fullyQualifiedLogicalName: selector,
                    annotations: [
                        {
                            snippet: {
                                text: axeRawNodeResult.node.source,
                            },
                        },
                    ],
                },
            ],
            properties: {
                ...extraSarifResultProperties,
                tags: ['Accessibility'],
            },
            partialFingerprints: {
                fullyQualifiedLogicalName: selector,
                ruleId: ruleId,
            },
        };
    }

    private generateResultForInapplicableRule(
        extraSarifResultProperties: DictionaryStringTo<string>,
        ruleId: string,
    ): Sarif.Result {
        return {
            ruleId: ruleId,
            // ruleIndex: 0,
            kind: 'notApplicable',
            level: 'none',
            // TODO: include message text
            message: {
                text: '',
            },
        };
    }

    // private getSarifResultLevel(
    //     resultValue?: ResultValue,
    // ): Sarif.Result.level {
    //     const resultToLevelMapping: {
    //         [K in ResultValue]: Sarif.Result.level
    //     } = {
    //         passed: Sarif.Result.level.pass,
    //         failed: Sarif.Result.level.error,
    //         inapplicable: Sarif.Result.level.notApplicable,
    //         cantTell: Sarif.Result.level.open,
    //     };

    //     if (!resultValue) {
    //         throw new Error(
    //             'getSarifResultLevel(resultValue): resultValue is undefined',
    //         );
    //     }

    //     return resultToLevelMapping[resultValue];
    // }

    private getLogicalNameFromRawNode(axeRawNodeResult: AxeRawNodeResult) {
        if (!axeRawNodeResult.node.selector) {
            throw new Error(
                'getLogicalNameFromRawNode: axe result contained a node with no selector',
            );
        }
        return axeRawNodeResult.node.selector.join(';');
    }

    private convertMessage(
        node: AxeRawNodeResult,
        kind: Sarif.Result.kind,
    ): Sarif.Message {
        const textArray: string[] = [];
        const markdownArray: string[] = [];

        if (kind === 'fail') {
            const allAndNone = node.all.concat(node.none);
            this.convertMessageChecks(
                'Fix all of the following:',
                allAndNone,
                textArray,
                markdownArray,
            );
            this.convertMessageChecks(
                'Fix any of the following:',
                node.any,
                textArray,
                markdownArray,
            );
        } else {
            const allNodes = node.all.concat(node.none).concat(node.any);
            this.convertMessageChecks(
                'The following tests passed:',
                allNodes,
                textArray,
                markdownArray,
            );
        }

        return {
            text: textArray.join(' '),
            markdown: markdownArray.join('\n\n'),
        };
    }

    private convertMessageChecks(
        heading: string,
        checkResults: AxeRawCheckResult[],
        textArray: string[],
        markdownArray: string[],
    ): void {
        if (checkResults.length > 0) {
            const textLines: string[] = [];
            const markdownLines: string[] = [];

            textLines.push(heading);
            markdownLines.push(escapeForMarkdown(heading));

            for (const checkResult of checkResults) {
                const message = isNotEmpty(checkResult.message)
                    ? checkResult.message
                    : checkResult.id;

                textLines.push(message + '.');
                markdownLines.push('- ' + escapeForMarkdown(message) + '.');
            }

            textArray.push(textLines.join(' '));
            markdownArray.push(markdownLines.join('\n'));
        }
    }

    private convertResultsToRules(
        results: AxeRawResult[],
    ): DictionaryStringTo<Sarif.ReportingDescriptor> {
        const rulesDictionary: DictionaryStringTo<
            Sarif.ReportingDescriptor
        > = {};

        for (const result of results) {
            rulesDictionary[result.id] = this.axeRawResultToSarifRule(result);
        }

        return rulesDictionary;
    }

    private axeRawResultToSarifRule(
        axeRawResult: AxeRawResult,
    ): Sarif.ReportingDescriptor {
        return {
            id: axeRawResult.id,
            name: axeRawResult.help,
            fullDescription: {
                text: axeRawResult.description + '.',
            },
            helpUri: axeRawResult.helpUrl,
            // relationships:
            properties: {},
        };
    }
}
