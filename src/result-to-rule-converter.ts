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

    public getRulePropertiesFromResults(
        results: DecoratedAxeResults,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): Sarif.ReportingDescriptor[] {
        const rulesDictionary: DictionaryStringTo<
            Sarif.ReportingDescriptor
        > = this.convertResultsToRules(results, axeTags, wcagTagsToTaxaIndices);
        const sortedRuleIds: string[] = this.sortRuleIds(rulesDictionary);
        this.indexRuleIds(sortedRuleIds);
        return sortedRuleIds.map(ruleId => rulesDictionary[ruleId]);
    }

    public getRuleIdsToRuleIndices(): DictionaryStringTo<number> {
        return this.ruleIdsToRuleIndices;
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
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): DictionaryStringTo<Sarif.ReportingDescriptor> {
        const rulesDictionary: DictionaryStringTo<
            Sarif.ReportingDescriptor
        > = {};

        this.convertRuleResultsToRules(
            rulesDictionary,
            axeTags,
            wcagTagsToTaxaIndices,
            results.violations,
        );
        this.convertRuleResultsToRules(
            rulesDictionary,
            axeTags,
            wcagTagsToTaxaIndices,
            results.passes,
        );
        this.convertRuleResultsToRules(
            rulesDictionary,
            axeTags,
            wcagTagsToTaxaIndices,
            results.inapplicable,
        );
        this.convertRuleResultsToRules(
            rulesDictionary,
            axeTags,
            wcagTagsToTaxaIndices,
            results.incomplete,
        );

        return rulesDictionary;
    }

    private convertRuleResultsToRules(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        ruleResults: DecoratedAxeResult[],
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResultToRule(
                    rulesDictionary,
                    axeTags,
                    wcagTagsToTaxaIndices,
                    ruleResult,
                );
            }
        }
    }

    private convertRuleResultToRule(
        rulesDictionary: DictionaryStringTo<Sarif.ReportingDescriptor>,
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
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
                relationships: this.getRelationshipsFromResultTags(
                    axeTags,
                    wcagTagsToTaxaIndices,
                    ruleResult,
                ),
            };
            rulesDictionary[ruleResult.id] = rule;
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
