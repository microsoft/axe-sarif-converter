/** @jest-environment jsdom */

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { EnvironmentData } from './environment-data';
import {
    getEnvironmentDataFromEnvironment,
    getEnvironmentDataFromResults,
} from './environment-data-provider';

describe('environment-data-provider', () => {
    describe('getEnvironmentDataFromResults', () => {
        it('returns an EnvironmentData object from environment data extracted from AxeResults', () => {
            const stubTimestamp = 'stub_timestamp';
            const stubTargetPageUrl = 'https://example.com';
            const stubAxeVersion = 'stub_axe_version';

            const stubAxeResults: Axe.AxeResults = {
                url: stubTargetPageUrl,
                timestamp: stubTimestamp,
                testEngine: {
                    name: 'stub_axe_name',
                    version: stubAxeVersion,
                },
                passes: [],
                incomplete: [],
                violations: [],
                inapplicable: [],
                toolOptions: {} as Axe.RunOptions,
                testRunner: {} as Axe.TestRunner,
                testEnvironment: {} as Axe.TestEnvironment,
            };

            const expectedResults: EnvironmentData = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
                axeVersion: stubAxeVersion,
            };

            const actualResults = getEnvironmentDataFromResults(stubAxeResults);
            expect(actualResults).toEqual(expectedResults);
        });
    });

    describe('getEnvironmentDataFromEnvironment in axe-like environment', () => {
        beforeAll(() => {
            (global as any).axe = { version: 'stub_axe_version' };
        });

        afterAll(() => {
            delete (global as any).axe;
        });

        it('returns an EnvironmentData object from environment data extracted from the environment', () => {
            const actualResults = getEnvironmentDataFromEnvironment();
            expect(actualResults).toHaveProperty('timestamp');
            expect(actualResults).toHaveProperty('targetPageUrl');
            expect(actualResults).toHaveProperty('targetPageTitle');
            expect(actualResults).toHaveProperty(
                'axeVersion',
                'stub_axe_version',
            );
        });

        it('contains a timestamp with a valid ISO format', () => {
            const actualTimestamp =
                getEnvironmentDataFromEnvironment().timestamp;
            const expectedTimestamp = new Date(
                Date.parse(actualTimestamp),
            ).toISOString();

            expect(actualTimestamp).toMatch(
                /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
            );
            expect(actualTimestamp).toBe(expectedTimestamp);
        });
    });

    describe('getEnvironmentDataFromEnvironment outside of axe-like environment', () => {
        it('throws a descriptive error when it cannot infer axe version', () => {
            expect(
                getEnvironmentDataFromEnvironment,
            ).toThrowErrorMatchingInlineSnapshot(
                `"Could not infer axe version from global axe object. Are you running from the context of an axe reporter?"`,
            );
        });
    });
});
