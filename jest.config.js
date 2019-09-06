// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const rootDir = './src';
const currentDir = '<rootDir>/';

module.exports = {
    clearMocks: true,
    testRunner: 'jest-circus/runner',
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
    verbose: false,
    coverageDirectory: '../test-results/coverage',
    displayName: 'unit tests',
    moduleFileExtensions: ['ts', 'js'],
    rootDir: rootDir,
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/**/*.ts',
        '!<rootDir>/**/*.test.ts',
        // The CLI is tested via integration tests that spawn separate node
        // processes, so coverage information on this file isn't accurate
        '!<rootDir>/cli.ts',
    ],
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    testMatch: [`${currentDir}/**/*.test.(ts|js)`],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: '.',
                outputName: './test-results/junit.xml',
            },
        ],
    ],
};
