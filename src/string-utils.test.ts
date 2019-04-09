// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { StringUtils } from './string-utils';

describe('string-utils', () => {
    it('test if isNotEmpty works properly', () => {
        expect(StringUtils.isNotEmpty('')).toBe(false);
        expect(StringUtils.isNotEmpty('test')).toBe(true);
        expect(
            StringUtils.isNotEmpty(' test space at the start of string'),
        ).toBe(true);
        expect(StringUtils.isNotEmpty('test space at end ')).toBe(true);
        expect(StringUtils.isNotEmpty(' testing spaces ')).toBe(true);
    });
});
