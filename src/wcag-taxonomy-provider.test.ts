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
    // it('creates a Sarif.ToolComponent object for WCAG taxonomy from a dictionary of WCAG tags to WCAGLinkData', () => {
    //     const expectedResults = {
    //         taxa: [
    //             {
    //                 id: 'stub_wcag_1',
    //                 name: 'stub_wcag_1',
    //                 shortDescription: {
    //                     text: 'stub_title_1',
    //                 },
    //                 helpUri: 'stub_url_1',
    //             },
    //             {
    //                 id: 'stub_wcag_2',
    //                 name: 'stub_wcag_2',
    //                 shortDescription: {
    //                     text: 'stub_title_2',
    //                 },
    //                 helpUri: 'stub_url_2',
    //             },
    //         ],
    //     } as Sarif.ToolComponent;

    //     const sortedTagsStub: string[] = ['stub_wcag_1', 'stub_wcag_2'];
    //     const tagsToWcagLinkDataStub: DictionaryStringTo<WCAGLinkData> = {
    //         wcag1: createWcagLinkDataObject(
    //             'stub_wcag_1',
    //             'stub_url_1',
    //             'stub_title_1',
    //         ),
    //         wcag2: createWcagLinkDataObject(
    //             'stub_wcag_2',
    //             'stub_url_2',
    //             'stub_title_2',
    //         ),
    //     };

    //     const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
    //         sortedTagsStub,
    //     );

    //     expect(expectedResults).toHaveProperty('taxa', actualResults['taxa']);
    // });

    function createWcagLinkDataObject(
        text: string,
        url: string,
        title: string,
    ) {
        return {
            text: text,
            title: title,
            url: url,
        };
    }
});
