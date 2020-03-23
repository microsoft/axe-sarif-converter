// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

module.exports = function () {
    return {
        files: [
            'tsconfig.json',
            'jest.config.js',
            'src/**/*.ts',
            'src/test-resources/*',
            { pattern: 'src/**/*.test.ts', ignore: true },
        ],
        tests: ['src/**/*.test.ts'],
        env: {
            type: 'node',
            runner: 'node',
        },
        testFramework: 'jest',
        setup: function (wallaby) {
            const jestConfig = require('./jest.config.js');

            // Wallaby uses its own typescript transformer and recommends
            // disabling jest's to avoid double-compiling.
            delete jestConfig.transform;

            // It looks like wallaby doesn't support jest-circus yet, so
            // falling back to the default runner.
            jestConfig.testRunner = 'jasmine2';

            wallaby.testFramework.configure(jestConfig);
        },
    };
};
