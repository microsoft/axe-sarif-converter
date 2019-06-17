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
            const stubTimestamp: string = 'stub_timestamp';
            const stubTargetPageUrl: string = 'https://example.com';

            const stubAxeResults: Axe.AxeResults = {
                url: stubTargetPageUrl,
                timestamp: stubTimestamp,
                passes: [],
                incomplete: [],
                violations: [],
                inapplicable: [],
                toolOptions: null!,
                testEngine: null!,
                testRunner: null!,
                testEnvironment: null!,
            };

            const expectedResults: EnvironmentData = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
            };

            const actualResults = getEnvironmentDataFromResults(stubAxeResults);
            expect(actualResults).toEqual(expectedResults);
        });
    });

    describe('getEnvironmentDataFromEnvironment', () => {
        it('returns an EnvironmentData object from environment data extracted from the environment', () => {
            const actualResults = getEnvironmentDataFromEnvironment();
            expect(actualResults).toHaveProperty('timestamp');
            expect(actualResults).toHaveProperty('targetPageUrl');
            expect(actualResults).toHaveProperty('targetPageTitle');
        });

        it('contains a timestamp with a valid ISO format', () => {
            const actualTimestamp = getEnvironmentDataFromEnvironment()
                .timestamp;
            const expectedTimestamp = new Date(
                Date.parse(actualTimestamp),
            ).toISOString();

            expect(actualTimestamp).toMatch(
                /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
            );
            expect(actualTimestamp).toBe(expectedTimestamp);
        });
    });
});
