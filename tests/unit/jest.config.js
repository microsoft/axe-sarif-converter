// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const rootDir = '../../';
const currentDir = '<rootDir>/tests/unit';

module.exports = {
    clearMocks: true,
    testRunner: 'jest-circus/runner',
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
    verbose: false,
    coverageDirectory: '<rootDir>/test-results/unit/coverage',
    displayName: 'unit tests',
    moduleFileExtensions: ['ts', 'js'],
    rootDir: rootDir,
    roots: [currentDir],
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts}', '!<rootDir>/tests/**/*'],
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    testMatch: [`${currentDir}/**/*.test.(ts|js)`],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: '.',
                outputName: '<rootDir>/test-results/unit/junit.xml',
            },
        ],
    ],
};
