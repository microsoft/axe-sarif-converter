// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from './sarif/sarif-2.1.2';
import { getWcagTaxonomy } from './wcag-taxonomy-provider';

describe('WCAGTaxonomyProvider', () => {
    it('creates a Sarif.ToolComponent object with WCAG property information', () => {
        const sortedTagsStub: string[] = [];
        const expectedResultsStub: Sarif.ToolComponent = {
            name: 'WCAG',
            fullName: 'Web Content Accessibility Guidelines (WCAG) 2.1',
            organization: 'W3C',
            informationUri: 'https://www.w3.org/TR/WCAG21',
            version: '2.1',
            guid: '',
            isComprehensive: true,
            taxa: [],
        };
        const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
            sortedTagsStub,
        );

        expect(actualResults).toEqual(expectedResultsStub);
    });

    it('creates a Sarif.ToolComponent object with taxa properties based on axeTagsToWcagLinkData', () => {
        const sortedTagsStub: string[] = ['wcag111', 'wcag121'];
        const expectedResults = [
            {
                id: 'wcag111',
                name: 'WCAG 1.1.1',
                shortDescription: {
                    text: 'Non-text Content',
                },
                helpUri:
                    'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content',
            },
            {
                id: 'wcag121',
                name: 'WCAG 1.2.1',
                shortDescription: {
                    text: 'Audio-only and Video-only (Prerecorded)',
                },
                helpUri:
                    'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded',
            },
        ];

        const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
            sortedTagsStub,
        );

        expect(actualResults).toHaveProperty('taxa', expectedResults);
    });

    it('creates a Sarif.Tool Component object with taxa properties where WCAGLinkData title and url are empty', () => {
        const sortedTagsStub: string[] = ['best-practice'];
        const expectedResults = [
            {
                id: 'best-practice',
                name: 'Best Practice',
                shortDescription: {
                    text: '',
                },
                helpUri: '',
            },
        ];

        const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
            sortedTagsStub,
        );

        expect(actualResults).toHaveProperty('taxa', expectedResults);
    });
});
