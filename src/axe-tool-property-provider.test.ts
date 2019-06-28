// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { EnvironmentData } from './environment-data';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

describe('axe-tool-property-provider', () => {
    describe('getAxeToolProperties', () => {
        it('returns the axe properties as a Sarif.ToolComponent', () => {
            const expectedResults: Sarif.ToolComponent = {
                name: 'axe-core',
                fullName: 'axe for Web v1.2.3',
                shortDescription: {
                    text:
                        'An open source accessibility rules library for automated testing.',
                },
                version: '1.2.3',
                semanticVersion: '1.2.3',
                informationUri: 'https://www.deque.com/axe/axe-for-web/',
                downloadUri: 'https://www.npmjs.com/package/axe-core/v/1.2.3',
                properties: {
                    'microsoft/qualityDomain': 'Accessibility',
                },
                supportedTaxonomies: [getWcagTaxonomyReference()],
            };

            const stubEnvironmentData = {
                axeVersion: '1.2.3',
            } as EnvironmentData;

            const actualResults: Sarif.ToolComponent = getAxeToolProperties(
                stubEnvironmentData,
            );
            expect(actualResults).toEqual(expectedResults);
        });
    });
});
