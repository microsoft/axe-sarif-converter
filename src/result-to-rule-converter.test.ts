// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { DictionaryStringTo } from './dictionary-types';
import { ResultToRuleConverter } from './result-to-rule-converter';
import { getWcagTaxonomyReference } from './wcag-taxonomy-provider';

describe('ResultToRuleConverter', () => {
    const stub_tags = ['stub_tag_1', 'stub_tag_2', 'stub_tag_3'];
    const stub_tags_to_indices = {
        stub_tag_1: 0,
        stub_tag_2: 20,
        stub_tag_3: 14,
    };
    let expectedRuleResults: Sarif.ReportingDescriptor[];

    beforeAll(() => {
        expectedRuleResults = [
            {
                id: 'stub_id',
                name: 'stub_help_info',
                fullDescription: {
                    text: 'stub_description.',
                },
                helpUri: 'stub_url',
                relationships: [
                    {
                        target: {
                            id: 'stub_tag_1',
                            index: 0,
                            toolComponent: getWcagTaxonomyReference(),
                        },
                        kinds: ['superset'],
                    },
                    {
                        target: {
                            id: 'stub_tag_3',
                            index: 14,
                            toolComponent: getWcagTaxonomyReference(),
                        },
                        kinds: ['superset'],
                    },
                ],
            },
            {
                id: 'stub_id_2',
                name: 'stub_help_info_2',
                fullDescription: {
                    text: 'stub_description_2.',
                },
                helpUri: 'stub_url_2',
                relationships: [],
            },
        ];
    });

    describe('from v2 results', () => {
        let stub_results: Axe.AxeResults;
        let resultToRuleConverter: ResultToRuleConverter;

        beforeAll(() => {
            stub_results = {
                passes: [] as Axe.Result[],
                violations: [
                    {
                        id: 'stub_id',
                        tags: [
                            'stub_tag_1',
                            'stub_tag_3',
                            'a_tag',
                        ] as unknown as Axe.TagValue[],
                        description: 'stub_description',
                        help: 'stub_help_info',
                        helpUrl: 'stub_url',
                    },
                    {
                        id: 'stub_id_2',
                        tags: ['tag_2'] as unknown as Axe.TagValue[],
                        description: 'stub_description_2',
                        help: 'stub_help_info_2',
                        helpUrl: 'stub_url_2',
                    },
                    // repeating the same rule id to test that rules are added only once
                    {
                        id: 'stub_id_2',
                        tags: ['tag_2'] as unknown as Axe.TagValue[],
                        description: 'stub_description_2',
                        help: 'stub_help_info_2',
                        helpUrl: 'stub_url_2',
                    },
                ] as Axe.Result[],
                inapplicable: [] as Axe.Result[],
                incomplete: [] as Axe.Result[],
                timestamp: 'stub_timestamp',
                url: 'stub_url',
            } as Axe.AxeResults;

            resultToRuleConverter = ResultToRuleConverter.fromV2Results(
                stub_results,
                stub_tags,
                stub_tags_to_indices,
            );
        });

        describe('getRulePropertiesFromResults', () => {
            it('returns array of unique axe rules as Sarif.ReportingDescriptor[] from axe results', () => {
                const actualResults: Sarif.ReportingDescriptor[] =
                    resultToRuleConverter.getRulePropertiesFromResults();

                expect(actualResults).toEqual(expectedRuleResults);
            });
        });

        describe('getRuleIdsToRuleIndices', () => {
            it('returns a dictionary of rule ids to their indices in a sorted array of rule ids', () => {
                const expectedResults: DictionaryStringTo<number> = {
                    stub_id: 0,
                    stub_id_2: 1,
                };

                const actualResults: DictionaryStringTo<number> =
                    resultToRuleConverter.getRuleIdsToRuleIndices();

                expect(actualResults).toEqual(expectedResults);
            });
        });
    });

    describe('from raw results', () => {
        let stub_results: AxeRawResult[];
        let rawResultToRuleConverter: ResultToRuleConverter;

        beforeAll(() => {
            stub_results = [
                {
                    id: 'stub_id',
                    tags: ['stub_tag_1', 'stub_tag_3', 'a_tag'],
                    description: 'stub_description',
                    help: 'stub_help_info',
                    helpUrl: 'stub_url',
                } as AxeRawResult,
                {
                    id: 'stub_id_2',
                    tags: ['tag_2'],
                    description: 'stub_description_2',
                    help: 'stub_help_info_2',
                    helpUrl: 'stub_url_2',
                } as AxeRawResult,
                // repeating the same rule id to test that rules are added only once
                {
                    id: 'stub_id_2',
                    tags: ['tag_2'],
                    description: 'stub_description_2',
                    help: 'stub_help_info_2',
                    helpUrl: 'stub_url_2',
                } as AxeRawResult,
            ];

            rawResultToRuleConverter = ResultToRuleConverter.fromRawResults(
                stub_results,
                stub_tags,
                stub_tags_to_indices,
            );
        });

        describe('getRulePropertiesFromResults', () => {
            it('returns array of unique axe rules as Sarif.ReportingDescriptor[] from axe raw results', () => {
                const actualResults: Sarif.ReportingDescriptor[] =
                    rawResultToRuleConverter.getRulePropertiesFromResults();

                expect(actualResults).toEqual(expectedRuleResults);
            });
        });

        describe('getRuleIdsToRuleIndices', () => {
            it('returns a dictionary of rule ids to their indices in a sorted array of rule ids', () => {
                const expectedResults: DictionaryStringTo<number> = {
                    stub_id: 0,
                    stub_id_2: 1,
                };

                const actualResults: DictionaryStringTo<number> =
                    rawResultToRuleConverter.getRuleIdsToRuleIndices();

                expect(actualResults).toEqual(expectedResults);
            });
        });
    });
});
