// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults } from 'axe-core';
import * as fs from 'fs';
import { sortBy } from 'lodash';
import { convertAxeToSarif } from '.';
import { AxeRawResult } from './axe-raw-result';
import { AxeRawSarifConverter } from './axe-raw-sarif-converter';
import { EnvironmentData } from './environment-data';
import { SarifLog } from './sarif/sarif-log';

describe('axeRawToSarifConverter uses generated AxeRawResults object', () => {
    it('matches pinned snapshot of sarifv2 generated from an actual AxeRawResults object', () => {
        const axeJSON: string = fs.readFileSync(
            './src/test-resources/axe-v3.2.2.reporter-v2.json',
            'utf8',
        );
        const axeResult: AxeResults = JSON.parse(axeJSON) as AxeResults;
        const axeToSarifOutput = convertAxeToSarif(axeResult);

        const axeRawJSON: string = fs.readFileSync(
            './src/test-resources/axe-v3.2.2.reporter-raw.json',
            'utf8',
        );
        const axeRawResult: AxeRawResult[] = JSON.parse(
            axeRawJSON,
        ) as AxeRawResult[];

        const environmentDataStub: EnvironmentData = {
            timestamp: axeResult.timestamp,
            targetPageUrl: axeResult.url,
            targetPageTitle: '',
        };

        const axeRawSarifConverter = new AxeRawSarifConverter();

        const axeRawToSarifOutput = axeRawSarifConverter.convert(
            axeRawResult,
            {},
            environmentDataStub,
        );

        normalizeSarif(axeRawToSarifOutput);
        normalizeSarif(axeToSarifOutput);

        expect(axeRawToSarifOutput).toEqual(axeToSarifOutput);
    });
});

function normalizeSarif(sarif: SarifLog): void {
    sarif.runs[0].results = sortBy(sarif.runs[0].results, [
        'ruleId',
        'partialFingerprints.fullyQualifiedLogicalName',
        'level',
    ]);
    sarif.runs[0].resources!.rules = sortBy(sarif.runs[0].resources!.rules, [
        'id',
    ]) as any;
}
