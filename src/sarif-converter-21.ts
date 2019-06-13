// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { getArtifactProperties } from './artifact-property-provider';
import {
    getAxeToolProperties21,
    getAxeToolSupportedTaxonomy,
} from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import {
    DecoratedAxeResult,
    DecoratedAxeResults,
} from './decorated-axe-results';
import { DictionaryStringTo } from './dictionary-types';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromResults } from './environment-data-provider';
import { getInvocations21 } from './invocation-provider-21';
import * as CustomSarif from './sarif/custom-sarif-types-21';
import { isNotEmpty } from './string-utils';
import { axeTagsToWcagLinkData, WCAGLinkData } from './wcag-link-data';
import { WCAGLinkDataIndexer } from './wcag-link-data-indexer';
import { getWcagTaxonomy } from './wcag-taxonomy-provider';

export function defaultSarifConverter21(): SarifConverter21 {
    return new SarifConverter21(
        getConverterProperties,
        getAxeToolProperties21,
        getInvocations21,
        getArtifactProperties,
    );
}
export class SarifConverter21 {
    private readonly tagsToWcagLinkData: DictionaryStringTo<
        WCAGLinkData
    > = axeTagsToWcagLinkData;
    private readonly wcagLinkDataIndexer: WCAGLinkDataIndexer = new WCAGLinkDataIndexer(
        this.tagsToWcagLinkData,
    );

