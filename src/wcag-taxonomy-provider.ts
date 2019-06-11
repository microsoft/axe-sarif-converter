// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { WcagGuid } from './constants';
import { DictionaryStringTo } from './dictionary-types';
import * as Sarif from './sarif/sarif-2.1.2';
import { WCAGLinkData } from './wcag-link-data';

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
    return sortedWcagTags.map(tag =>
        getIndividualTaxaFromWcagLinkData(tag, tagsToWcagLinkData[tag]),
    );
}

function getIndividualTaxaFromWcagLinkData(
    tag: string,
    wcagLinkData: WCAGLinkData,
): Sarif.ReportingDescriptor {
    var taxa: Sarif.ReportingDescriptor = {
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
