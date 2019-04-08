// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {
    AxeRawResult,
    AxeResults,
    Result,
    RunOptions,
    TestEngine,
    TestEnvironment,
    TestRunner,
} from 'axe-core';
import * as fs from 'fs';
import { axeRawToSarif, axeToSarif } from './index';
import { SarifLog } from './sarif/sarifLog';
import { Run } from './sarif/sarifv2';

describe('axe-sarf-converter integration test', () => {
    it('axe-sarif-converter returns a valid sarif with blank results array in run array', () => {
        const axeResultStub = {
            toolOptions: {} as RunOptions,
            testEngine: {} as TestEngine,
            testRunner: {} as TestRunner,
            testEnvironment: {} as TestEnvironment,
            url: 'https://example.com',
            timestamp: '2018-03-23T21:36:58.321Z',
            passes: [] as Result[],
            violations: [] as Result[],
            incomplete: [] as Result[],
            inapplicable: [] as Result[],
        };
        const expected: SarifLog = {
            version: '2.0.0',
            runs: [
                {
                    files: {
                        'https://example.com': {
                            mimeType: 'text/html',
                            properties: {
                                tags: ['target'],
                                title: '',
                            },
                        },
                    },
                    invocations: [
                        {
                            endTime: '2018-03-23T21:36:58.321Z',
                            startTime: '2018-03-23T21:36:58.321Z',
                        },
                    ],
                    properties: {},
                    resources: {
                        rules: {},
                    },
                    results: [],
                    tool: {
                        fullName: 'axe-core',
                        name: 'axe',
                        properties: {
                            downloadUri: 'https://www.deque.com/axe/',
                        },
                        semanticVersion: '3.2.2',
                        version: '3.2.2',
                    },
                },
            ] as Run[],
        };

        expect(axeToSarif(axeResultStub)).toBeDefined();
        expect(axeToSarif(axeResultStub)).toEqual(expected);
    });
});

describe('axeToSarifConverter use generated AxeResults object', () => {
    it('matches pinned snapshot of sarifv2 generated from an actual AxeResults object', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe322-v2.dequemars-testsite.1554329251110.json',
            'utf8',
        );
        const axeResultStub: AxeResults = JSON.parse(axeJSON) as AxeResults;
        expect(axeToSarif(axeResultStub)).toMatchSnapshot();
    });
});

describe('axeRawToSarifConverter uses generated AxeRawResults object', () => {
    it('matches pinned snapshot of sarifv2 generated from an actual AxeRawResults object', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe322-v2.dequemars-testsite.1554329251110.json',
            'utf8',
        );
        const axeResultStub: AxeResults = JSON.parse(axeJSON) as AxeResults;

        const axeRawJSON: string = fs.readFileSync(
            './src/test-resources/axe322-raw.dequemars-testsite.1554329251110.json',
            // './src/test-resources/axe322-v2.dequemars-testsite.1554329251110.json',
            'utf8',
        );
        const axeRawResultStub: AxeRawResult[] = JSON.parse(
            axeRawJSON,
        ) as AxeRawResult[];

        expect(axeRawToSarif(axeRawResultStub)).toEqual(
            axeToSarif(axeResultStub),
        );
    });
});
