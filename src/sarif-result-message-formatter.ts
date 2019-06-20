// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { AxeRawCheckResult, AxeRawNodeResult } from './axe-raw-result';
import { escapeForMarkdown, isNotEmpty } from './string-utils';

export function formatSarifResultMessage(
    node: Axe.NodeResult | AxeRawNodeResult,
    kind: Sarif.Result.kind,
): Sarif.Message {
    const textArray: string[] = [];
    const markdownArray: string[] = [];

    if (kind === 'fail') {
        const allAndNone = (node.all as any).concat(node.none);
        formatSarifCheckResultsMessage(
            'Fix all of the following:',
            allAndNone,
            textArray,
            markdownArray,
        );
        formatSarifCheckResultsMessage(
            'Fix any of the following:',
            node.any,
            textArray,
            markdownArray,
        );
    } else {
        const allNodes = (node.all as any).concat(node.none).concat(node.any);
        formatSarifCheckResultsMessage(
            'The following tests passed:',
            allNodes,
            textArray,
            markdownArray,
        );
    }

    return {
        text: textArray.join(' '),
        markdown: markdownArray.join('\n\n'),
    };
}

function formatSarifCheckResultsMessage(
    heading: string,
    checkResults: Axe.CheckResult[] | AxeRawCheckResult[],
    textArray: string[],
    markdownArray: string[],
): void {
    if (checkResults.length > 0) {
        const textLines: string[] = [];
        const markdownLines: string[] = [];

        textLines.push(heading);
        markdownLines.push(escapeForMarkdown(heading));

        for (const checkResult of checkResults) {
            const message = isNotEmpty(checkResult.message)
                ? checkResult.message
                : checkResult.id;

            textLines.push(message + '.');
            markdownLines.push('- ' + escapeForMarkdown(message) + '.');
        }

        textArray.push(textLines.join(' '));
        markdownArray.push(markdownLines.join('\n'));
    }
}
