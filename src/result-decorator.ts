// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { DictionaryStringTo } from './dictionary-types';
import { AxeCoreRuleResult, AxeRule, ScannerResults } from './ruleresults';
import { WCAG } from './wcag';

export class ResultDecorator {
    constructor(private wcagConfiguration: DictionaryStringTo<WCAG[]>) {}

    public decorateResults(results: Axe.AxeResults): ScannerResults {
        return {
            passes: this.decorateAxeRuleResults(results.passes),
            violations: this.decorateAxeRuleResults(results.violations),
            inapplicable: this.decorateAxeRuleResults(results.inapplicable),
            incomplete: this.decorateAxeRuleResults(results.incomplete),
            timestamp: results.timestamp,
            targetPageUrl: results.url,
            targetPageTitle: '', // TODO - missing title
        };
    }

    private decorateAxeRuleResults(
        ruleResults: AxeRule[],
    ): AxeCoreRuleResult[] {
        return ruleResults.map<AxeCoreRuleResult>((result: AxeRule) => {
            return { ...result, WCAG: this.getRelatedWCAGByRuleId(result.id) };
        });
    }

    private getRelatedWCAGByRuleId(ruleId: string): WCAG[] {
        return this.wcagConfiguration[ruleId];
    }
}
