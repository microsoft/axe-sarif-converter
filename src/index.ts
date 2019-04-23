// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { AxeRawResult } from './axe-raw-result';
import { defaultAxeRawSarifConverter } from './axe-raw-sarif-converter';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromEnvironment } from './environment-data-provider';
import { ResultDecorator } from './result-decorator';
import { defaultSarifConverter } from './sarif-converter';
import { SarifLog } from './sarif/sarif-log';
import { axeTagsToWcagLinkData } from './wcag-link-data';

export { SarifLog } from './sarif/sarif-log';

export function convertAxeToSarif(axeResults: Axe.AxeResults): SarifLog {
    const resultDecorator = new ResultDecorator(axeTagsToWcagLinkData);
    const decoratedAxeResults = resultDecorator.decorateResults(axeResults);

    const sarifConverter = defaultSarifConverter();
    return sarifConverter.convert(decoratedAxeResults, {});
}

export function sarifReporter(
    rawResults: AxeRawResult[],
    {},
    callback: Function,
) {
    const environmentData: EnvironmentData = getEnvironmentDataFromEnvironment();
    callback(createSarifReport(rawResults, environmentData));
}

function createSarifReport(
    rawResults: AxeRawResult[],
    environmentData: EnvironmentData,
) {
    return defaultAxeRawSarifConverter().convert(
        rawResults,
        {},
        environmentData,
    );
}
