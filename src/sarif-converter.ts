import { DictionaryStringTo } from './dictionary-types';
import { ScannerOptions } from './exposed-apis';
import {
    AxeNodeResult,
    FormattedCheckResult,
    ScannerResults,
    AxeCoreRuleResult,
} from './ruleresults';
import { WCAG, WCAGData } from './wcag';
import * as CustomSarif from './sarif/custom-sarif-types';
import { ISarifLog } from './sarif/isarflog';
import * as Sarif from './sarif/sarifv2';
import { StringUtils } from './string-utils';

export class SarifConverter {
    private wcagList: WCAGData;

    constructor(wcagList: WCAGData) {
        this.wcagList = wcagList;
    }

    public convert(
        results: ScannerResults,
        options: ScannerOptions,
    ): ISarifLog {
        const log: ISarifLog = {
            version: CustomSarif.SarifLogVersion.v2,
            runs: [this._convertRun(results, options)],
        };
        return log;
    }

    private _convertRun(
        results: ScannerResults,
        options: ScannerOptions,
    ): Sarif.Run {
        const files: DictionaryStringTo<Sarif.File> = {};
        files[results.targetPageUrl] = {
            mimeType: 'text/html',
            properties: {
                tags: ['target'],
                title: results.targetPageTitle,
            },
        };

        let properties: DictionaryStringTo<string> = {};

        if (options && options.scanName !== undefined) {
            properties = {
                scanName: options.scanName,
            };
        }

        const run: Sarif.Run = {
            tool: {
                name: 'Scanner',
                fullName: 'Scanner',
                semanticVersion: '1.0.0',
                version: '1.0.0',
                properties: {
                    downloadUri: 'https://accessibilityinsights.io',
                },
            },
            invocations: [
                {
                    startTime: results.timestamp,
                    endTime: results.timestamp,
                },
            ],
            files: files,
            results: this._convertResults(results, properties),
            resources: {
                rules: this._convertResultsToRules(results),
            },
            properties: {
                standards: this._convertStandards(),
            },
        };

        if (options && options.testCaseId !== undefined) {
            run.properties!.testCaseId = options.testCaseId;
        }

        if (options && options.scanId !== undefined) {
            run.logicalId = options.scanId;
        }

        return run;
    }

    private _convertResults(
        results: ScannerResults,
        properties: DictionaryStringTo<string>,
    ): Sarif.Result[] {
        const resultArray: Sarif.Result[] = [];

        this._convertRuleResults(
            resultArray,
            results.violations,
            CustomSarif.Result.level.error,
            results.targetPageUrl,
            properties,
        );
        this._convertRuleResults(
            resultArray,
            results.passes,
            CustomSarif.Result.level.pass,
            results.targetPageUrl,
            properties,
        );
        this._convertRuleResults(
            resultArray,
            results.incomplete,
            CustomSarif.Result.level.open,
            results.targetPageUrl,
            properties,
        );
        this._convertRuleResultsWithoutNodes(
            resultArray,
            results.inapplicable,
            CustomSarif.Result.level.notApplicable,
            properties,
        );

        return resultArray;
    }

