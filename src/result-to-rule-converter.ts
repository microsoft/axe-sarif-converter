// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { DictionaryStringTo } from './dictionary-types';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

export class ResultToRuleConverter {
    private readonly ruleIdsToRuleIndices: DictionaryStringTo<number> = {};
    private readonly rulesDictionary: DictionaryStringTo<
        Sarif.ReportingDescriptor
    > = {};
    private sortedRuleIds: string[] = [];

    static fromV2Results(
        results: Axe.AxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): ResultToRuleConverter {
        const rulesDictionary: DictionaryStringTo<
            Sarif.ReportingDescriptor
        > = {};
        ResultToRuleConverter.convertResultsToRules(
            results,
            axeTags,
            wcagTagsToTaxaIndices,
            rulesDictionary,
        );
        return new ResultToRuleConverter(rulesDictionary);
    }
    constructor(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ) {
        this.rulesDictionary = rulesDictionary;
        this.sortRuleIds();
        this.indexRuleIds();
    }

    public getRulePropertiesFromResults(): Sarif.ReportingDescriptor[] {
        return this.sortedRuleIds.map(ruleId => this.rulesDictionary[ruleId]);
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

    static convertResultsToRules(
        results: Axe.AxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ): void {
        ResultToRuleConverter.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.violations,
            rulesDictionary,
        );
        ResultToRuleConverter.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.passes,
            rulesDictionary,
        );
        ResultToRuleConverter.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.inapplicable,
            rulesDictionary,
        );
        ResultToRuleConverter.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.incomplete,
            rulesDictionary,
        );
    }

    static convertRuleResultsToRules(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        ruleResults: Axe.Result[],
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                ResultToRuleConverter.convertRuleResultToRule(
                    axeTags,
                    wcagTagsToTaxaIndices,
                    ruleResult,
                    rulesDictionary,
                );
            }
        }
    }

    static convertRuleResultToRule(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        ruleResult: Axe.Result,
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
    ): void {
        rulesDictionary[ruleResult.id] = {
            id: ruleResult.id,
            name: ruleResult.help,
            fullDescription: {
                text: ruleResult.description + '.',
            },
            helpUri: ruleResult.helpUrl,
            relationships: ResultToRuleConverter.getRelationshipsFromResultTags(
                axeTags,
                wcagTagsToTaxaIndices,
                ruleResult,
            ),
        };
    }

    static getRelationshipsFromResultTags(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        result: Axe.Result,
    ) {
        return result.tags
            .filter(tag => axeTags.indexOf(tag) != -1)
            .map(tag => {
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
