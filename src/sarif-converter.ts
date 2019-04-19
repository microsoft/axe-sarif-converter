// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { ConverterOptions } from './converter-options';
import {
    DecoratedAxeResult,
    DecoratedAxeResults,
} from './decorated-axe-results';
import { DictionaryStringTo } from './dictionary-types';
import { EnvironmentData } from './environment-data';
import { getEnvironmentData } from './environment-data-provider';
import { getInvocations } from './invocation-provider';
import * as CustomSarif from './sarif/custom-sarif-types';
import * as Sarif from './sarif/sarif-2.0.0';
import { SarifLog } from './sarif/sarif-log';
import { isNotEmpty } from './string-utils';

export function defaultSarifConverter(): SarifConverter {
    return new SarifConverter(getInvocations);
}

export class SarifConverter {
    public constructor(
        private invocationConverter: (
            environmentData: EnvironmentData,
        ) => Sarif.Invocation[],
    ) {}

    public convert(
        results: DecoratedAxeResults,
        options: ConverterOptions,
    ): SarifLog {
        return {
            version: CustomSarif.SarifLogVersion.v2,
            runs: [this.convertRun(results, options)],
        };
    }

    private convertRun(
        results: DecoratedAxeResults,
        options: ConverterOptions,
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
                name: 'axe',
                fullName: 'axe-core',
                semanticVersion: '3.2.2',
                version: '3.2.2',
                properties: {
                    downloadUri: 'https://www.deque.com/axe/',
                },
            },
            invocations: this.invocationConverter(getEnvironmentData(results)),
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
        results: DecoratedAxeResults,
        properties: DictionaryStringTo<string>,
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
        ruleResults: DecoratedAxeResult[],
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: DictionaryStringTo<string>,
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
        ruleResult: DecoratedAxeResult,
        level: CustomSarif.Result.level,
        targetPageUrl: string,
        properties: DictionaryStringTo<string>,
    ): void {
        const partialFingerprints: DictionaryStringTo<
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
        ruleResult: DecoratedAxeResult,
    ): DictionaryStringTo<string> {
        return {
            ruleId: ruleResult.id,
        };
    }

    private convertMessage(
        node: Axe.NodeResult,
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
        checkResults: Axe.CheckResult[],
        textArray: string[],
        richTextArray: string[],
    ): void {
        if (checkResults.length > 0) {
            const textLines: string[] = [];
            const richTextLines: string[] = [];

            textLines.push(heading);
            richTextLines.push(this.escapeForMarkdown(heading));

            for (const checkResult of checkResults) {
                const message = isNotEmpty(checkResult.message)
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
        ruleResults: DecoratedAxeResult[],
        level: CustomSarif.Result.level,
        properties: DictionaryStringTo<string>,
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
        results: DecoratedAxeResults,
    ): DictionaryStringTo<Sarif.Rule> {
        const rulesDictionary: DictionaryStringTo<Sarif.Rule> = {};

        this.convertRuleResultsToRules(rulesDictionary, results.violations);
        this.convertRuleResultsToRules(rulesDictionary, results.passes);
        this.convertRuleResultsToRules(rulesDictionary, results.inapplicable);
        this.convertRuleResultsToRules(rulesDictionary, results.incomplete);

        return rulesDictionary;
    }

    private convertRuleResultsToRules(
        rulesDictionary: DictionaryStringTo<Sarif.Rule>,
        ruleResults: DecoratedAxeResult[],
    ): void {
        if (ruleResults) {
            for (const ruleResult of ruleResults) {
                this.convertRuleResultToRule(rulesDictionary, ruleResult);
            }
        }
    }

    private convertRuleResultToRule(
        rulesDictionary: DictionaryStringTo<Sarif.Rule>,
        ruleResult: DecoratedAxeResult,
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
