// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from './sarif/sarif-2.1.2';
import { axeTagsToWcagLinkData, WCAGLinkData } from './wcag-link-data';

export function getWcagTaxonomy(sortedWcagTags: string[]): Sarif.ToolComponent {
    return {
        name: 'WCAG',
        fullName: 'Web Content Accessibility Guidelines (WCAG) 2.1',
        organization: 'W3C',
        informationUri: 'https://www.w3.org/TR/WCAG21',
        version: '2.1',
        guid: '',
        isComprehensive: true,
        taxa: getAllTaxaFromWcagLinkData(sortedWcagTags),
    };
}

function getAllTaxaFromWcagLinkData(
    sortedWcagTags: string[],
): Sarif.ToolComponent['taxa'] {
    var taxa: Sarif.ToolComponent['taxa'] = [];
    for (let i = 0; i < sortedWcagTags.length; i++) {
        var tag = sortedWcagTags[i];
        taxa.push(
            getIndividualTaxaFromWcagLinkData(tag, axeTagsToWcagLinkData[tag]),
        );
    }
    return taxa;
}

function getIndividualTaxaFromWcagLinkData(
    tag: string,
    wcagLinkData: WCAGLinkData,
): Sarif.ReportingDescriptor {
    return {
        id: tag,
        name: wcagLinkData.text,
        shortDescription: {
            text: wcagLinkData.title ? wcagLinkData.title : '',
        },
        helpUri: wcagLinkData.url,
    };
}
