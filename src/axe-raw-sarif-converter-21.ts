// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { isEmpty } from './array-utils';
import {
    getArtifactLocation,
    getArtifactProperties,
} from './artifact-property-provider';
import { AxeRawNodeResult, AxeRawResult, ResultValue } from './axe-raw-result';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { DictionaryStringTo } from './dictionary-types';
import { EnvironmentData } from './environment-data';
import { getInvocations21 } from './invocation-provider-21';
import { ResultToRuleConverter } from './result-to-rule-converter';
import { formatSarifResultMessage } from './sarif-result-message-formatter';
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
        const resultToRuleConverter: ResultToRuleConverter = ResultToRuleConverter.fromRawResults(
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
            invocations: this.invocationConverter(environmentData),
            artifacts: [this.getArtifactProperties(environmentData)],
            results: this.convertRawResults(
                results,
                resultToRuleConverter.getRuleIdsToRuleIndices(),
                environmentData,
            ),
            taxonomies: [
                getWcagTaxonomy(
                    this.wcagLinkDataIndexer.getSortedWcagTags(),
                    this.tagsToWcagLinkData,
                ),
            ],
        };
    }

    private convertRawResults(
        results: AxeRawResult[],
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
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
                        ruleIdsToRuleIndices,
                        environmentData,
                        result.id,
                    ),
                );
            }
            if (axeRawNodeResultArrays.every(isEmpty)) {
                resultArray.push(
                    this.generateResultForInapplicableRule(
                        ruleIdsToRuleIndices,
                        result.id,
                        result.description,
                    ),
                );
            }
        }

        return resultArray;
    }

    private convertRawNodeResults(
        rawNodeResults: AxeRawNodeResult[],
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        environmentData: EnvironmentData,
        ruleId: string,
    ): Sarif.Result[] {
        if (rawNodeResults) {
            return rawNodeResults.map(rawNodeResult =>
                this.convertRawNodeResult(
                    rawNodeResult,
                    ruleIdsToRuleIndices,
                    environmentData,
                    ruleId,
                ),
            );
        }
        return [];
    }

    private convertRawNodeResult(
        axeRawNodeResult: AxeRawNodeResult,
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        environmentData: EnvironmentData,
        ruleId: string,
    ): Sarif.Result {
        const kind = this.getSarifResultKind(axeRawNodeResult.result);

        return {
            ruleId: ruleId,
            ruleIndex: ruleIdsToRuleIndices[ruleId],
            kind: kind,
            level: this.getResultLevelFromResultKind(kind),
            message: formatSarifResultMessage(axeRawNodeResult, kind),
            locations: [
                {
                    physicalLocation: {
                        artifactLocation: getArtifactLocation(environmentData),
                        region: {
                            snippet: {
                                text: axeRawNodeResult.node.source,
                            },
                        },
                    },
                    logicalLocations: this.getLogicalLocations(
                        axeRawNodeResult,
                    ),
                },
            ],
        };
    }

    private getLogicalLocations(
        node: AxeRawNodeResult,
    ): Sarif.LogicalLocation[] {
        const selector = this.getSelectorFromRawNode(node);
        const xpath = this.getXpathFromRawNode(node);
        const logicalLocations: Sarif.LogicalLocation[] = [
            this.formatLogicalLocation(selector),
        ];
        if (xpath) {
            logicalLocations.push(this.formatLogicalLocation(xpath));
        }
        return logicalLocations;
    }

    private formatLogicalLocation(name: string): Sarif.LogicalLocation {
        return {
            fullyQualifiedName: name,
            kind: 'element',
        };
    }

    private generateResultForInapplicableRule(
        ruleIdsToRuleIndices: DictionaryStringTo<number>,
        ruleId: string,
        ruleDescription: string,
    ): Sarif.Result {
        return {
            ruleId: ruleId,
            ruleIndex: ruleIdsToRuleIndices[ruleId],
            kind: 'notApplicable',
            level: 'none',
            message: {
                text: ruleDescription + '.',
            },
        };
    }

    private getSarifResultKind(resultValue?: ResultValue): Sarif.Result.kind {
        const resultToKindMapping: { [K in ResultValue]: Sarif.Result.kind } = {
            passed: 'pass',
            failed: 'fail',
            inapplicable: 'notApplicable',
            cantTell: 'open',
        };

        if (!resultValue) {
            throw new Error(
                'getSarifResultKind(resultValue): resultValue is undefined',
            );
        }

        return resultToKindMapping[resultValue];
    }

    private getSelectorFromRawNode(axeRawNodeResult: AxeRawNodeResult) {
        if (!axeRawNodeResult.node.selector) {
            throw new Error(
                'getSelectorFromRawNode: axe result contained a node with no selector',
            );
        }
        return axeRawNodeResult.node.selector.join(';');
    }

    private getXpathFromRawNode(axeRawNodeResult: AxeRawNodeResult) {
        if (!axeRawNodeResult.node.xpath) {
            throw new Error(
                'getXpathFromRawNode: axe result contained a node with no xpath',
            );
        }
        return axeRawNodeResult.node.xpath.join(';');
    }

    private getResultLevelFromResultKind(kind: Sarif.Result.kind) {
        return kind === 'fail' ? 'error' : 'none';
    }
}
