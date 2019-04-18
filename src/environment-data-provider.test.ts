// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults, TestEngine, TestEnvironment, TestRunner } from 'axe-core';
import { EnvironmentData } from './environment-data';
import { getEnvironmentData } from './environment-data-provider';

describe('environment-data-provider', () => {
    describe('getEnvironmentData', () => {
        it('returns an EnvironmentData object from environment data extracted from AxeResults', () => {
            const stubTimestamp: string = 'stub_timestamp';
            const stubTargetPageUrl: string = 'https://example.com';

            const stubAxeResults: AxeResults = {
                url: stubTargetPageUrl,
                timestamp: stubTimestamp,
                toolOptions: {},
                testEngine: {} as TestEngine,
                testRunner: {} as TestRunner,
                testEnvironment: {} as TestEnvironment,
                passes: [],
                incomplete: [],
                violations: [],
                inapplicable: [],
            };

            const stubEnvironmentData: EnvironmentData = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
                targetPageTitle: '',
            };

            const actualResults = getEnvironmentData(stubAxeResults);
            expect(actualResults).toEqual(stubEnvironmentData);
        });
    });
});
