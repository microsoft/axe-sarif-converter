// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { getAxeToolSupportedTaxonomy } from './axe-tool-property-provider-21';
import {
    DecoratedAxeResult,
    DecoratedAxeResults,
} from './decorated-axe-results';
import { DictionaryStringTo } from './dictionary-types';

export class ResultToRuleConverter {
    private readonly ruleIdsToRuleIndices: DictionaryStringTo<number> = {};
    private readonly rulesDictionary: DictionaryStringTo<
        Sarif.ReportingDescriptor
    > = {};
    private sortedRuleIds: string[] = [];

    constructor(
        results: DecoratedAxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ) {
        this.convertResultsToRules(results, axeTags, wcagTagsToTaxaIndices);
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

    private convertResultsToRules(
        results: DecoratedAxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): void {
        this.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.violations,
        );
        this.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.passes,
        );
        this.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.inapplicable,
        );
        this.convertRuleResultsToRules(
            axeTags,
            wcagTagsToTaxaIndices,
            results.incomplete,
        );
    }

    private convertRuleResultsToRules(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        ruleResults: DecoratedAxeResult[],
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResultToRule(
                    axeTags,
                    wcagTagsToTaxaIndices,
                    ruleResult,
                );
            }
        }
    }

    private convertRuleResultToRule(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        ruleResult: DecoratedAxeResult,
    ): void {
        if (!this.rulesDictionary.hasOwnProperty(ruleResult.id)) {
            const rule: Sarif.ReportingDescriptor = {
                id: ruleResult.id,
                name: ruleResult.help,
                fullDescription: {
                    text: ruleResult.description,
                },
                helpUri: ruleResult.helpUrl,
                relationships: this.getRelationshipsFromResultTags(
                    axeTags,
                    wcagTagsToTaxaIndices,
                    ruleResult,
                ),
            };
            this.rulesDictionary[ruleResult.id] = rule;
        }
    }

    private getRelationshipsFromResultTags(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        result: DecoratedAxeResult,
    ) {
        return result.tags
            .filter(tag => axeTags.indexOf(tag) != -1)
            .map(tag => {
                return {
                    target: {
                        id: tag,
                        index: wcagTagsToTaxaIndices[tag],
                        toolComponent: getAxeToolSupportedTaxonomy(),
                    },
                    kinds: ['superset'],
                };
            });
    }
}
