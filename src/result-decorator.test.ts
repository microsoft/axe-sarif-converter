// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults, Result, TagValue } from 'axe-core';
import { DecoratedAxeResults } from './decorated-axe-results';
import { DictionaryStringTo } from './dictionary-types';
import { ResultDecorator } from './result-decorator';
import { WCAGLinkData } from './wcag-link-data';

describe('ResultDecorator', () => {
    it('extracts the relevant properties from the AxeResults root', () => {
        const inputWithNoIndividualResults: AxeResults = {
            passes: [] as Result[],
            violations: [] as Result[],
            inapplicable: [] as Result[],
            incomplete: [] as Result[],
            url: 'https://example.com',
            timestamp: '100',
        } as AxeResults;

        const irrelevantWcagInfo: DictionaryStringTo<WCAGLinkData> = {};
        const resultDecorator = new ResultDecorator(irrelevantWcagInfo);

        const decoratedResults: DecoratedAxeResults = resultDecorator.decorateResults(
            inputWithNoIndividualResults,
        );

        expect(decoratedResults).toMatchObject({
            timestamp: '100',
            targetPageUrl: 'https://example.com',
            targetPageTitle: '',
        });
    });

    // tslint:disable-next-line: mocha-no-side-effect-code
    const resultsArrayProperties = [
        'passes',
        'violations',
        'inapplicable',
        'incomplete',
    ] as const;

    // tslint:disable-next-line: mocha-no-side-effect-code
    it.each(resultsArrayProperties)(
        'decorates individual results in results array %s with a WCAG property based on result tags',
        resultsArrayPropertyUnderTest => {
            const resultStub: AxeResults = {
                passes: [] as Result[],
                violations: [] as Result[],
                inapplicable: [] as Result[],
                incomplete: [] as Result[],
            } as AxeResults;

            resultStub[resultsArrayPropertyUnderTest] = [
                {
                    id: 'test-rule',
                    tags: [
                        'tag-present-in-wcag-info' as TagValue,
                        'tag-not-present-in-wcag-info' as TagValue,
                    ],
                } as Result,
            ];

            const wcagInfo: DictionaryStringTo<WCAGLinkData> = {
                'tag-present-in-wcag-info': {
                    text: 'text-for-tag-present-in-wcag-info',
                },
            };
            const resultDecorator = new ResultDecorator(wcagInfo);

            const decoratedResults: DecoratedAxeResults = resultDecorator.decorateResults(
                resultStub,
            );

            expect(
                decoratedResults[resultsArrayPropertyUnderTest][0],
            ).toHaveProperty('WCAG', [
                { text: 'text-for-tag-present-in-wcag-info' },
            ]);
        },
    );

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