    private _convertRuleResults(
        resultArray: Sarif.Result[],
        ruleResults: AxeCoreRuleResult[],
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: DictionaryStringTo<string>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this._convertRuleResult(
                    resultArray,
                    ruleResult,
                    level,
                    targetPageUrl,
                    properties,
                );
            }
        }
    }

    private _convertRuleResult(
        resultArray: Sarif.Result[],
        ruleResult: AxeCoreRuleResult,
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: DictionaryStringTo<string>,
    ): void {
        const partialFingerprints: DictionaryStringTo<
            string
        > = this._getPartialFingerprintsFromRule(ruleResult);

        for (const node of ruleResult.nodes) {
            const selector = node.target.join(';');
            resultArray.push({
                ruleId: ruleResult.id,
                level: level,
                message: this._convertMessage(node, level),
                locations: [
                    {
                        physicalLocation: {
                            fileLocation: {
                                uri: targetPageUrl,
                            },
                        },
                        fullyQualifiedLogicalName: selector,
                        annotations: [
                            {
                                snippet: {
                                    text: node.html,
                                },
                            },
                        ],
                    },
                ],
                properties: {
                    ...properties,
                    tags: ['Accessibility'],
                },
                partialFingerprints: {
                    fullyQualifiedLogicalName: selector,
                    ...partialFingerprints,
                },
            });
        }
    }

    private _getPartialFingerprintsFromRule(
        ruleResult: AxeCoreRuleResult,
    ): DictionaryStringTo<string> {
        return {
            ruleId: ruleResult.id,
        };
    }

    private _convertMessage(
        node: AxeNodeResult,
        level: CustomSarif.Result.level,
    ): CustomSarif.Message {
        const textArray: string[] = [];
        const richTextArray: string[] = [];

        if (level === CustomSarif.Result.level.error) {
            const allAndNone = node.all.concat(node.none);
            this._convertMessageChecks(
                'Fix all of the following:',
                allAndNone,
                textArray,
                richTextArray,
            );
            this._convertMessageChecks(
                'Fix any of the following:',
                node.any,
                textArray,
                richTextArray,
            );
        } else {
            const allNodes = node.all.concat(node.none).concat(node.any);
            this._convertMessageChecks(
                'The following tests passed:',
                allNodes,
                textArray,
                richTextArray,
            );
        }

        return {
            text: textArray.join(' '),
            richText: richTextArray.join('\n\n'),
        };
    }

    private _convertMessageChecks(
        heading: string,
        checkResults: FormattedCheckResult[],
        textArray: string[],
        richTextArray: string[],
    ): void {
        if (checkResults.length > 0) {
            const textLines: string[] = [];
            const richTextLines: string[] = [];

            textLines.push(heading);
            richTextLines.push(this._escapeForMarkdown(heading));

            for (const checkResult of checkResults) {
                const message = StringUtils.isNotEmpty(checkResult.message)
                    ? checkResult.message
                    : checkResult.id;

                textLines.push(message + '.');
                richTextLines.push('- ' + this._escapeForMarkdown(message));
            }

            textArray.push(textLines.join(' '));
            richTextArray.push(richTextLines.join('\n'));
        }
    }

    private _escapeForMarkdown(s: string): string {
        return s ? s.replace(/</g, '&lt;') : '';
    }

    private _convertRuleResultsWithoutNodes(
        resultArray: Sarif.Result[],
        ruleResults: AxeCoreRuleResult[],
        level: CustomSarif.Result.level,
        properties: DictionaryStringTo<string>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                const partialFingerprints = this._getPartialFingerprintsFromRule(
                    ruleResult,
                );
                resultArray.push({
                    ruleId: ruleResult.id,
                    level: level,
                    properties: {
                        ...properties,
                        tags: ['Accessibility'],
                    },
                    partialFingerprints: partialFingerprints,
                });
            }
        }
    }

    private _convertResultsToRules(
        results: ScannerResults,
    ): DictionaryStringTo<Sarif.Rule> {
        const rulesDictionary: DictionaryStringTo<Sarif.Rule> = {};

        this._convertRuleResultsToRules(rulesDictionary, results.violations);
        this._convertRuleResultsToRules(rulesDictionary, results.passes);
        this._convertRuleResultsToRules(rulesDictionary, results.inapplicable);
        this._convertRuleResultsToRules(rulesDictionary, results.incomplete);

        return rulesDictionary;
    }

    private _convertRuleResultsToRules(
        rulesDictionary: DictionaryStringTo<Sarif.Rule>,
        ruleResults: AxeCoreRuleResult[],
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this._convertRuleResultToRule(rulesDictionary, ruleResult);
            }
        }
    }

    private _convertRuleResultToRule(
        rulesDictionary: DictionaryStringTo<Sarif.Rule>,
        ruleResult: AxeCoreRuleResult,
    ): void {
        if (!rulesDictionary.hasOwnProperty(ruleResult.id)) {
            const rule: Sarif.Rule = {
                id: ruleResult.id,
                name: {
                    text: ruleResult.help,
                },
                fullDescription: {
                    text: ruleResult.description,
                },
                helpUri: ruleResult.chiselHelpUrl,
                properties: {
                    standards: this._convertStandardsForRule(ruleResult.WCAG!),
                },
            };
            rulesDictionary[ruleResult.id] = rule;
        }
    }

    private _convertStandardsForRule(wcagList: WCAG[]): string[] {
        const standards: string[] = [];
        if (wcagList !== undefined) {
            for (const wcag of wcagList) {
                standards.push(wcag.text);
            }
        }
        return standards;
    }

    private _convertStandards(): DictionaryStringTo<KerosStandard> {
        const standards: DictionaryStringTo<KerosStandard> = {};
        // tslint:disable-next-line:forin
        for (const key in this.wcagList) {
            const wcag = this.wcagList[key];
            if (wcag.title === undefined) {
                continue;
            }

            standards[wcag.text] = {
                standardName: {
                    text: 'WCAG',
                },
                requirementName: {
                    text: wcag.title,
                },
                requirementId: wcag.text,
                requirementUri: wcag.url!,
            };
        }
        return standards;
    }
}

// tslint:disable-next-line:interface-name
export interface KerosStandard {
    standardName: CustomSarif.Message;
    requirementName: CustomSarif.Message;
    requirementId: string;
    requirementUri: string;
}
