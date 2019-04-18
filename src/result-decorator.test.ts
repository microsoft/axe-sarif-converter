// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults, Result, TagValue } from 'axe-core';
import { DecoratedAxeResults } from './decorated-axe-results';
import { DictionaryStringTo } from './dictionary-types';
import { ResultDecorator } from './result-decorator';
import { WCAGLinkData } from './wcag-link-data';

describe('ResultDecorator', () => {
    it("doesn't modify its input when there are no individual results to decorate", () => {
        const inputWithNoIndividualResults: AxeResults = {
            passes: [] as Result[],
            violations: [] as Result[],
            inapplicable: [] as Result[],
            incomplete: [] as Result[],
            url: 'https://example.com',
            timestamp: '100',
        } as AxeResults;

        const wcagInfo: DictionaryStringTo<WCAGLinkData> = {};
        const resultDecorator = new ResultDecorator(wcagInfo);
        const decoratedResults: DecoratedAxeResults = resultDecorator.decorateResults(
            inputWithNoIndividualResults,
        );
        expect(decoratedResults.violations).toEqual([]);
        expect(decoratedResults).toMatchSnapshot();
    });

    it('decorates individual results with a WCAG property based on result tags', () => {
        const resultStub: AxeResults = {
            passes: [] as Result[],
            violations: [
                {
                    id: 'test-rule',
                    tags: [
                        'tag-present-in-wcag-info' as TagValue,
                        'tag-not-present-in-wcag-info' as TagValue,
                    ],
                },
            ],
            inapplicable: [] as Result[],
            incomplete: [] as Result[],
        } as AxeResults;

        const wcagInfo: DictionaryStringTo<WCAGLinkData> = {
            'tag-present-in-wcag-info': {
                text: 'text-for-tag-present-in-wcag-info',
            },
        };
        const resultDecorator = new ResultDecorator(wcagInfo);

        const decoratedResults: DecoratedAxeResults = resultDecorator.decorateResults(
            resultStub,
        );

        expect(decoratedResults.violations[0]).toHaveProperty('WCAG', [
            { text: 'text-for-tag-present-in-wcag-info' },
        ]);
    });

    it('uses an empty array as the WCAG property for results with no known tags', () => {
        const resultStub: AxeResults = {
            passes: [] as Result[],
            violations: [
                {
                    id: 'result-with-only-unknown-tags',
                    tags: ['tag-not-present-in-wcag-info' as TagValue],
                },
                {
                    id: 'result-with-empty-tags',
                    tags: [],
                },
            ],
            inapplicable: [] as Result[],
            incomplete: [] as Result[],
        } as AxeResults;

        const wcagInfo: DictionaryStringTo<WCAGLinkData> = {
            'tag-present-in-wcag-info': {
                text: 'text-for-tag-present-in-wcag-info',
            },
        };
        const resultDecorator = new ResultDecorator(wcagInfo);

        const decoratedResults: DecoratedAxeResults = resultDecorator.decorateResults(
            resultStub,
        );

        expect(decoratedResults.violations[0]).toHaveProperty('WCAG', []);
        expect(decoratedResults.violations[1]).toHaveProperty('WCAG', []);
    });
});
