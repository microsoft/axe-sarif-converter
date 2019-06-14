// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

describe('axe-tool-property-provider 2.1', () => {
    describe('getAxeToolProperties21', () => {
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

            const actualResults: Sarif.ToolComponent = getAxeToolProperties21();
            expect(actualResults).toEqual(expectedResults);
        });
    });
});
