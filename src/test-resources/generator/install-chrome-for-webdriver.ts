// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * This script addresses an issue where selenium/webdriver inside @axe-core/cli cannot find the correct Chrome binary
 * and throws errors because ChromeDriver expects the binary to be at
 * C:\Users\[username]\AppData\Local\Google\Chrome\Application and does not look in node_modules for the binary.
 * This script only works on Windows, as that is the default developer environment for Accessibility Insights
 * team members.
 */

import { Dirent, promises as fs } from 'fs';
import * as path from 'path';

// Using require for @puppeteer/browsers because its .d.ts files
// require esModuleInterop which this project doesn't enable
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Browser, install } = require('@puppeteer/browsers') as {
    Browser: { CHROME: string };
    install: (options: {
        browser: string;
        cacheDir: string;
        buildId: string;
    }) => Promise<{ buildId: string }>;
};

let chromeVersion = process.argv.length > 2 ? process.argv[2] : '115.0.5755.0';
const rootDir = path.join(__dirname, '..', '..', '..');
const homeDrive = process.env.HOMEDRIVE ?? 'C:';
const userName = process.env.USERNAME ?? '';
const destDir: string = path.join(homeDrive, 'Users', userName, 'AppData', 'Local', 'Google', 'Chrome', 'Application');
const cacheDir: string = path.join(rootDir, 'dist');
const srcDir: string = path.join(cacheDir, 'chrome', `win64-${chromeVersion}`, 'chrome-win64');

async function installChrome(): Promise<void> {
    const browser = await install({
        browser: Browser.CHROME,
        cacheDir,
        buildId: chromeVersion,
    });
    chromeVersion = browser.buildId;
}

export async function installAndRelocateChrome(): Promise<void> {
    await installChrome();
    await fs.rm(destDir, { force: true, recursive: true});
    await copyContentsToExpectedLoc(srcDir, destDir);
}

async function copyContentsToExpectedLoc(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, {recursive: true});
    const files: Dirent[] = await fs.readdir(src, {withFileTypes: true});
    for (const file of files) {
        const srcPath: string = path.join(src, file.name);
        const destPath: string = path.join(dest, file.name);
        if(file.isDirectory()){
            await copyContentsToExpectedLoc(srcPath, destPath);
        }else{
            await fs.copyFile(srcPath, destPath);
        }
    }
}

void installAndRelocateChrome();
