// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

describe('axe-tool-property-provider', () => {
    describe('getAxeToolProperties', () => {
        it('returns the axe properties as a Sarif.ToolComponent', () => {
            const expectedResults: Sarif.ToolComponent = {
                name: 'axe-core',
                fullName: 'axe for Web v3.2.2',
                shortDescription: {
                    text:
                        'An open source accessibility rules library for automated testing.',
                },
                version: '3.2.2',
                semanticVersion: '3.2.2',
                informationUri: 'https://www.deque.com/axe/axe-for-web/',
                downloadUri: 'https://www.npmjs.com/package/axe-core/v/3.2.2',
                properties: {
                    'microsoft/qualityDomain': 'Accessibility',
                },
                supportedTaxonomies: [getWcagTaxonomyReference()],
            };

            const actualResults: Sarif.ToolComponent = getAxeToolProperties();
            expect(actualResults).toEqual(expectedResults);
        });
    });
});
