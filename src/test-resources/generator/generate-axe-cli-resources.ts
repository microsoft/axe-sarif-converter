// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as axe from 'axe-core';
import * as child_process from 'child_process';
import * as path from 'path';
import * as url from 'url';

const axeCoreVersion = (axe as any).version;
const axeSourcePath = require.resolve('axe-core/axe.min.js');
const rootDir = path.join(__dirname, '..', '..', '..');
const testResourcesDir = path.join(rootDir, 'src', 'test-resources');

const testUrls: Record<string, string> = {
    'w3citylights': 'https://www.w3.org/WAI/demos/bad/before/home.html',
    'basic': url.pathToFileURL(path.join(testResourcesDir, 'basic.html')).toString(),
};

function generateResources() {
    for (const testUrlIdentifier of Object.keys(testUrls)) {
        const testUrl = testUrls[testUrlIdentifier];
        const axeCliVersion = child_process.execSync(`yarn run axe --version`).toString().trim();
        const axeCliOutputFile = path.join(testResourcesDir, `${testUrlIdentifier}-axe-v${axeCoreVersion}.axe-cli-v${axeCliVersion}.json`);
        console.log(`Writing test resource: ${axeCliOutputFile}`);

        const axeCliOutputFileRelativeToRoot = path.relative(rootDir, axeCliOutputFile);
        let axeCliCommand = `yarn run axe ${testUrl} --show-errors --save ${axeCliOutputFileRelativeToRoot} --axe-source ${axeSourcePath}`;
        if (testUrlIdentifier === 'basic') {
            axeCliCommand += ' --rules document-title';
        }
        console.log(`Invoking @axe-core/cli v${axeCliVersion} with: ${axeCliCommand}`, { cwd: rootDir });

        child_process.execSync(axeCliCommand);
    }
}

generateResources();
