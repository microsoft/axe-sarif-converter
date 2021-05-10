// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { DictionaryStringTo } from './dictionary-types';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

export class ResultToRuleConverter {
    private readonly ruleIdsToRuleIndices: DictionaryStringTo<number> = {};
    private readonly rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor> =
        {};
    private sortedRuleIds: string[] = [];

    public static fromRawResults(
        results: AxeRawResult[],
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): ResultToRuleConverter {
        const rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor> =
            {};
        ResultToRuleConverter.convertResultsToRules(
            results,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
        return new ResultToRuleConverter(rulesDictionary);
    }
    public static fromV2Results(
        results: Axe.AxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): ResultToRuleConverter {
        const rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor> =
            {};
        ResultToRuleConverter.convertV2ResultsToRules(
            results,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
        return new ResultToRuleConverter(rulesDictionary);
    }
    private constructor(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ) {
        this.rulesDictionary = rulesDictionary;
        this.sortRuleIds();
        this.indexRuleIds();
    }

    public getRulePropertiesFromResults(): Sarif.ReportingDescriptor[] {
        return this.sortedRuleIds.map((ruleId) => this.rulesDictionary[ruleId]);
    }

    public getRuleIdsToRuleIndices(): DictionaryStringTo<number> {
        return this.ruleIdsToRuleIndices;
    }

    private sortRuleIds(): void {
        this.sortedRuleIds = Object.keys(this.rulesDictionary).sort();
    }

    private indexRuleIds() {
        for (let i = 0; i < this.sortedRuleIds.length; i++) {
            this.ruleIdsToRuleIndices[this.sortedRuleIds[i]] = i;
        }
    }

    private static convertV2ResultsToRules(
        results: Axe.AxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ): void {
        ResultToRuleConverter.convertResultsToRules(
            results.violations,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
        ResultToRuleConverter.convertResultsToRules(
            results.passes,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
        ResultToRuleConverter.convertResultsToRules(
            results.inapplicable,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
        ResultToRuleConverter.convertResultsToRules(
            results.incomplete,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
    }

    private static convertResultsToRules(
        results: Axe.Result[] | AxeRawResult[],
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ): void {
        if (results) {
            for (const result of results) {
                rulesDictionary[result.id] =
                    ResultToRuleConverter.convertAxeResultToSarifRule(
                        axeTags,
                        wcagTagsToTaxaIndices,
                        result,
                    );
            }
        }
    }

    private static convertAxeResultToSarifRule(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        result: Axe.Result | AxeRawResult,
    ): Sarif.ReportingDescriptor {
        return {
            id: result.id,
            name: result.help,
            fullDescription: {
                text: result.description + '.',
            },
            helpUri: result.helpUrl,
            relationships:
                ResultToRuleConverter.getRuleRelationshipsFromResultTags(
                    axeTags,
                    wcagTagsToTaxaIndices,
                    result,
                ),
        };
    }

    private static getRuleRelationshipsFromResultTags(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        result: Axe.Result | AxeRawResult,
    ) {
        return result.tags
            .filter((tag) => axeTags.indexOf(tag) != -1)
            .map((tag) => {
                return {
                    target: {
                        id: tag,
                        index: wcagTagsToTaxaIndices[tag],
                        toolComponent: getWcagTaxonomyReference(),
                    },
                    kinds: ['superset'],
                };
            });
    }
}
