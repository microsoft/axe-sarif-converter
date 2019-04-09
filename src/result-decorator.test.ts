// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults, Result } from 'axe-core';
import { DictionaryStringTo } from './dictionary-types';
import { ResultDecorator } from './result-decorator';
import { ScannerResults } from './ruleresults';
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
        const decoratedResult: ScannerResults = resultDecorator.decorateResults(
            resultStub,
        );
        expect(decoratedResult.violations).toEqual([]);
        expect(resultDecorator.decorateResults(resultStub)).toMatchSnapshot();
    });

    it('result decorator contains WCAG information that is provided as dependency', () => {
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

        const expectedViolation = [
            {
                WCAG: [{ text: 'test' }],
                description: 'description',
                help: 'help',
                helpUrl: 'test url',
                id: 'test-rule',
                impact: 'minor',
                nodes: [{}],
                tags: ['best-practice'],
            },
        ];

        const decoratedResult: ScannerResults = resultDecorator.decorateResults(
            resultStub,
        );
        expect(decoratedResult.violations).toEqual(expectedViolation);
        expect(decoratedResult.violations[0].WCAG).toEqual([{ text: 'test' }]);
    });
});
