// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DictionaryStringTo } from './dictionary-types';
import { ResultDecorator } from './result-decorator';
import { WCAG } from './wcag';

describe('Result Decorator tests', () => {
    it('check if the class is defined', () => {
        const wcagConfig = {} as DictionaryStringTo<WCAG[]>;
        const resultDecorator = new ResultDecorator(wcagConfig);
        expect(resultDecorator).toBeDefined();
        expect(resultDecorator).not.toBeNull();
    });

    it('', () => {});
});
