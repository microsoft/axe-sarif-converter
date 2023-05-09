// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import {
    getArtifactLocation,
    getArtifactProperties,
} from './artifact-property-provider';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { DictionaryStringTo } from './dictionary-types';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromResults } from './environment-data-provider';
import { getInvocations } from './invocation-provider';
import { ResultToRuleConverter } from './result-to-rule-converter';
import { formatSarifResultMessage } from './sarif-result-message-formatter';
import { WCAGLinkData, axeTagsToWcagLinkData } from './wcag-link-data';
import { WCAGLinkDataIndexer } from './wcag-link-data-indexer';
import { getWcagTaxonomy } from './wcag-taxonomy-provider';

export function defaultSarifConverter(): SarifConverter {
    return new SarifConverter(
        getConverterProperties,
        getAxeToolProperties,
        getInvocations,
        getArtifactProperties,
    );
}
export class SarifConverter {
    private readonly tagsToWcagLinkData: DictionaryStringTo<WCAGLinkData> =
        axeTagsToWcagLinkData;
    private readonly wcagLinkDataIndexer: WCAGLinkDataIndexer =
        new WCAGLinkDataIndexer(this.tagsToWcagLinkData);

    public constructor(
        private getConverterToolProperties: () => Sarif.Run['conversion'],
        private getAxeProperties: (
            environmentData: EnvironmentData,
        ) => Sarif.ToolComponent,
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
            $schema:
                'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
            runs: [this.convertRun(results, options)],
        };
    }

    private convertRun(
        results: Axe.AxeResults,
        options: ConverterOptions,
    ): Sarif.Run {
        const resultToRuleConverter: ResultToRuleConverter =
            ResultToRuleConverter.fromV2Results(
                results,
                this.wcagLinkDataIndexer.getSortedWcagTags(),
                this.wcagLinkDataIndexer.getWcagTagsToTaxaIndices(),
            );

        const environmentData: EnvironmentData =
            getEnvironmentDataFromResults(results);

        return {
            conversion: this.getConverterToolProperties(),
            tool: {
                driver: {
                    ...this.getAxeProperties(environmentData),
                    rules: resultToRuleConverter.getRulePropertiesFromResults(),
                },
            },
            invocations: this.invocationConverter(environmentData),
            artifacts: [this.getArtifactProperties(environmentData)],
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
        const environmentData: EnvironmentData =
            getEnvironmentDataFromResults(results);

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
                for (const node of ruleResult.nodes) {
                    resultArray.push(
                        this.convertRuleResult(
                            node,
                            ruleResult,
                            ruleIdsToRuleIndices,
                            kind,
                            environmentData,
                        ),
                    );
                }
            }
        }
    }

    private convertRuleResult(
        node: Axe.NodeResult,
        ruleResult: Axe.Result,
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        kind: Sarif.Result.kind,
        environmentData: EnvironmentData,
    ): Sarif.Result {
        return {
            ruleId: ruleResult.id,
            ruleIndex: ruleIdsToRuleIndices[ruleResult.id],
            kind: kind,
            level: this.getResultLevelFromResultKind(kind),
            message: formatSarifResultMessage(node, kind),
            locations: [
                {
                    physicalLocation: {
                        artifactLocation: getArtifactLocation(environmentData),
                        region: {
                            startLine: 1,
                            startColumn: 1,
                            endColumn: 1,
                            snippet: {
                                text: node.html,
                            },
                        },
                    },
                    logicalLocations: this.getLogicalLocations(node),
                },
            ],
        };
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
                        text: ruleResult.description + '.',
                    },
                    locations: [],
                });
            }
        }
    }

    private getResultLevelFromResultKind(kind: Sarif.Result.kind) {
        return kind === 'fail' ? 'error' : 'none';
    }
}
