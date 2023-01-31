// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const rootDir = './src';
const currentDir = '<rootDir>/';

module.exports = {
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/**/*.ts',
        '!<rootDir>/**/*.test.ts',
        '!<rootDir>/test-resources/generator/**/*.ts',
        // The CLI is tested via integration tests that spawn separate node
        // processes, so coverage information on this file isn't accurate
        '!<rootDir>/cli.ts',
    ],
    coverageDirectory: '../test-results/coverage',
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    displayName: 'unit tests',
    moduleFileExtensions: ['ts', 'js'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: './test-results/',
                outputName: 'junit.xml',
            },
        ],
    ],
    rootDir: rootDir,
    testMatch: [`${currentDir}/**/*.test.(ts|js)`],
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
    verbose: false,
};
