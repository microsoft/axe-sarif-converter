// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * This script addresses an issue where selenium/webdriver inside @axe-core/cli cannot find the correct Chrome binary
 * and throws errors because ChromeDriver expects the binary to be at
 * C:\Users\[username]\AppData\Local\Google\Chrome\Application and does not look in node_modules for the binary.
 * This script only works on Windows, as that is the default developer environment for Accessibility Insights
 * team members.
 */

const { Browser, install } = require('@puppeteer/browsers');
const path = require('path')
const { promises: fs, Dirent } = require('fs');
let chromeVersion = process.argv.length > 2 ? process.argv[2] : '115.0.5755.0';
const rootDir = path.join(__dirname, '..', '..', '..');
const destDir: string = path.join(process.env.HOMEDRIVE!, 'Users', process.env.USERNAME!, 'AppData', 'Local', 'Google', 'Chrome', 'Application');
const cacheDir: string = path.join(rootDir, 'dist');
const srcDir: string = path.join(cacheDir, 'chrome', `win64-${chromeVersion}`, 'chrome-win64');

async function installChrome(){

    let options = {
        browser: Browser.CHROME,
        cacheDir,
        buildId: chromeVersion
    } as any;

    const browser = await install(options);
    chromeVersion = browser.buildId;
}

export async function installAndRelocateChrome(){
    await installChrome();
    await fs.rm(destDir, { force: true, recursive: true});
    await copyContentsToExpectedLoc(srcDir, destDir);
}

async function copyContentsToExpectedLoc(src: string, dest: string){
    await fs.mkdir(dest, {recursive: true});
    let files = await fs.readdir(src, {withFileTypes: true});
    files.forEach(async (file: typeof Dirent) => {
        let srcPath: string = path.join(src, file.name);
        let destPath: string = path.join(dest, file.name);
        if(file.isDirectory()){
            await copyContentsToExpectedLoc(srcPath, destPath);
        }else{
            await fs.copyFile(srcPath, destPath)
        }
    })

}

installAndRelocateChrome();
