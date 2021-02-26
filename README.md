<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# axe-sarif-converter

[![Build status](https://dev.azure.com/accessibility-insights/axe-sarif-converter/_apis/build/status/Microsoft.axe-sarif-converter%20-%20CI?branchName=main)](https://dev.azure.com/accessibility-insights/axe-sarif-converter/_build/latest?definitionId=20&branchName=main)
[![Code coverage](https://img.shields.io/azure-devops/coverage/accessibility-insights/axe-sarif-converter/20.svg)](https://dev.azure.com/accessibility-insights/axe-sarif-converter/_build/latest?definitionId=20&branchName=main)
[![npm](https://img.shields.io/npm/v/axe-sarif-converter.svg)](https://www.npmjs.com/package/axe-sarif-converter)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Convert [axe-core](https://github.com/dequelabs/axe-core) accessibility scan results to the [SARIF format](http://sarifweb.azurewebsites.net/). Provides both a TypeScript API and a CLI tool.

Use this with the [Sarif Viewer Build Tab Azure DevOps Extension](https://marketplace.visualstudio.com/items?itemName=sariftools.sarif-viewer-build-tab) to visualize accessibility scan results in the build results of an [Azure Pipelines](https://azure.microsoft.com/en-us/services/devops/pipelines/) build.

## Usage

Before using axe-sarif-converter, you will need to run an [axe](https://github.com/dequelabs/axe-core) accessibility scan to produce some axe results to convert. Typically, you would do this by using an axe integration library for your favorite browser automation tool ([@axe-core/puppeteer](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/puppeteer), [@axe-core/webdriverjs](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/webdriverjs), [cypress-axe](https://github.com/avanslaars/cypress-axe)).

axe-sarif-converter exports a single function, named `convertAxeToSarif`. Use it like this:

```ts
import * as Axe from 'axe-core';
import * as AxePuppeteer from '@axe-core/puppeteer';
import * as fs from 'fs';
import * as Puppeteer from 'puppeteer';
import * as util from 'util';

import { convertAxeToSarif, SarifLog } from 'axe-sarif-converter';

test('my accessibility test', async () => {
    // This example uses @axe-core/puppeteer, but you can use any axe-based
    // library that outputs axe scan results in the default axe output format
    const testPage: Puppeteer.Page = /* ... set up your test page ... */;
    const axeResults: Axe.AxeResults = await new AxePuppeteer(testPage).analyze();

    // Perform the conversion
    const sarifResults: SarifLog = convertAxeToSarif(axeResults);

    // Output a SARIF file, perhaps for use with a Sarif Viewer tool
    await util.promisify(fs.writeFile)(
        './test-results/my-accessibility-test.sarif',
        JSON.stringify(sarifResults),
        { encoding: 'utf8' });
}
```

You can also use axe-sarif-converter as a command line tool:

```bash
# @axe-core/cli is used here for example purposes only; you could also run axe-core
# using your library of choice and JSON.stringify the results.
npx @axe-core/cli https://accessibilityinsights.io --save ./sample-axe-results.json

npx axe-sarif-converter --input-files ./sample-axe-results.json --output-file ./sample-axe-results.sarif
```

See `npx axe-sarif-converter --help` for full command line option details.

## Samples

The [microsoft/axe-pipelines-samples](https://github.com/microsoft/axe-pipelines-samples) project contains full sample code that walks you through integrating this library into your project, from writing a test to seeing results in Azure Pipelines.

## Version numbers

The version number of this library is **independent** from the version numbers of the axe-core inputs and SARIF outputs it supports.

-   axe-sarif-converter version 2.x supports input from version ^3.2.0 || ^4.0.0 of axe-core (tested with 3.2.2, 3.3.2, 3.4.1, 3.4.2, 3.5.1, 3.5.2, 3.5.3, 3.5.4, 3.5.5, 4.0.1, 4.0.2, and 4.1.1) and outputs SARIF v2.1
-   axe-sarif-converter version 1.x supports input from version >= 3.2.0 < 3.3.0 of axe-core (tested with 3.2.2) and outputs SARIF v2.0

Note that the SARIF format _does not use semantic versioning_, and there are breaking changes between the v2.0 and v2.1 SARIF formats. If you need compatibility with a SARIF viewer that only supports v2.0, you should use version 1.x of this library.

## Contributing

To get started working on the project:

1. Install dependencies:

    - Install [Node.js](https://nodejs.org/en/download/) (LTS version)
    - `npm install -g yarn`
    - `yarn install`

1. Run all build, lint, and test steps:

    - `yarn precheckin`

1. Run the CLI tool with your changes:

    - `yarn build`
    - `node dist/cli.js`
    - Alternately, register a linked global `axe-sarif-converter` command with `npm install && npm link` (yarn doesn't work for this; see [yarnpkg/yarn#1585](https://github.com/yarnpkg/yarn/issues/1585))

### Updating axe-core version

This package attempts to maintain backwards compatibility with axe-core versions ^3.2.2. We maintain
test cases using pinned output from multiple axe-core versions under `/src/test-resources/`, so updating
the version of axe-core we support involves generating new output for the new versions.

Ideally we'd specify axe-core as a peer dependency; unfortunately, changing this now would be a breaking
change, so we're waiting to change this until we would need to make a breaking change anyway.

To update the package and test cases to account for a new axe-core version:

1. Update the version of axe-core in `yarn.lock` (_not_ `package.json`); usually dependabot will cover this.
1. Build the repo with:
    ```
    yarn install
    yarn build
    ```
1. Update the versions of @axe-core/cli, @axe-core/puppeteer, and axe-core in `src/test-resources/generator/package.json`
1. Generate test resource files for the new version with:

    ```
    cd src/test-resources/generator
    yarn install
    yarn generate
    ```

1. Manually compare the diff of `/src/test-resources/basic-axe-vPREVIOUS.sarif` and `/src/test-resources/basic-axe-vNEW.sarif`; the only differences should be the version numbers.
1. Manually compare the diff of `/src/test-resources/w3citylights-axe-vPREVIOUS.sarif` and `/src/test-resources/w3citylights-axe-vNEW.sarif`; in addition to version number differences, you should see some differences based on new/removed rules between the axe versions.
1. Add test cases involving the new files to the integration tests in `src/index.test.ts` and `src/cli.test.ts`
1. Update snapshots (`yarn test -u`)
1. Update this README's `Version numbers` section to note which versions we've tested against.

### Contributor License Agreement

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For more details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

### Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
