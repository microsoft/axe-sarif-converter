// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { escapeForMarkdown, isNotEmpty } from './string-utils';

describe('string-utils isNotEmpty', () => {
    it('returns false for empty strings', () => {
        expect(isNotEmpty(undefined)).toBe(false);
        expect(isNotEmpty('')).toBe(false);
    });

    it('returns true for non-empty strings', () => {
        expect(isNotEmpty('test')).toBe(true);
        expect(isNotEmpty(' test space at the start of string')).toBe(true);
        expect(isNotEmpty('test space at end ')).toBe(true);
        expect(isNotEmpty(' testing spaces ')).toBe(true);
    });
});

describe('string-utils escapeForMarkdown', () => {
    it('returns empty string for empty string inputs', () => {
        expect(escapeForMarkdown(undefined)).toEqual('');
        expect(escapeForMarkdown('')).toEqual('');
    });

    it('replaces < characters with &lt;', () => {
        expect(escapeForMarkdown('<')).toEqual('&lt;');
    });

    it('replaces only < characters with &lt', () => {
        expect(escapeForMarkdown('<.x1.<>')).toEqual('&lt;.x1.&lt;>');
    });
});
