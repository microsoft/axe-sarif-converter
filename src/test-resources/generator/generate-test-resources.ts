// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Usage:
//     yarn generate-for-axe-version 3.4.1

import { AxePuppeteer } from 'axe-puppeteer';
import { convertAxeToSarif } from 'axe-sarif-converter';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as Puppeteer from 'puppeteer';
import * as url from 'url';

if (process.argv.length !== 3) {
    console.log("Usage: yarn generate-for-axe-version 3.4.1\n(where 3.4.1 is the axe version number)");
    process.exit(1);
}

const axeVersion = process.argv[2];
const axeSourcePath = path.join(__dirname, `./node_modules/axe-core-${axeVersion}/axe.min.js`);
// tslint:disable-next-line: non-literal-fs-path
const axeSource = fs.readFileSync(axeSourcePath, {encoding: 'utf8'});

const testResourcesDir = path.join(__dirname, '../');

const axeReporters: string[] = ['v1', 'v2', 'raw'];
const testUrls: Record<string, string> = {
    'w3citylights': 'https://www.w3.org/WAI/demos/bad/before/home.html',
    'basic': url.pathToFileURL(path.join(testResourcesDir, 'basic.html')).toString(),
};

async function newTestPage(browser: Puppeteer.Browser, url: string): Promise<Puppeteer.Page> {
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.goto(url);
    return page;
}

async function writeAxeResultFile(results: any, axeVersion: string, reporter: string, testUrlIdentifier: string) {
    await writeResultFile(results, `${testUrlIdentifier}-axe-v${axeVersion}.reporter-${reporter}.json`);
}

async function writeResultFile(results: any, outputFileName: string) {
    const outputPath = path.join(testResourcesDir, outputFileName);
    console.log(`Writing results as ${outputPath}`);
    const resultsAsJson = JSON.stringify(results, null, 2);
    await fs.promises.writeFile(outputPath, resultsAsJson, {encoding: 'utf8'});
}

async function generateResources() {
    const browser = await Puppeteer.launch();

    for (const testUrlIdentifier of Object.keys(testUrls)) {
        const testUrl = testUrls[testUrlIdentifier];
        for (const reporter of axeReporters) {
            const page = await newTestPage(browser, testUrl);
    
            const axeOptions = {
                reporter: reporter as any
            };
            const axeResults = await new AxePuppeteer(page, axeSource).configure(axeOptions).options({xpath: true}).analyze();
            await writeAxeResultFile(axeResults, axeVersion, reporter, testUrlIdentifier);
    
            if (reporter === 'v1') {
                const sarifResults = convertAxeToSarif(axeResults);
                await writeResultFile(sarifResults, `${testUrlIdentifier}-axe-v${axeVersion}.sarif`);
            }
        }

        const axeCliVersion = child_process.execSync(`npx axe --version`);
        const axeCliOutputFile = path.join(testResourcesDir, `${testUrlIdentifier}-axe-cli-v${axeCliVersion}.json`);
        child_process.execSync(`npx axe ${testUrl} -s ${axeCliOutputFile}`)
    }
    
    await browser.close();
}

generateResources();
