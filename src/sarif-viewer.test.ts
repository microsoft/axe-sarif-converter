// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults } from 'axe-core';
import * as fs from 'fs';
import { convertAxeToSarif } from './index';

describe('Azure DevOps sarif viewer extension test', () => {
    it('save sarif file to artifact to be shown by sarif viewer tab', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/w3citylights-axe-v3.3.2.reporter-v2.json',
            'utf8',
        );
        const axeResult: AxeResults = JSON.parse(axeJSON) as AxeResults;
        if (!fs.existsSync('./test-results')) {
            fs.mkdirSync('./test-results');
        }

        fs.writeFileSync(
            './test-results/test_result.sarif',
            JSON.stringify(convertAxeToSarif(axeResult)),
            {
                encoding: 'utf8',
            },
        );
    });
});
