// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { DictionaryStringTo } from './dictionary-types';
import { Processor } from './processor';
import { AxeCoreRuleResult, AxeRule, ScannerResults } from './ruleresults';
import { WCAG } from './wcag';

export class ResultDecorator {
    constructor(private wcagConfiguration: DictionaryStringTo<WCAG[]>) {}

    public decorateResults(results: Axe.AxeResults): ScannerResults {
        return {
            passes: this.decorateAxeRuleResults(results.passes),
            violations: this.decorateAxeRuleResults(results.violations),
            inapplicable: this.decorateAxeRuleResults(
                results.inapplicable,
                true,
            ),
            incomplete: this.decorateAxeRuleResults(results.incomplete),
            timestamp: results.timestamp,
            targetPageUrl: results.url,
            targetPageTitle: '', // TODO - missing title
        };
    }

    private decorateAxeRuleResults(
        ruleResults: AxeRule[],
        isInapplicable: boolean = false,
    ): AxeCoreRuleResult[] {
        return ruleResults.reduce<AxeCoreRuleResult[]>(
            (filteredArray, result: AxeRule) => {
                const processedResult = Processor.suppressChecksByMessages(
                    result,
                    !isInapplicable,
                );

                if (processedResult !== undefined) {
                    filteredArray.push({
                        ...processedResult,
                        WCAG: this.getRelatedWCAGByRuleId(result.id),
                    });
                }

                return filteredArray;
            },
            [],
        );
    }

    private getRelatedWCAGByRuleId(ruleId: string): WCAG[] {
        return this.wcagConfiguration[ruleId];
    }
}
