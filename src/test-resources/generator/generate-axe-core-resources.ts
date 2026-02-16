// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AxePuppeteer } from '@axe-core/puppeteer';
import * as axe from 'axe-core';
import * as fs from 'fs';
import * as path from 'path';
import * as Puppeteer from 'puppeteer';
import * as url from 'url';
import { convertAxeToSarif } from '../../index';
import { testResourceTimestampPlaceholder } from '../../test-resource-constants';

const axeVersion: string = (axe as any).version;
const axeSource: string = axe.source
const rootDir = path.join(__dirname, '..', '..', '..');
const testResourcesDir = path.join(rootDir, 'src', 'test-resources');

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

function normalizeEnvironmentDependentPartsOfAxeResults(axeResults: any) {
    if (axeResults.timestamp != undefined) {
        axeResults.timestamp = testResourceTimestampPlaceholder;
    }

    if (axeResults.url != undefined && axeResults.url.startsWith('file://')) {
        axeResults.url = 'http://localhost/';
    }
}

async function generateResources() {
    const browser = await Puppeteer.launch(
    // {headless: false}
    );

    for (const testUrlIdentifier of Object.keys(testUrls)) {
        const testUrl = testUrls[testUrlIdentifier];
        for (const reporter of axeReporters) {
            const page = await newTestPage(browser, testUrl);
    
            const axeSpec: axe.Spec = {
                reporter: reporter as axe.ReporterVersion,
            };

            const axeOptions: axe.RunOptions = {
                xpath: true,
            };

            if (testUrlIdentifier === 'basic') {
                axeOptions.runOnly = { type: 'rule', values: ['document-title'] };
            }

            try {
            const axeResults = await new AxePuppeteer(page, axeSource).configure(axeSpec).options(axeOptions).analyze();
            if(axeResults == undefined){
                console.error(`Axe results failed to return. \nReporter version:  ${reporter}\nUrl: ${testUrl}`);
            }

            normalizeEnvironmentDependentPartsOfAxeResults(axeResults);

            await writeAxeResultFile(axeResults, axeVersion, reporter, testUrlIdentifier);

            // We pin .sarif output against 'v1' because it's the default axe-core reporter,
            // so it's the baseline we want to measure other outputs against.
            if (reporter === 'v1') {
                const sarifResults = convertAxeToSarif(axeResults);
                await writeResultFile(sarifResults, `${testUrlIdentifier}-axe-v${axeVersion}.sarif`);
            }
            } catch (e) {
                console.error(e);
            }
         

            await page.close();
        }
    }
    
    await browser.close();
}

void generateResources();
