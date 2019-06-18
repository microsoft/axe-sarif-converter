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
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { defaultAxeRawSarifConverter } from './axe-raw-sarif-converter';
import { ConverterOptions } from './converter-options';
import { EnvironmentData } from './environment-data';
import { convertAxeToSarif, sarifReporter } from './index';
import { ResultDecorator } from './result-decorator';
import { defaultSarifConverter21 } from './sarif-converter-21';
import { Run } from './sarif/sarif-2.0.0';
import { SarifLog } from './sarif/sarif-log';
import { axeTagsToWcagLinkData } from './wcag-link-data';

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

describe('axe-sarif-converter-21 integration test', () => {
    it('returns a valid v2.1 sarif log with expected properties', () => {
        const axeResultStub: AxeResults = {
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

        const actualResults: Sarif.Log = convertAxeToSarif21(axeResultStub);

        expect(actualResults).toBeDefined();
        expect(actualResults).toHaveProperty('version');
        expect(actualResults).toHaveProperty('runs');
    });
});

describe('axeToSarifConverter21', () => {
    it('converts basic AxeResults input to Sarif Log that matches sample output', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/basic-axe-v3.2.2-reporter-v2.json',
            'utf8',
        );
        const testSubject: AxeResults = JSON.parse(axeJSON) as AxeResults;

        const expectedResultsJSON: string = fs.readFileSync(
            './src/test-resources/basic-axe-v3.2.2-sarif-v2.1.2.sarif',
            'utf8',
        );
        const expectedResults: Sarif.Log = JSON.parse(
            expectedResultsJSON,
        ) as Sarif.Log;

        expect(convertAxeToSarif21(testSubject)).toEqual(expectedResults);
    });

    it('converts AxeResults input to sarif v2.1.2 log that matches a pinned snapshot of that sarif log', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe-v3.2.2.reporter-v2.json',
            'utf8',
        );
        const axeResultStub: AxeResults = JSON.parse(axeJSON) as AxeResults;
        expect(convertAxeToSarif21(axeResultStub)).toMatchSnapshot();
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

describe('sarifReporter', () => {
    it('runs the callback function with the returned sarif log from the axeRawSarifConverter', done => {
        const stubResults = [
            {
                id: 'stub_id',
            },
        ] as AxeRawResult[];

        const runOptions: RunOptions = {};
        const converterOptions: ConverterOptions = {};

        function callback(convertedSarifResults: SarifLog) {
            const expectedSarifResults = defaultAxeRawSarifConverter().convert(
                stubResults,
                converterOptions,
                getEnvironmentDataFromConvertedResults(convertedSarifResults),
            );
            expect(convertedSarifResults).toEqual(expectedSarifResults);
            done();
        }

        sarifReporter(stubResults, runOptions, callback);
    });

    function getEnvironmentDataFromConvertedResults(
        convertedResults: SarifLog,
    ): EnvironmentData {
        const invocations = convertedResults.runs[0].invocations;
        const timestamp =
            invocations && invocations[0].startTime
                ? invocations[0].startTime
                : '';

        const targetPageUrl = convertedResults.runs[0].files
            ? Object.keys(convertedResults.runs[0].files)[0]
            : '';

        const targetPageTitle =
            convertedResults.runs[0].files &&
            convertedResults.runs[0].files.targetPageUrl &&
            convertedResults.runs[0].files.targetPageUrl.properties
                ? convertedResults.runs[0].files.targetPageUrl.properties.title
                : '';

        return {
            timestamp: timestamp,
            targetPageUrl: targetPageUrl,
            targetPageTitle: targetPageTitle,
        };
    }
});

function convertAxeToSarif21(axeResults: AxeResults): Sarif.Log {
    const resultDecorator = new ResultDecorator(axeTagsToWcagLinkData);
    const decoratedAxeResults = resultDecorator.decorateResults(axeResults);

    const sarifConverter = defaultSarifConverter21();
    return sarifConverter.convert(decoratedAxeResults, {});
}
