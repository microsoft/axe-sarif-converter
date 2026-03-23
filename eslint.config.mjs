// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import eslint from '@eslint/js';
import securityPlugin from 'eslint-plugin-security';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['dist/', 'node_modules/'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    securityPlugin.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.es2017,
                ...globals.node,
            },
            parserOptions: {
                project: './tsconfig.eslint.json',
            },
        },
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            'no-var': 'off',
            'prefer-const': 'off',
            'security/detect-non-literal-fs-filename': 'off',
            'security/detect-object-injection': 'off',
        },
    },
);
