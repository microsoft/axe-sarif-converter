<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# axe-sarif-converter

[![Build status](https://dev.azure.com/accessibility-insights/axe-sarif-converter/_apis/build/status/Microsoft.axe-sarif-converter%20-%20CI?branchName=master)](https://dev.azure.com/accessibility-insights/axe-sarif-converter/_build/latest?definitionId=20&branchName=master)
[![Code coverage](https://img.shields.io/azure-devops/coverage/accessibility-insights/axe-sarif-converter/20.svg)](https://dev.azure.com/accessibility-insights/axe-sarif-converter/_build/latest?definitionId=20&branchName=master)
[![npm](https://img.shields.io/npm/v/axe-sarif-converter.svg)](https://www.npmjs.com/package/axe-sarif-converter)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Convert [axe-core](https://github.com/dequelabs/axe-core) accessibility scan results to the [SARIF format](http://sarifweb.azurewebsites.net/).

Use this with the [Sarif Viewer Build Tab Azure DevOps Extension](https://marketplace.visualstudio.com/items?itemName=sariftools.sarif-viewer-build-tab) to visualize accessibility scan results in the build results of an [Azure Pipelines](https://azure.microsoft.com/en-us/services/devops/pipelines/) build.

## Usage

Before using axe-sarif-converter, you will need to run an [axe](https://github.com/dequelabs/axe-core) accessibility scan to produce some axe results to convert. Typically, you would do this by using an axe integration library for your favorite browser automation tool ([axe-puppeteer](https://github.com/dequelabs/axe-puppeteer), [axe-webdriverjs](https://github.com/dequelabs/axe-webdriverjs), [cypress-axe](https://github.com/avanslaars/cypress-axe)).

axe-sarif-converter exports a single function, named `convertAxeToSarif`. Use it like this:

```ts
import { convertAxeToSarif, SarifLog } from 'axe-sarif-converter';

test('my accessibility test', async () => {
    // This example uses axe-puppeteer, but you can use any axe-based library
    // that outputs axe scan results in the default axe output format
    const testPage: Puppeteer.Page = /* ... set up your test page ... */;
    const axeResults: Axe.AxeResults = await new AxePuppeteer(testPage).analyze();

    // Perform the conversion
    const sarifResults: SarifLog = convertAxeToSarif(axeResults);

    // Output a SARIF file, perhaps for use with a Sarif Viewer tool
    await fs.promises.writeFile(
        './test-results/my-accessibility-test.sarif',
        JSON.stringify(sarifResults),
        { encoding: 'utf8' });
}
```

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
