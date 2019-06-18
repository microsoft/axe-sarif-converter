// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults } from 'axe-core';
import * as fs from 'fs';
import { sortBy } from 'lodash';
import * as Sarif from 'sarif';
import { IMock, It, Mock, Times } from 'typemoq';
import { getArtifactProperties } from './artifact-property-provider';
import { AxeRawResult } from './axe-raw-result';
import {
    AxeRawSarifConverter21,
    defaultAxeRawSarifConverter21,
} from './axe-raw-sarif-converter-21';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { EnvironmentData } from './environment-data';
import { getInvocations21 } from './invocation-provider-21';
import { defaultSarifConverter21 } from './sarif-converter-21';

function normalizeSarif(sarif: Sarif.Log): void {
    sarif.runs[0].results = sortBy(sarif.runs[0].results, [
        'ruleId',
        'partialFingerprints.fullyQualifiedLogicalName',
        'level',
    ]);
    sarif.runs[0].tool!.driver.rules = sortBy(
        sarif.runs[0].tool!.driver.rules,
        ['id'],
    ) as any;
}

describe('AxeRawSarifConverter21', () => {
    describe('integrated with default dependencies', () => {
        let testSubject: AxeRawSarifConverter21;

        beforeEach(() => {
            testSubject = defaultAxeRawSarifConverter21();
        });

        it.skip('produces the same output as the v2 converter for equivalent raw input', () => {
            const axeJSON: string = fs.readFileSync(
                './src/test-resources/axe-v3.2.2.reporter-v2.json',
                'utf8',
            );
            const axeResult: AxeResults = JSON.parse(axeJSON) as AxeResults;
            const axeToSarifOutput = defaultSarifConverter21().convert(
                axeResult,
                {},
            );

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

            const axeRawToSarifOutput = testSubject.convert(
                axeRawResult,
                {},
                environmentDataStub,
            );

            normalizeSarif(axeRawToSarifOutput);
            normalizeSarif(axeToSarifOutput);

            expect(axeRawToSarifOutput).toEqual(axeToSarifOutput);
        });
    });

    describe('convert', () => {
        let stubEnvironmentData: EnvironmentData;

        const stubConverterProperties: Sarif.Run['conversion'] = {
            tool: {
                driver: {
                    name: 'stub_converter_property',
                },
            },
        };
        const stubToolProperties: Sarif.Run['tool'] = {
            driver: {
                name: 'stub_tool_property',
                rules: [],
            },
        };
        const stubInvocations: Sarif.Invocation[] = [
            { executionSuccessful: true },
        ];
        const stubArtifactProperties: Sarif.Artifact[] = [
            { encoding: 'stub_encoding' },
        ];

        const converterPropertyProviderStub: () => Sarif.Run['conversion'] = () => {
            return {} as Sarif.Run['conversion'];
        };
        const axeToolPropertyProviderStub: () => Sarif.ToolComponent = () => {
            return {} as Sarif.ToolComponent;
        };
        const invocationProviderStub: () => Sarif.Invocation[] = () => {
            return stubInvocations;
        };
        const artifactPropertyProviderStub: () => Sarif.Artifact[] = () => {
            return stubArtifactProperties;
        };

        beforeEach(() => {
            stubEnvironmentData = {
                targetPageUrl: 'stub_url',
            } as EnvironmentData;
        });

        it('outputs a sarif log whose run uses the axeToolPropertyProvider to populate the tool property', () => {
            const axeToolPropertyProviderMock: IMock<
                () => Sarif.ToolComponent
            > = Mock.ofInstance(getAxeToolProperties21);
            axeToolPropertyProviderMock
                .setup(ap => ap())
                .returns(() => stubToolProperties['driver'])
                .verifiable(Times.once());

            const testSubject = new AxeRawSarifConverter21(
                converterPropertyProviderStub,
                axeToolPropertyProviderMock.object,
                invocationProviderStub,
                artifactPropertyProviderStub,
            );
            const irrelevantResults: AxeRawResult[] = [];
            const irrelevantOptions: ConverterOptions = {};

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
                stubEnvironmentData,
            );

            axeToolPropertyProviderMock.verifyAll();
            expect(actualResults).toHaveProperty('runs');
            expect(actualResults.runs[0]).toHaveProperty(
                'tool',
                stubToolProperties,
            );
        });

        it('outputs a sarif log whose run uses the invocationsProvider to populate the invocations property', () => {
            const invocationProviderMock: IMock<
                (environmentData: EnvironmentData) => Sarif.Invocation[]
            > = Mock.ofInstance(getInvocations21);
            invocationProviderMock
                .setup(ip =>
                    ip(It.isObjectWith<EnvironmentData>(stubEnvironmentData)),
                )
                .returns(() => stubInvocations)
                .verifiable(Times.once());

            const testSubject = new AxeRawSarifConverter21(
                converterPropertyProviderStub,
                axeToolPropertyProviderStub,
                invocationProviderMock.object,
                artifactPropertyProviderStub,
            );
            const irrelevantResults: AxeRawResult[] = [];
            const irrelevantOptions: ConverterOptions = {};

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
                stubEnvironmentData,
            );

            invocationProviderMock.verifyAll();
            expect(actualResults).toHaveProperty('runs');
            expect(actualResults.runs[0]).toHaveProperty(
                'invocations',
                stubInvocations,
            );
        });

        it('outputs a sarif log whose run uses the converterPropertyProvider to populate the conversion property', () => {
            const converterPropertyProviderMock: IMock<
                () => Sarif.Run['conversion']
            > = Mock.ofInstance(getConverterProperties);
            converterPropertyProviderMock
                .setup(cp => cp())
                .returns(() => stubConverterProperties)
                .verifiable(Times.once());

            const irrelevantResults: AxeRawResult[] = [];
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new AxeRawSarifConverter21(
                converterPropertyProviderMock.object,
                axeToolPropertyProviderStub,
                invocationProviderStub,
                artifactPropertyProviderStub,
            );

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
                stubEnvironmentData,
            );

            converterPropertyProviderMock.verifyAll();
            expect(actualResults).toHaveProperty('runs');
            expect(actualResults.runs[0]).toHaveProperty(
                'conversion',
                stubConverterProperties,
            );
        });

        it('outputs a sarif log whose run uses the artifactPropertyProvider to populate the artifacts property', () => {
            const artifactPropertyProviderMock: IMock<
                (environmentData: EnvironmentData) => Sarif.Artifact
            > = Mock.ofInstance(getArtifactProperties);
            artifactPropertyProviderMock
                .setup(ap => ap(It.isAny()))
                .returns(() => stubArtifactProperties)
                .verifiable(Times.once());

            const irrelevantResults: AxeRawResult[] = [];
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new AxeRawSarifConverter21(
                converterPropertyProviderStub,
                axeToolPropertyProviderStub,
                invocationProviderStub,
                artifactPropertyProviderMock.object,
            );

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
                stubEnvironmentData,
            );

            artifactPropertyProviderMock.verifyAll();
            expect(actualResults).toHaveProperty('runs');
            expect(actualResults.runs[0]).toHaveProperty('artifacts', [
                stubArtifactProperties,
            ]);
        });
    });
});
