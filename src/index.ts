// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { AxeRawSarifConverter } from './axe-raw-sarif-converter';
import { ConverterOptions } from './converter-options';
import { ResultDecorator } from './result-decorator';
import { SarifConverter } from './sarif-converter';
import { SarifLog } from './sarif/sarifLog';
import { rulesWCAGConfiguration } from './wcag-mappings';

export { ConverterOptions } from './converter-options';

export function axeToSarif(
    axeResults: Axe.AxeResults,
    options?: ConverterOptions,
): SarifLog {
    options = options ? options : {};

    const resultDecorator = new ResultDecorator(rulesWCAGConfiguration);

    const sarifConverter = new SarifConverter();

    // AxeResults -> ScannerResults
    const scannerResults = resultDecorator.decorateResults(axeResults);

    // ScannerResults -> ISarifLog
    return sarifConverter.convert(scannerResults, options);
}

export function axeRawToSarif(
    axeResults: Axe.AxeResults,
    options?: ConverterOptions,
): SarifLog {
    options = options ? options : {};

    const resultDecorator = new ResultDecorator(rulesWCAGConfiguration);

    const axeRawSarifConverter = new AxeRawSarifConverter();

    // AxeResults -> ScannerResults
    const scannerResults = resultDecorator.decorateResults(axeResults);

    // ScannerResults -> ISarifLog
    return axeRawSarifConverter.convert(scannerResults, options);
}
