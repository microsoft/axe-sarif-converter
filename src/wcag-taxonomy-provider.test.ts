// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { WcagGuid } from './constants';
import { DictionaryStringTo } from './dictionary-types';
import * as Sarif from './sarif/sarif-2.1.2';
import { WCAGLinkData } from './wcag-link-data';
import { getWcagTaxonomy } from './wcag-taxonomy-provider';

describe('WCAGTaxonomyProvider', () => {
    it('creates a Sarif.ToolComponent object with WCAG property information', () => {
        const sortedTagsStub: string[] = [];
        const tagsToWcagLinkDataStub: DictionaryStringTo<WCAGLinkData> = {};
        const expectedResultsStub: Sarif.ToolComponent = {
            name: 'WCAG',
            fullName: 'Web Content Accessibility Guidelines (WCAG) 2.1',
            organization: 'W3C',
            informationUri: 'https://www.w3.org/TR/WCAG21',
            version: '2.1',
            guid: WcagGuid,
            isComprehensive: true,
            taxa: [],
        };
        const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
            sortedTagsStub,
            tagsToWcagLinkDataStub,
        );

        expect(actualResults).toEqual(expectedResultsStub);
    });

    it('creates a Sarif.ToolComponent object with taxa properties based on given tagsToWcagLinkData', () => {
        const sortedTagsStub: string[] = ['stub_id_1', 'stub_id_2'];
        const tagsToWcagLinkDataStub: DictionaryStringTo<WCAGLinkData> = {
            stub_id_1: createWcagLinkDataObject(
                'stub_name_1',
                'stub_url_1',
                'stub_title_1',
            ),
            stub_id_2: createWcagLinkDataObject(
                'stub_name_2',
                'stub_url_2',
                'stub_title_2',
            ),
        };
        const expectedResults = [
            {
                id: 'stub_id_1',
                name: 'stub_name_1',
                shortDescription: {
                    text: 'stub_title_1',
                },
                helpUri: 'stub_url_1',
            },
            {
                id: 'stub_id_2',
                name: 'stub_name_2',
                shortDescription: {
                    text: 'stub_title_2',
                },
                helpUri: 'stub_url_2',
            },
        ];

        const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
            sortedTagsStub,
            tagsToWcagLinkDataStub,
        );

        expect(actualResults).toHaveProperty('taxa', expectedResults);
    });

    it('creates a Sarif.Tool Component object with taxa properties where WCAGLinkData title and url are empty', () => {
        const sortedTagsStub: string[] = ['stub_id'];
        const tagsToWcagLinkDataStub: DictionaryStringTo<WCAGLinkData> = {
            stub_id: { text: 'stub_name' },
        };
        const expectedResults = [
            {
                id: 'stub_id',
                name: 'stub_name',
            },
        ];

        const actualResults: Sarif.ToolComponent = getWcagTaxonomy(
            sortedTagsStub,
            tagsToWcagLinkDataStub,
        );

        expect(actualResults).toHaveProperty('taxa', expectedResults);
    });

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
