// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DictionaryStringTo } from './dictionary-types';
import { WCAGLinkData } from './wcag-link-data';
import { WCAGLinkDataIndexer } from './wcag-link-data-indexer';

describe('WCAGLinkDataIndexer', () => {
    let tagsToWcagLinkDataStub: DictionaryStringTo<WCAGLinkData>;
    let wcagLinkDataIndexer: WCAGLinkDataIndexer;
    beforeAll(() => {
        tagsToWcagLinkDataStub = {
            wcag1: createWcagLinkDataObject('1', 'stub_url_1', 'stub_title_1'),
            wcag2: createWcagLinkDataObject('2', 'stub_url_2', 'stub_title_2'),
            wcag3: createWcagLinkDataObject('3', 'stub_url_3', 'stub_title_3'),
        };
        wcagLinkDataIndexer = new WCAGLinkDataIndexer(tagsToWcagLinkDataStub);
    });

    it('creates an array of WCAG tags sorted in ascending order', () => {
        const expectedResults: string[] = ['wcag1', 'wcag2', 'wcag3'];

        const actualResults: string[] = wcagLinkDataIndexer.getSortedWcagTags();

        expect(actualResults).toEqual(expectedResults);
    });

    it('creates a dictionary of WCAG tags to their corresponding indices in the sorted array', () => {
        const expectedResults: DictionaryStringTo<number> = {
            wcag1: 0,
            wcag2: 1,
            wcag3: 2,
        };

        const actualResults: DictionaryStringTo<number> =
            wcagLinkDataIndexer.getWcagTagsToTaxaIndices();

        expect(actualResults).toEqual(expectedResults);
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
