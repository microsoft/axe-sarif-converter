// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults } from 'axe-core';
import * as fs from 'fs';
import { ConverterOptions } from './converter-options';
import { convertAxeToSarif } from './index';
import { defaultSarifConverter21 } from './sarif-converter-21';

describe('Azure DevOps sarif viewer extension test', () => {
    it('save sarif file to artifact to be shown by sarif viewer tab', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe-v3.2.2.reporter-v2.json',
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

    it('save sarif v2.1 file to artifact to be shown by sarif viewer tab', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe-v3.2.2.reporter-v2.json',
            'utf8',
        );
        const axeResult: AxeResults = JSON.parse(axeJSON) as AxeResults;
        if (!fs.existsSync('./test-results')) {
            fs.mkdirSync('./test-results');
        }

        const options: ConverterOptions = {};
        fs.writeFileSync(
            './test-results/test_result_v2.1.sarif',
            JSON.stringify(
                defaultSarifConverter21().convert(axeResult, options),
            ),
            {
                encoding: 'utf8',
            },
        );
    });
});
