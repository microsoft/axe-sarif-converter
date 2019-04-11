// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { StringUtils } from './string-utils';

describe('string-utils isNotEmpty', () => {
    it('returns false for empty strings', () => {
        expect(StringUtils.isNotEmpty(undefined)).toBe(false);
        expect(StringUtils.isNotEmpty('')).toBe(false);
    });

    it('returns true for non-empty strings', () => {
        expect(StringUtils.isNotEmpty('test')).toBe(true);
        expect(
            StringUtils.isNotEmpty(' test space at the start of string'),
        ).toBe(true);
        expect(StringUtils.isNotEmpty('test space at end ')).toBe(true);
        expect(StringUtils.isNotEmpty(' testing spaces ')).toBe(true);
    });
});

describe('string-utils escapeForMarkdown', () => {
    it('returns empty string for empty string inputs', () => {
        expect(StringUtils.escapeForMarkdown(undefined)).toEqual('');
        expect(StringUtils.escapeForMarkdown('')).toEqual('');
    });

    it('replaces < characters with &lt;', () => {
        expect(StringUtils.escapeForMarkdown('<')).toEqual('&lt;');
    });

    it('replaces only < characters with &lt', () => {
        expect(StringUtils.escapeForMarkdown('<.x1.<>')).toEqual(
            '&lt;.x1.&lt;>',
        );
    });
});
