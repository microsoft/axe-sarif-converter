// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { AxeRawResult } from './axe-raw-result';
import { defaultAxeRawSarifConverter21 } from './axe-raw-sarif-converter-21';
import { ConverterOptions } from './converter-options';
import { EnvironmentData } from './environment-data';
import { getEnvironmentDataFromEnvironment } from './environment-data-provider';
import { defaultSarifConverter21 } from './sarif-converter-21';

export type SarifLog = Sarif.Log;

export function convertAxeToSarif(axeResults: Axe.AxeResults): SarifLog {
    const sarifConverter = defaultSarifConverter21();
    return sarifConverter.convert(axeResults, {});
}

export function sarifReporter(
    rawResults: AxeRawResult[],
    runOptions: Axe.RunOptions,
    callback: (sarifResults: SarifLog) => void,
) {
    const converterOptions: ConverterOptions = {};
    const environmentData: EnvironmentData = getEnvironmentDataFromEnvironment();
    const sarifConverter = defaultAxeRawSarifConverter21();
    const sarifOutput = sarifConverter.convert(
        rawResults,
        converterOptions,
        environmentData,
    );
    callback(sarifOutput);
}
