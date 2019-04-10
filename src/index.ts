// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { ResultDecorator } from './result-decorator';
import { SarifConverter } from './sarif-converter';
import { SarifLog } from './sarif/sarif-log';
import { rulesWCAGConfiguration } from './wcag-mappings';

export function convertAxeToSarif(axeResults: Axe.AxeResults): SarifLog {
    const resultDecorator = new ResultDecorator(rulesWCAGConfiguration);
    const decoratedAxeResults = resultDecorator.decorateResults(axeResults);

    const sarifConverter = new SarifConverter();
    return sarifConverter.convert(decoratedAxeResults, {});
}
