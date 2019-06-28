// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { EnvironmentData } from './environment-data';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

export function getAxeToolProperties(
    environmentData: EnvironmentData,
): Sarif.ToolComponent {
    const version = environmentData.axeVersion;
    return {
        name: 'axe-core',
        fullName: `axe for Web v${version}`,
        shortDescription: {
            text:
                'An open source accessibility rules library for automated testing.',
        },
        version: version,
        semanticVersion: version,
        informationUri: 'https://www.deque.com/axe/axe-for-web/',
        downloadUri: `https://www.npmjs.com/package/axe-core/v/${version}`,
        properties: {
            'microsoft/qualityDomain': 'Accessibility',
        },
        supportedTaxonomies: [getWcagTaxonomyReference()],
    };
}
