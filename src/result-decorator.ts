import * as Axe from 'axe-core';
import { DictionaryStringTo } from './dictionary-types';
import { DocumentUtils } from './document-utils';
import { AxeRule, ScannerResults, AxeCoreRuleResult } from './ruleresults';
import { WCAG } from './wcag';
import { MessageDecorator } from './message-decorator';
import { Processor } from './processor';

export class ResultDecorator {
    private wcagConfiguration!: DictionaryStringTo<WCAG[]>;
    private _documentUtils: DocumentUtils;
    private _messageDecorator: MessageDecorator;

    constructor(
        documentUtils: DocumentUtils,
        messageDecorator: MessageDecorator,
        private getChiselHelpUrl: (rule: string) => string,
    ) {
        this._documentUtils = documentUtils;
        this._messageDecorator = messageDecorator;
    }

    public decorateResults(results: Axe.AxeResults): ScannerResults {
        const chiselResults: ScannerResults = {
            passes: this._decorateAxeRuleResults(results.passes),
            violations: this._decorateAxeRuleResults(results.violations),
            inapplicable: this._decorateAxeRuleResults(
                results.inapplicable,
                true,
            ),
            incomplete: this._decorateAxeRuleResults(results.incomplete),
            timestamp: results.timestamp,
            targetPageUrl: results.url,
            targetPageTitle: '', // TODO - missing title
        };

        return chiselResults;
    }

    public setWCAGConfiguration(
        configuration: DictionaryStringTo<WCAG[]>,
    ): void {
        this.wcagConfiguration = configuration;
    }

    private _decorateAxeRuleResults(
        ruleResults: AxeRule[],
        isInapplicable: boolean = false,
    ): AxeCoreRuleResult[] {
        return ruleResults.reduce<AxeCoreRuleResult[]>(
            (filteredArray, result: AxeRule) => {
                this._messageDecorator.decorateResultWithMessages(result);
                const processedResult = Processor.suppressChecksByMessages(
                    result,
                    !isInapplicable,
                );

                if (processedResult !== undefined) {
                    filteredArray.push({
                        ...processedResult,
                        WCAG: this.getRelatedWCAGByRuleId(result.id),
                        chiselHelpUrl: this.getChiselHelpUrl(result.id),
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
