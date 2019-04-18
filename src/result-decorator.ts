// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import {
    DecoratedAxeResult,
    DecoratedAxeResults,
} from './decorated-axe-results';
import { DictionaryStringTo } from './dictionary-types';
import { WCAGLinkData } from './wcag-link-data';

export class ResultDecorator {
    constructor(private wcagConfiguration: DictionaryStringTo<WCAGLinkData>) {}

    public decorateResults(results: Axe.AxeResults): DecoratedAxeResults {
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
        ruleResults: Axe.Result[],
    ): DecoratedAxeResult[] {
        return ruleResults.map<DecoratedAxeResult>((result: Axe.Result) => {
            return {
                ...result,
                WCAG: this.getRelatedWcagByRuleTags(result.tags),
            };
        });
    }

    private getRelatedWcagByRuleTags(tags: string[]): WCAGLinkData[] {
        return tags
            .map(tag => this.wcagConfiguration[tag])
            .filter(wcag => wcag != undefined);
    }
}
