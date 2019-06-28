// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { defaultAxeRawSarifConverter } from './axe-raw-sarif-converter';
import { ConverterOptions } from './converter-options';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromEnvironment } from './environment-data-provider';
import { defaultSarifConverter } from './sarif-converter';

export type SarifLog = Sarif.Log;

export function convertAxeToSarif(axeResults: Axe.AxeResults): SarifLog {
    const sarifConverter = defaultSarifConverter();
    return sarifConverter.convert(axeResults, {});
}

export function sarifReporter(
    rawResults: AxeRawResult[],
    runOptions: Axe.RunOptions,
    callback: (sarifResults: SarifLog) => void,
) {
    const converterOptions: ConverterOptions = {};
    const environmentData: EnvironmentData = getEnvironmentDataFromEnvironment();
    const sarifConverter = defaultAxeRawSarifConverter();
    const sarifOutput = sarifConverter.convert(
        rawResults,
        converterOptions,
        environmentData,
    );
    callback(sarifOutput);
}
