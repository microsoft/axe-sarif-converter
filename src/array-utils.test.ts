// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { isEmpty } from './array-utils';

describe('array-utils isEmpty', () => {
    it('returns true for empty arrays', () => {
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty([])).toBe(true);
    });

    it('returns false for non-empty arrays', () => {
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty([1, 2])).toBe(false);
        expect(isEmpty([{}])).toBe(false);
        expect(isEmpty(['a'])).toBe(false);
    });
});
