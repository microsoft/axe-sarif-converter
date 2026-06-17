// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginSecurity from 'eslint-plugin-security';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    pluginSecurity.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            ecmaVersion: 2017,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2017,
            },
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            // Replaces '@typescript-eslint/no-var-requires', which was removed in
            // @typescript-eslint v8 and merged into no-require-imports.
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            'security/detect-object-injection': 'off',
            'security/detect-non-literal-fs-filename': 'off',
            'no-var': 'off',
            'prefer-const': 'off',
        },
    },
    {
        // Disable type-aware linting for non-TypeScript files (e.g. this config).
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        ...tseslint.configs.disableTypeChecked,
    },
    {
        files: ['src/tests/**/*'],
        rules: {
            // Disable those errors and warnings which are not a threat to test code because the code is not run in production environments
        },
    },
);
