// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { DictionaryStringTo } from './dictionary-types';
import { WCAGLinkData } from './wcag-link-data';

export const WcagGuid = 'ca34e0e1-5faf-4f55-a989-cdae42a98f18';

export function getWcagTaxonomyReference(): Sarif.ToolComponentReference {
    return {
        name: 'WCAG',
        index: 0,
        guid: WcagGuid,
    };
}

export function getWcagTaxonomy(
    sortedWcagTags: string[],
    tagsToWcagLinkData: DictionaryStringTo<WCAGLinkData>,
): Sarif.ToolComponent {
    return {
        name: 'WCAG',
        fullName: 'Web Content Accessibility Guidelines (WCAG) 2.1',
        organization: 'W3C',
        informationUri: 'https://www.w3.org/TR/WCAG21',
        version: '2.1',
        guid: WcagGuid,
        isComprehensive: true,
        taxa: getAllTaxaFromWcagLinkData(sortedWcagTags, tagsToWcagLinkData),
    };
}

function getAllTaxaFromWcagLinkData(
    sortedWcagTags: string[],
    tagsToWcagLinkData: DictionaryStringTo<WCAGLinkData>,
): Sarif.ToolComponent['taxa'] {
    return sortedWcagTags.map((tag) =>
        getIndividualTaxaFromWcagLinkData(tag, tagsToWcagLinkData[tag]),
    );
}

function getIndividualTaxaFromWcagLinkData(
    tag: string,
    wcagLinkData: WCAGLinkData,
): Sarif.ReportingDescriptor {
    let taxa: Sarif.ReportingDescriptor = {
        id: tag,
        name: wcagLinkData.text,
    };
    if (wcagLinkData.title) {
        taxa = {
            ...taxa,
            shortDescription: {
                text: wcagLinkData.title,
            },
        };
    }
    if (wcagLinkData.url) {
        taxa = { ...taxa, helpUri: wcagLinkData.url };
    }

    return taxa;
}
