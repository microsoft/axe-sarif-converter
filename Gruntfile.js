// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { run: copyrightCheckAndAdd } = require('license-check-and-add');

module.exports = function(grunt) {
    const copyrightCheckAndAddConfig = {
        folder: './',
        license: 'copyright-header.txt',
        exact_paths_method: 'EXCLUDE',
        exact_paths: [
            './.vscode',
            './.git',
            './.github',
            './node_modules',
            './copyright-header.txt',
        ],
        file_type_method: 'INCLUDE',
        file_types: [
            '.ts',
            '.tsx',
            '.d.ts',
            '.js',
            '.html',
            '.css',
            '.scss',
            '.yaml',
            '.md',
            '.txt',
            '.xml',
        ],
        insert_license: false,
        license_formats: {
            'yaml|npmrc': {
                eachLine: {
                    prepend: '# ',
                },
            },
            md: {
                prepend: '<!--',
                append: '-->',
            },
            'snap|ts|tsx|d.ts|js|scss|css': {
                eachLine: {
                    prepend: '// ',
                },
            },
        },
    };

    grunt.registerTask(
        'copyright-check',
        'grunt task to check copyright header',
        function() {
            copyrightCheckAndAdd(copyrightCheckAndAddConfig);
        },
    );

    grunt.registerTask(
        'copyright-add',
        'grunt task to add copyright header',
        function() {
            copyrightCheckAndAddConfig.insert_license = true;
            copyrightCheckAndAdd(copyrightCheckAndAddConfig);
        },
    );
};
