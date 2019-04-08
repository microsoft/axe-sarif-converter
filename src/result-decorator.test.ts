// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults, Result } from 'axe-core';
import { DictionaryStringTo } from './dictionary-types';
import { ResultDecorator } from './result-decorator';
import { WCAG } from './wcag';

describe('Result Decorator', () => {
    it('check if the class is defined', () => {
        const wcagConfig = {} as DictionaryStringTo<WCAG[]>;
        const resultDecorator = new ResultDecorator(wcagConfig);
        expect(resultDecorator).toBeDefined();
        expect(resultDecorator).not.toBeNull();
    });
    it("result decorator doesn't have WCAG data when no info is provided", () => {
        const resultStub: AxeResults = {
            passes: [] as Result[],
            violations: [] as Result[],
            inapplicable: [] as Result[],
            incomplete: [] as Result[],
            url: 'https://example.com',
            timestamp: '100',
        } as AxeResults;

        const wcagInfo: DictionaryStringTo<WCAG[]> = {};
        const resultDecorator = new ResultDecorator(wcagInfo);
        expect(resultDecorator.decorateResults(resultStub)).toMatchSnapshot();
    });

    it("result decorator doesn't have WCAG data when no info is provided", () => {
        const resultStub: AxeResults = {
            passes: [] as Result[],
            violations: [
                {
                    id: 'test-rule',
                    nodes: [{}],
                    description: 'description',
                    helpUrl: 'test url',
                    help: 'help',
                    impact: 'minor',
                    tags: ['best-practice'],
                },
            ],
            inapplicable: [] as Result[],
            incomplete: [] as Result[],
            url: 'https://example.com',
            timestamp: '100',
        } as AxeResults;

        const wcagDataStub: WCAG = {
            text: 'test',
        };
        const wcagInfo: DictionaryStringTo<WCAG[]> = {
            'test-rule': [wcagDataStub],
        };
        const resultDecorator = new ResultDecorator(wcagInfo);
        expect(resultDecorator.decorateResults(resultStub)).toMatchSnapshot();
    });
});
