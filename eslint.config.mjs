// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import js from '@eslint/js';
import security from 'eslint-plugin-security';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    security.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.es2017,
                ...globals.node,
            },
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Allow underscore-prefixed unused args (e.g., _options)
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            // These security rules produce false positives for this codebase.
            'security/detect-object-injection': 'off',
            'security/detect-non-literal-fs-filename': 'off',
        },
    },
);
