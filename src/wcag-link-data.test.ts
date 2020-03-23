// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as axe from 'axe-core';
import { axeTagsToWcagLinkData } from './wcag-link-data';

describe('axeTagsToWcagLinkData', () => {
    it.each(axe.getRules())(
        'contains populated entries for every wcag standard tag used by axe-core rule %p',
        (axeRule) => {
            const tags: string[] = (axeRule as any).tags;
            const wcagTags = tags.filter(doesTagReferToWcagStandard);

            for (const wcagTag of wcagTags) {
                expect(axeTagsToWcagLinkData).toHaveProperty(wcagTag);

                const linkData = axeTagsToWcagLinkData[wcagTag];
                expect(linkData).toHaveProperty('url');
                expect(linkData).toHaveProperty('text');
                expect(linkData).toHaveProperty('title');
            }
        },
    );

    function doesTagReferToWcagStandard(tag: string): boolean {
        return /^wcag\d+$/.test(tag);
    }
});
