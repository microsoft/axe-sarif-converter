// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {
    AxeResults,
    Result,
    RunOptions,
    TestEngine,
    TestEnvironment,
    TestRunner,
} from 'axe-core';
import * as fs from 'fs';
import { convertAxeToSarif } from './index';
import { Run } from './sarif/sarif-2.0.0';
import { SarifLog } from './sarif/sarif-log';

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

        expect(convertAxeToSarif(axeResultStub)).toBeDefined();
        expect(convertAxeToSarif(axeResultStub)).toEqual(expected);
    });
});

describe('axeToSarifConverter use generated AxeResults object', () => {
    it('matches pinned snapshot of sarifv2 generated from an actual AxeResults object', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe-v3.2.2.reporter-v2.json',
            'utf8',
        );
        const axeResultStub: AxeResults = JSON.parse(axeJSON) as AxeResults;
        expect(convertAxeToSarif(axeResultStub)).toMatchSnapshot();
    });
});
