<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Contributing to axe-sarif-converter

## Getting started

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

## Suggesting a change

For non-trivial changes, we recommend [filing an issue](https://github.com/microsoft/axe-sarif-converter/issues/new) before sending a Pull Request (PR) so we can discuss the problem you're trying to solve and make sure there's agreement that the change belongs in this project.

Once you've gotten that agreement, create a Pull Request containing your change and our team will review it. When you create a PR, its description will be automatically filled in with our PR template; be sure to read through and follow the instructions there before submitting your PR!

## Less commonly used how-tos

This section documents how to perform a few less-common development tasks. These serve as documentation for our own team of maintainers; external contributors will not generally need to reference these.

### Publishing a release

This repo uses [semantic release](https://github.com/semantic-release/semantic-release) to manage release publishing to NPM. Our [Azure Pipelines CI build](./azure-pipelines.yml) contains an optional `yarn semantic-release` step which only runs in our private CI builds of the repo's `main` branch; this step uses commit titles to determine whether a new release is needed (and if so, what the semantic version bump should be), and releases to npm if necessary. See [semantic release's documentation](https://github.com/semantic-release/semantic-release) for more details of how this works.

### Updating axe-core version

This package attempts to maintain backwards compatibility with axe-core versions ^3.2.2. We maintain
test cases using pinned output from multiple axe-core versions under `/src/test-resources/`, so updating
the version of axe-core we support involves generating new output for the new versions.

Ideally we'd specify axe-core as a peer dependency; unfortunately, changing this now would be a breaking
change, so we're waiting to change this until we would need to make a breaking change anyway.

To update the package and test cases to account for a new axe-core version:

1. In `package.json`, update the version numbers of the following components:

-   `devDependencies` entries for `@axe-core/cli` and `@axe-core/puppeteer`
-   `resolutions` entries for `axe-core` and `@axe-core/cli/chromedriver`
-   **NOT** the `dependencies` entry for `@axe-core`!

1. Build the repo with:

    ```
    yarn install
    yarn build
    ```

1. Generate test resource files for the new version with:

    ```
    yarn generate-test-resources
    ```

1. Manually compare the diff of `/src/test-resources/basic-axe-vPREVIOUS.sarif` and `/src/test-resources/basic-axe-vNEW.sarif`; the only differences should be the version numbers.
1. Manually compare the diff of `/src/test-resources/w3citylights-axe-vPREVIOUS.sarif` and `/src/test-resources/w3citylights-axe-vNEW.sarif`; in addition to version number differences, you should see some differences based on new/removed rules between the axe versions.
1. Add test cases involving the new files to the integration tests in `src/index.test.ts` and `src/cli.test.ts`
1. Update snapshots (`yarn test -u`)
1. Update this README's `Version numbers` section to note which versions we've tested against.

## Contributor License Agreement

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For more details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
