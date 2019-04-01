// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const rootDir = '../../';
const currentDir = '<rootDir>/tests/unit';

module.exports = {
    clearMocks: true,
    testRunner: 'jest-circus/runner',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    verbose: false,
    coverageDirectory: '<rootDir>/test-results/unit/coverage',
    displayName: 'unit tests',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    rootDir: rootDir,
    roots: [currentDir],
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,tsx}',
        '!<rootDir>/tests/**/*',
        '!<rootDir>/src/**/*.d.ts',
    ],
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    testEnvironment: 'jsdom',
    testMatch: [`${currentDir}/**/*.test.(ts|tsx|js)`],
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
