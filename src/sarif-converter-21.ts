// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import {
    getArtifactLocation,
    getArtifactProperties,
} from './artifact-property-provider';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { DictionaryStringTo } from './dictionary-types';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromResults } from './environment-data-provider';
import { getInvocations21 } from './invocation-provider-21';
import { ResultToRuleConverter } from './result-to-rule-converter';
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
        results: Axe.AxeResults,
        options: ConverterOptions,
    ): Sarif.Log {
        return {
            version: '2.1.0',
            runs: [this.convertRun(results, options)],
        };
    }

    private convertRun(
        results: Axe.AxeResults,
        options: ConverterOptions,
    ): Sarif.Run {
        const resultToRuleConverter: ResultToRuleConverter = ResultToRuleConverter.fromV2Results(
            results,
            this.wcagLinkDataIndexer.getSortedWcagTags(),
            this.wcagLinkDataIndexer.getWcagTagsToTaxaIndices(),
        );

        return {
            conversion: this.getConverterToolProperties(),
            tool: {
                driver: {
                    ...this.getAxeProperties(),
                    rules: resultToRuleConverter.getRulePropertiesFromResults(),
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
            results: this.convertResults(
                results,
                resultToRuleConverter.getRuleIdsToRuleIndices(),
            ),
            taxonomies: [
                getWcagTaxonomy(
                    this.wcagLinkDataIndexer.getSortedWcagTags(),
                    this.tagsToWcagLinkData,
                ),
            ],
        };
    }

    private convertResults(
        results: Axe.AxeResults,
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
    ): Sarif.Result[] {
        const resultArray: Sarif.Result[] = [];
        const environmentData: EnvironmentData = getEnvironmentDataFromResults(
            results,
        );

        this.convertRuleResults(
            resultArray,
            results.violations,
            ruleIdsToRuleIndices,
            'fail',
            environmentData,
        );
        this.convertRuleResults(
            resultArray,
            results.passes,
            ruleIdsToRuleIndices,
            'pass',
            environmentData,
        );
        this.convertRuleResults(
            resultArray,
            results.incomplete,
            ruleIdsToRuleIndices,
            'open',
            environmentData,
        );
        this.convertRuleResultsWithoutNodes(
            resultArray,
            results.inapplicable,
            ruleIdsToRuleIndices,
            'notApplicable',
        );

        return resultArray;
    }

    private convertRuleResults(
        resultArray: Sarif.Result[],
        ruleResults: Axe.Result[],
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        kind: Sarif.Result.kind,
        environmentData: EnvironmentData,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResult(
                    resultArray,
                    ruleResult,
                    ruleIdsToRuleIndices,
                    kind,
                    environmentData,
                );
            }
        }
    }

    private convertRuleResult(
        resultArray: Sarif.Result[],
        ruleResult: Axe.Result,
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        kind: Sarif.Result.kind,
        environmentData: EnvironmentData,
    ): void {
        for (const node of ruleResult.nodes) {
            resultArray.push({
                ruleId: ruleResult.id,
                ruleIndex: ruleIdsToRuleIndices[ruleResult.id],
                kind: kind,
                level: this.getResultLevelFromResultKind(kind),
                message: this.convertMessage(node, kind),
                locations: [
                    {
                        physicalLocation: {
                            artifactLocation: getArtifactLocation(
                                environmentData,
                            ),
                            region: {
                                snippet: {
                                    text: node.html,
                                },
                            },
                        },
                        logicalLocations: this.getLogicalLocations(node),
                    },
                ],
            });
        }
    }

    private getLogicalLocations(node: Axe.NodeResult): Sarif.LogicalLocation[] {
        const selector: string = node.target.join(';');
        const logicalLocations: Sarif.LogicalLocation[] = [
            this.formatLogicalLocation(selector),
        ];
        // casting node as "any" works around axe-core/#1636
        if ((node as any).xpath) {
            let nodeXpath: string = (node as any).xpath.join(';');
            logicalLocations.push(this.formatLogicalLocation(nodeXpath));
        }
        return logicalLocations;
    }

    private formatLogicalLocation(name: string): Sarif.LogicalLocation {
        return {
            fullyQualifiedName: name,
            kind: 'element',
        };
    }

    private convertMessage(
        node: Axe.NodeResult,
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
        checkResults: Axe.CheckResult[],
        textArray: string[],
        markdownArray: string[],
    ): void {
        if (checkResults.length > 0) {
            const textLines: string[] = [];
            const markdownLines: string[] = [];

            textLines.push(heading);
            markdownLines.push(this.escapeForMarkdown(heading));

            for (const checkResult of checkResults) {
                const message = isNotEmpty(checkResult.message)
                    ? checkResult.message
                    : checkResult.id;

                textLines.push(message + '.');
                markdownLines.push(
                    '- ' + this.escapeForMarkdown(message) + '.',
                );
            }

            textArray.push(textLines.join(' '));
            markdownArray.push(markdownLines.join('\n'));
        }
    }

    private escapeForMarkdown(s: string): string {
        return s ? s.replace(/</g, '&lt;') : '';
    }

    private convertRuleResultsWithoutNodes(
        resultArray: Sarif.Result[],
        ruleResults: Axe.Result[],
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        kind: Sarif.Result.kind,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                resultArray.push({
                    ruleId: ruleResult.id,
                    ruleIndex: ruleIdsToRuleIndices[ruleResult.id],
                    kind: kind,
                    level: this.getResultLevelFromResultKind(kind),
                    message: {
                        text: ruleResult.description,
                    },
                });
            }
        }
    }

    private getResultLevelFromResultKind(kind: Sarif.Result.kind) {
        return kind === 'fail' ? 'error' : 'none';
    }
}
