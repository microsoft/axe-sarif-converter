// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { DictionaryStringTo } from './dictionary-types';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

export class RawResultToRuleConverter {
    private readonly ruleIdsToRuleIndices: DictionaryStringTo<number> = {};
    private readonly rulesDictionary: DictionaryStringTo<
        Sarif.ReportingDescriptor
    > = {};
    private sortedRuleIds: string[] = [];

    constructor(
        results: AxeRawResult[],
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
        results: AxeRawResult[],
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
    ): void {
        for (const result of results) {
            this.rulesDictionary[result.id] = this.axeRawResultToSarifRule(
                axeTags,
                wcagTagsToTaxaIndices,
                result,
            );
        }
    }

    private axeRawResultToSarifRule(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        axeRawResult: AxeRawResult,
    ): Sarif.ReportingDescriptor {
        return {
            id: axeRawResult.id,
            name: axeRawResult.help,
            fullDescription: {
                text: axeRawResult.description + '.',
            },
            helpUri: axeRawResult.helpUrl,
            relationships: this.getRuleRelationshipsFromResultTags(
                axeTags,
                wcagTagsToTaxaIndices,
                axeRawResult,
            ),
        };
    }

    private getRuleRelationshipsFromResultTags(
        axeTags: string[],
        wcagTagsToTaxaIndices: DictionaryStringTo<number>,
        result: AxeRawResult,
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
