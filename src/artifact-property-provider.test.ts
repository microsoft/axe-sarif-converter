// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { getArtifactProperties } from './artifact-property-provider';
import { EnvironmentData } from './environment-data';

describe('artifact-property-provider', () => {
    describe('getArtifactProperties', () => {
        const targetPageUrl: string = 'target_page_url_stub';
        const targetPageTitle: string = 'target_page_title_stub';
        const timestamp: string = 'timestamp_stub';

        it('returns artifact object with the provided environment data', () => {
            const environmentData: EnvironmentData = {
                targetPageUrl: targetPageUrl,
                targetPageTitle: targetPageTitle,
                timestamp: timestamp,
            };

            const expectedResults: Sarif.Artifact = {
                location: {
                    uri: targetPageUrl,
                    index: 0,
                },
                sourceLanguage: 'html',
                roles: ['analysisTarget'],
            };

            const actualResults: Sarif.Artifact = getArtifactProperties(
                environmentData,
            );

            expect(actualResults).toEqual(expectedResults);
        });
    });
});
