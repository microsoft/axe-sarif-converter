// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ConverterOptions } from './converter-options';
import {
    AxeCoreRuleResult,
    AxeNodeResult,
    FormattedCheckResult,
    ScannerResults,
} from './ruleresults';
import * as CustomSarif from './sarif/custom-sarif-types';
import { SarifLog } from './sarif/sarifLog';
import * as Sarif from './sarif/sarifv2';
import { StringUtils } from './string-utils';

export class SarifConverter {
    constructor() {}

    public convert(
        results: ScannerResults,
        options: ConverterOptions,
    ): SarifLog {
        return {
            version: CustomSarif.SarifLogVersion.v2,
            runs: [this.convertRun(results, options)],
        };
    }

    private convertRun(
        results: ScannerResults,
        options: ConverterOptions,
    ): Sarif.Run {
        const files: Record<string, Sarif.File> = {};
        files[results.targetPageUrl] = {
            mimeType: 'text/html',
            properties: {
                tags: ['target'],
                title: results.targetPageTitle,
            },
        };

        let properties: Record<string, string> = {};

        if (options && options.scanName !== undefined) {
            properties = {
                scanName: options.scanName,
            };
        }

        const run: Sarif.Run = {
            tool: {
                name: 'axe',
                fullName: 'axe-core',
                semanticVersion: '3.2.2',
                version: '3.2.2',
                properties: {
                    downloadUri: 'https://www.deque.com/axe/',
                },
            },
            invocations: [
                {
                    startTime: results.timestamp,
                    endTime: results.timestamp,
                },
            ],
            files: files,
            results: this.convertResults(results, properties),
            resources: {
                rules: this.convertResultsToRules(results),
            },
            properties: {},
        };

        if (options && options.testCaseId !== undefined) {
            run.properties!.testCaseId = options.testCaseId;
        }

        if (options && options.scanId !== undefined) {
            run.logicalId = options.scanId;
        }

        return run;
    }

    private convertResults(
        results: ScannerResults,
        properties: Record<string, string>,
    ): Sarif.Result[] {
        const resultArray: Sarif.Result[] = [];

        this.convertRuleResults(
            resultArray,
            results.violations,
            CustomSarif.Result.level.error,
            results.targetPageUrl,
            properties,
        );
        this.convertRuleResults(
            resultArray,
            results.passes,
            CustomSarif.Result.level.pass,
            results.targetPageUrl,
            properties,
        );
        this.convertRuleResults(
            resultArray,
            results.incomplete,
            CustomSarif.Result.level.open,
            results.targetPageUrl,
            properties,
        );
        this.convertRuleResultsWithoutNodes(
            resultArray,
            results.inapplicable,
            CustomSarif.Result.level.notApplicable,
            properties,
        );

        return resultArray;
    }

    private convertRuleResults(
        resultArray: Sarif.Result[],
        ruleResults: AxeCoreRuleResult[],
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: Record<string, string>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResult(
                    resultArray,
                    ruleResult,
                    level,
                    targetPageUrl,
                    properties,
                );
            }
        }
    }

    private convertRuleResult(
        resultArray: Sarif.Result[],
        ruleResult: AxeCoreRuleResult,
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: Record<string, string>,
    ): void {
        const partialFingerprints: Record<
            string,
            string
        > = this.getPartialFingerprintsFromRule(ruleResult);

        for (const node of ruleResult.nodes) {
            const selector = node.target.join(';');
            resultArray.push({
                ruleId: ruleResult.id,
                level: level,
                message: this.convertMessage(node, level),
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

    private getPartialFingerprintsFromRule(
        ruleResult: AxeCoreRuleResult,
    ): Record<string, string> {
        return {
            ruleId: ruleResult.id,
        };
    }

    private convertMessage(
        node: AxeNodeResult,
        level: CustomSarif.Result.level,
    ): CustomSarif.Message {
        const textArray: string[] = [];
        const richTextArray: string[] = [];

        if (level === CustomSarif.Result.level.error) {
            const allAndNone = node.all.concat(node.none);
            this.convertMessageChecks(
                'Fix all of the following:',
                allAndNone,
                textArray,
                richTextArray,
            );
            this.convertMessageChecks(
                'Fix any of the following:',
                node.any,
                textArray,
                richTextArray,
            );
        } else {
            const allNodes = node.all.concat(node.none).concat(node.any);
            this.convertMessageChecks(
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

    private convertMessageChecks(
        heading: string,
        checkResults: FormattedCheckResult[],
        textArray: string[],
        richTextArray: string[],
    ): void {
        if (checkResults.length > 0) {
            const textLines: string[] = [];
            const richTextLines: string[] = [];

            textLines.push(heading);
            richTextLines.push(this.escapeForMarkdown(heading));

            for (const checkResult of checkResults) {
                const message = StringUtils.isNotEmpty(checkResult.message)
                    ? checkResult.message
                    : checkResult.id;

                textLines.push(message + '.');
                richTextLines.push('- ' + this.escapeForMarkdown(message));
            }

            textArray.push(textLines.join(' '));
            richTextArray.push(richTextLines.join('\n'));
        }
    }

    private escapeForMarkdown(s: string): string {
        return s ? s.replace(/</g, '&lt;') : '';
    }

    private convertRuleResultsWithoutNodes(
        resultArray: Sarif.Result[],
        ruleResults: AxeCoreRuleResult[],
        level: CustomSarif.Result.level,
        properties: Record<string, string>,
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                const partialFingerprints = this.getPartialFingerprintsFromRule(
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

    private convertResultsToRules(
        results: ScannerResults,
    ): Record<string, Sarif.Rule> {
        const rulesDictionary: Record<string, Sarif.Rule> = {};

        this.convertRuleResultsToRules(rulesDictionary, results.violations);
        this.convertRuleResultsToRules(rulesDictionary, results.passes);
        this.convertRuleResultsToRules(rulesDictionary, results.inapplicable);
        this.convertRuleResultsToRules(rulesDictionary, results.incomplete);

        return rulesDictionary;
    }

    private convertRuleResultsToRules(
        rulesDictionary: Record<string, Sarif.Rule>,
        ruleResults: AxeCoreRuleResult[],
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResultToRule(rulesDictionary, ruleResult);
            }
        }
    }

    private convertRuleResultToRule(
        rulesDictionary: Record<string, Sarif.Rule>,
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
                helpUri: ruleResult.helpUrl,
                properties: {},
            };
            rulesDictionary[ruleResult.id] = rule;
        }
    }
}

export interface AxeCoreStandard {
    standardName: CustomSarif.Message;
    requirementName: CustomSarif.Message;
    requirementId: string;
    requirementUri: string;
}
