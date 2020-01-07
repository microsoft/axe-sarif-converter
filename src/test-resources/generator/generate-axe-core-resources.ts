// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as axe from 'axe-core';
import { AxePuppeteer } from 'axe-puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as Puppeteer from 'puppeteer';
import * as url from 'url';
import { convertAxeToSarif } from '../../../dist/index';

const axeVersion: string = (axe as any).version;
const axeSource: string = axe.source

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
    console.log(`Writing test resource: ${outputPath}`);
    const resultsAsJson = JSON.stringify(results, null, 2);
    await fs.promises.writeFile(outputPath, resultsAsJson, {encoding: 'utf8'});
}

async function generateResources() {
    const browser = await Puppeteer.launch();

    for (const testUrlIdentifier of Object.keys(testUrls)) {
        const testUrl = testUrls[testUrlIdentifier];
        for (const reporter of axeReporters) {
            const page = await newTestPage(browser, testUrl);
    
            const axeSpec: axe.Spec = {
                reporter: reporter as any,
            };

            const axeOptions: axe.RunOptions = {
                xpath: true,
            };

            if (testUrlIdentifier === 'basic') {
                axeOptions.runOnly = { type: 'rule', values: ['document-title'] };
            }

            const axeResults = await new AxePuppeteer(page, axeSource).configure(axeSpec).options(axeOptions).analyze();

            // Normalize parts that will vary run-over-run so we can compare all
            // the input files to the same sarif file on different machines.
            axeResults.timestamp = '2000-01-02T03:04:05.006Z'
            if (axeResults.url != undefined && axeResults.url.startsWith('file://')) {
                axeResults.url = 'http://localhost/';
            }

            await writeAxeResultFile(axeResults, axeVersion, reporter, testUrlIdentifier);
    
            if (reporter === 'v1') {
                const sarifResults = convertAxeToSarif(axeResults);
                await writeResultFile(sarifResults, `${testUrlIdentifier}-axe-v${axeVersion}.sarif`);
            }
        }
    }
    
    await browser.close();
}

generateResources();