    private ruleIdsToRuleIndices: DictionaryStringTo<number> = {};

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
        results: DecoratedAxeResults,
        options: ConverterOptions,
    ): Sarif.Log {
        return {
            version: CustomSarif.SarifLogVersion21.version,
            runs: [this.convertRun(results, options)],
        };
    }

    private convertRun(
        results: DecoratedAxeResults,
        options: ConverterOptions,
    ): Sarif.Run {
        let properties: DictionaryStringTo<string> = {};

        if (options && options.scanName !== undefined) {
            properties = {
                scanName: options.scanName,
            };
        }

        const run: Sarif.Run = {
            conversion: this.getConverterToolProperties(),
            tool: {
                driver: {
                    ...this.getAxeProperties(),
                    rules: this.getRulePropertiesFromResults(results),
                },
            },
            invocations: this.invocationConverter(
                getEnvironmentDataFromResults(results),
            ),
            artifacts: [
                this.getArtifactProperties(
                    getEnvironmentDataFromResults(results),
                ),
            ],
            results: this.convertResults(results, properties),
            // resources: {
            //     rules: this.convertResultsToRules(results),
            // },
            taxonomies: [
                getWcagTaxonomy(
                    this.wcagLinkDataIndexer.getSortedWcagTags(),
                    this.tagsToWcagLinkData,
                ),
            ],
        };

        if (options && options.testCaseId !== undefined) {
            run.properties!.testCaseId = options.testCaseId;
        }

        if (options && options.scanId !== undefined) {
            // run.logicalId = options.scanId;
        }

        return run;
    }

    private convertResults(
        results: DecoratedAxeResults,
        properties: DictionaryStringTo<string>,
    ): Sarif.Result[] {
        const resultArray: Sarif.Result[] = [];

        this.convertRuleResults(
            resultArray,
            results.violations,
            CustomSarif.Result.level.error,
            results.targetPageUrl,
            properties,
        );
        this.convertRuleResults(
            resultArray,
            results.passes,
            CustomSarif.Result.level.pass,
            results.targetPageUrl,
            properties,
        );
        this.convertRuleResults(
            resultArray,
            results.incomplete,
            CustomSarif.Result.level.open,
            results.targetPageUrl,
            properties,
        );
        this.convertRuleResultsWithoutNodes(
            resultArray,
            results.inapplicable,
            CustomSarif.Result.level.notApplicable,
            properties,
        );

        return resultArray;
    }

    private convertRuleResults(
        resultArray: Sarif.Result[],
        ruleResults: DecoratedAxeResult[],
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: DictionaryStringTo<string>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResult(
                    resultArray,
                    ruleResult,
                    level,
                    targetPageUrl,
                    properties,
                );
            }
        }
    }

    private convertRuleResult(
        resultArray: Sarif.Result[],
        ruleResult: DecoratedAxeResult,
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: DictionaryStringTo<string>,
    ): void {
        const partialFingerprints: DictionaryStringTo<
            string
        > = this.getPartialFingerprintsFromRule(ruleResult);

        for (const node of ruleResult.nodes) {
            const selector = node.target.join(';');
            resultArray.push({
                ruleId: ruleResult.id,
                // level: level,
                message: this.convertMessage(node, level),
                locations: [
                    {
                        physicalLocation: {
                            // fileLocation: {
                            //     uri: targetPageUrl,
                            // },
                        },
                        // fullyQualifiedLogicalName: selector,
                        annotations: [
                            {
                                snippet: {
                                    text: node.html,
                                },
                            },
                        ],
                    },
                ],
                properties: {
                    ...properties,
                    tags: ['Accessibility'],
                },
                partialFingerprints: {
                    fullyQualifiedLogicalName: selector,
                    ...partialFingerprints,
                },
            });
        }
    }

    private getPartialFingerprintsFromRule(
        ruleResult: DecoratedAxeResult,
    ): DictionaryStringTo<string> {
        return {
            ruleId: ruleResult.id,
        };
    }

    private convertMessage(
        node: Axe.NodeResult,
        level: CustomSarif.Result.level,
    ): Sarif.Message {
        const textArray: string[] = [];
        const richTextArray: string[] = [];

        if (level === CustomSarif.Result.level.error) {
            const allAndNone = node.all.concat(node.none);
            this.convertMessageChecks(
                'Fix all of the following:',
                allAndNone,
                textArray,
                richTextArray,
            );
            this.convertMessageChecks(
                'Fix any of the following:',
                node.any,
                textArray,
                richTextArray,
            );
        } else {
            const allNodes = node.all.concat(node.none).concat(node.any);
            this.convertMessageChecks(
                'The following tests passed:',
                allNodes,
                textArray,
                richTextArray,
            );
        }

        return {
            text: textArray.join(' '),
            // richText: richTextArray.join('\n\n'),
        };
    }

    private convertMessageChecks(
        heading: string,
        checkResults: Axe.CheckResult[],
        textArray: string[],
        richTextArray: string[],
    ): void {
        if (checkResults.length > 0) {
            const textLines: string[] = [];
            const richTextLines: string[] = [];

            textLines.push(heading);
            richTextLines.push(this.escapeForMarkdown(heading));

            for (const checkResult of checkResults) {
                const message = isNotEmpty(checkResult.message)
                    ? checkResult.message
                    : checkResult.id;

                textLines.push(message + '.');
                richTextLines.push('- ' + this.escapeForMarkdown(message));
            }

            textArray.push(textLines.join(' '));
            richTextArray.push(richTextLines.join('\n'));
        }
    }

    private escapeForMarkdown(s: string): string {
        return s ? s.replace(/</g, '&lt;') : '';
    }

    private convertRuleResultsWithoutNodes(
        resultArray: Sarif.Result[],
        ruleResults: DecoratedAxeResult[],
        level: CustomSarif.Result.level,
        properties: DictionaryStringTo<string>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                const partialFingerprints = this.getPartialFingerprintsFromRule(
                    ruleResult,
                );
                // resultArray.push({
                // ruleId: ruleResult.id,
                // level: level,
                // properties: {
                // ...properties,
                // tags: ['Accessibility'],
                // },
                // partialFingerprints: partialFingerprints,
                // });
            }
        }
    }

    private getRulePropertiesFromResults(
        results: DecoratedAxeResults,
    ): Sarif.ReportingDescriptor[] {
        const rulesDictionary: DictionaryStringTo<
            Sarif.ReportingDescriptor
        > = this.convertResultsToRules(results);
        const sortedRuleIds: string[] = this.sortRuleIds(rulesDictionary);
        this.indexRuleIds(sortedRuleIds);
        return sortedRuleIds.map(ruleId => rulesDictionary[ruleId]);
    }

    private sortRuleIds(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ): string[] {
        return Object.keys(rulesDictionary).sort();
    }

    private indexRuleIds(sortedIds: string[]) {
        for (let i = 0; i < sortedIds.length; i++) {
            this.ruleIdsToRuleIndices[sortedIds[i]] = i;
        }
    }

    private convertResultsToRules(
        results: DecoratedAxeResults,
    ): DictionaryStringTo<Sarif.ReportingDescriptor> {
        const rulesDictionary: DictionaryStringTo<
            Sarif.ReportingDescriptor
        > = {};

        this.convertRuleResultsToRules(rulesDictionary, results.violations);
        this.convertRuleResultsToRules(rulesDictionary, results.passes);
        this.convertRuleResultsToRules(rulesDictionary, results.inapplicable);
        this.convertRuleResultsToRules(rulesDictionary, results.incomplete);

        return rulesDictionary;
    }

    private convertRuleResultsToRules(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
        ruleResults: DecoratedAxeResult[],
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResultToRule(rulesDictionary, ruleResult);
            }
        }
    }

    private convertRuleResultToRule(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
        ruleResult: DecoratedAxeResult,
    ): void {
        if (!rulesDictionary.hasOwnProperty(ruleResult.id)) {
            const rule: Sarif.ReportingDescriptor = {
                id: ruleResult.id,
                name: ruleResult.help,
                fullDescription: {
                    text: ruleResult.description,
                },
                helpUri: ruleResult.helpUrl,
                relationships: this.getRelationshipsFromResultTags(ruleResult),
            };
            rulesDictionary[ruleResult.id] = rule;
        }
    }

    private getRelationshipsFromResultTags(result: DecoratedAxeResult) {
        return result.tags
            .filter(
                tag =>
                    this.wcagLinkDataIndexer.getSortedWcagTags().indexOf(tag) !=
                    -1,
            )
            .map(tag => {
                return {
                    target: {
                        id: tag,
                        index: this.wcagLinkDataIndexer.getWcagTagsToTaxaIndices()[
                            tag
                        ],
                        toolComponent: getAxeToolSupportedTaxonomy(),
                    },
                    kinds: ['superset'],
                };
            });
    }
}
