// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DictionaryStringTo } from './dictionary-types';
import { WCAGLinkData } from './wcag-link-data';

export class WCAGLinkDataIndexer {
    private readonly sortedWcagTags: string[];
    private readonly wcagTagsToTaxaIndices: DictionaryStringTo<number>;
    constructor(private wcagConfiguration: DictionaryStringTo<WCAGLinkData>) {
        this.sortedWcagTags = this.sortWcagTags(this.wcagConfiguration);
        this.wcagTagsToTaxaIndices = this.mapWcagTagToTaxaIndex();
    }

    public getSortedWcagTags(): string[] {
        return this.sortedWcagTags;
    }

    public getWcagTagsToTaxaIndices(): DictionaryStringTo<number> {
        return this.wcagTagsToTaxaIndices;
    }

    private mapWcagTagToTaxaIndex(): DictionaryStringTo<number> {
        let wcagTagsToTaxaIndices: DictionaryStringTo<number> = {};
        for (let i = 0; i < this.sortedWcagTags.length; i++) {
            wcagTagsToTaxaIndices[this.sortedWcagTags[i]] = i;
        }
        return wcagTagsToTaxaIndices;
    }

    private sortWcagTags(
        wcagConfiguration: DictionaryStringTo<WCAGLinkData>,
    ): string[] {
        return Object.keys(wcagConfiguration).sort();
    }
}
