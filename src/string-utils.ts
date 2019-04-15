// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export function isNotEmpty(str?: string): boolean {
    str = str ? str.trim() : '';

    return str.length > 0;
}

export function escapeForMarkdown(s?: string): string {
    return s ? s.replace(/</g, '&lt;') : '';
}
