// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AxeResults } from 'axe-core';
import * as fs from 'fs';
import { axeToSarif } from './index';

describe('Azure DevOps sarif viewer extension test', () => {
    it('save sarif file to artifact to be shown by sarif viewer tab', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe322-v2.dequemars-testsite.1554329251110.json',
            'utf8',
        );
        const axeResultStub: AxeResults = JSON.parse(axeJSON) as AxeResults;
        fs.mkdir('./test-results', () => {
            fs.writeFileSync(
                './test_result.sarif',
                JSON.stringify(axeToSarif(axeResultStub)),
            );
        });
    });
});
