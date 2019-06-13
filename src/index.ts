// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { defaultAxeRawSarifConverter } from './axe-raw-sarif-converter';
import { ConverterOptions } from './converter-options';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromEnvironment } from './environment-data-provider';
import { ResultDecorator } from './result-decorator';
import { defaultSarifConverter } from './sarif-converter';
import { defaultSarifConverter21 } from './sarif-converter-21';
import { SarifLog } from './sarif/sarif-log';
import { axeTagsToWcagLinkData } from './wcag-link-data';

export { SarifLog } from './sarif/sarif-log';

export function convertAxeToSarif(axeResults: Axe.AxeResults): SarifLog {
    const resultDecorator = new ResultDecorator(axeTagsToWcagLinkData);
    const decoratedAxeResults = resultDecorator.decorateResults(axeResults);

    const sarifConverter = defaultSarifConverter();
    return sarifConverter.convert(decoratedAxeResults, {});
}

export function convertAxeToSarif21(axeResults: Axe.AxeResults): Sarif.Log {
    const resultDecorator = new ResultDecorator(axeTagsToWcagLinkData);
    const decoratedAxeResults = resultDecorator.decorateResults(axeResults);

    const sarifConverter = defaultSarifConverter21();
    return sarifConverter.convert(decoratedAxeResults, {});
}

export function sarifReporter(
    rawResults: AxeRawResult[],
    runOptions: Axe.RunOptions,
    callback: (sarifResults: SarifLog) => void,
) {
    const converterOptions: ConverterOptions = {};
    const environmentData: EnvironmentData = getEnvironmentDataFromEnvironment();
    callback(createSarifReport(rawResults, converterOptions, environmentData));
}

function createSarifReport(
    rawResults: AxeRawResult[],
    converterOptions: ConverterOptions,
    environmentData: EnvironmentData,
) {
    return defaultAxeRawSarifConverter().convert(
        rawResults,
        converterOptions,
        environmentData,
    );
}
