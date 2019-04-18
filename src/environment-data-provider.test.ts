// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DecoratedAxeResults } from './decorated-axe-results';
import { EnvironmentData } from './environment-data';
import { getEnvironmentData } from './environment-data-provider';

describe('environment-data-provider', () => {
    describe('getEnvironmentData', () => {
        it('returns an EnvironmentData object from environment data extracted from AxeResults', () => {
            const stubTimestamp: string = 'stub_timestamp';
            const stubTargetPageUrl: string = 'https://example.com';
            const stubTargetPageTitle: string = 'stub_url';

            const stubAxeResults: DecoratedAxeResults = {
                targetPageUrl: stubTargetPageUrl,
                timestamp: stubTimestamp,
                targetPageTitle: stubTargetPageTitle,
                passes: [],
                incomplete: [],
                violations: [],
                inapplicable: [],
            };

            const stubEnvironmentData: EnvironmentData = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
                targetPageTitle: stubTargetPageTitle,
            };

            const environmentDataResults = getEnvironmentData(stubAxeResults);
            expect(environmentDataResults).toEqual(stubEnvironmentData);
        });
    });
});
