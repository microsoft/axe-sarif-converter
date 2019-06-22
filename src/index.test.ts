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
import * as path from 'path';
import { AxeRawResult } from './axe-raw-result';
import { convertAxeToSarif, SarifLog, sarifReporter } from './index';

function readTestResourceJSON(testResourceFileName: string): any {
    const rawFileContents: string = fs.readFileSync(
        // Allowing for test-only code
        // tslint:disable-next-line: non-literal-fs-path
        path.join('./src/test-resources', testResourceFileName),
        'utf8',
    );
    return JSON.parse(rawFileContents);
}

describe('public convertAxeToSarif API', () => {
    it('converts empty/minimal axe v2 input with no results to the pinned minimal SARIF output', () => {
        const minimalAxeV2Input: AxeResults = {
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

        expect(convertAxeToSarif(minimalAxeV2Input)).toMatchSnapshot();
    });

    it('converts minimal axe v2 input with a basic result to the pinned SARIF output', () => {
        const basicAxeV2Input: AxeResults = readTestResourceJSON(
            'basic-axe-v3.2.2-reporter-v2.json',
        );
        const expectedBasicSarifOutput: SarifLog = readTestResourceJSON(
            'basic-axe-v3.2.2-sarif-v2.1.2.sarif',
        );

        expect(convertAxeToSarif(basicAxeV2Input)).toEqual(
            expectedBasicSarifOutput,
        );
    });

    it('converts axe v2 input from a real scan to the pinned SARIF output snapshot', () => {
        const realisticAxeV2Input: AxeResults = readTestResourceJSON(
            'axe-v3.2.2.reporter-v2.json',
        );

        expect(convertAxeToSarif(realisticAxeV2Input)).toMatchSnapshot();
    });
});

describe('public sarifReporter API', () => {
    const emptyAxeRunOptions = {};

    // Normalized values are the pinned expectations from basic-axe-v3.2.2-sarif-v2.1.2.sarif
    function normalizeEnvironmentDerivedSarifProperties(sarif: SarifLog): void {
        sarif.runs[0]!.invocations!.forEach(i => {
            i.endTimeUtc = '2019-03-22T19:12:06.129Z';
            i.startTimeUtc = '2019-03-22T19:12:06.129Z';
        });
    }

    it('converts empty/minimal axe rawObject input with no results to the pinned minimal SARIF output', done => {
        const minimalAxeRawInput: AxeRawResult[] = [];

        function callback(convertedSarifResults: SarifLog) {
            normalizeEnvironmentDerivedSarifProperties(convertedSarifResults);

            expect(convertedSarifResults).toMatchSnapshot();
            done();
        }

        sarifReporter(minimalAxeRawInput, emptyAxeRunOptions, callback);
    });

    it('converts minimal axe rawObject input with a basic result to the pinned SARIF output', done => {
        const basicAxeRawInput: AxeRawResult[] = readTestResourceJSON(
            'basic-axe-v3.2.2-reporter-raw.json',
        );
        const expectedBasicSarifOutput: SarifLog = readTestResourceJSON(
            'basic-axe-v3.2.2-sarif-v2.1.2.sarif',
        );

        function callback(convertedSarifResults: SarifLog) {
            normalizeEnvironmentDerivedSarifProperties(convertedSarifResults);

            expect(convertedSarifResults).toEqual(expectedBasicSarifOutput);
            done();
        }

        sarifReporter(basicAxeRawInput, emptyAxeRunOptions, callback);
    });

    it('converts axe rawObject input from a real scan to the pinned SARIF output snapshot', done => {
        const realisticAxeRawInput: AxeRawResult[] = readTestResourceJSON(
            'axe-v3.2.2.reporter-raw.json',
        );

        function callback(convertedSarifResults: SarifLog) {
            normalizeEnvironmentDerivedSarifProperties(convertedSarifResults);

            expect(convertedSarifResults).toMatchSnapshot();
            done();
        }

        sarifReporter(realisticAxeRawInput, emptyAxeRunOptions, callback);
    });
});
