// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { IMock, It, Mock, Times } from 'typemoq';
import { getArtifactProperties } from './artifact-property-provider';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { EnvironmentData } from './environment-data';
import { getInvocations21 } from './invocation-provider-21';
import { SarifConverter21 } from './sarif-converter-21';

describe('SarifConverter21', () => {
    describe('convert', () => {
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
        const stubTimestamp: string = 'stub_timestamp';
        const stubTargetPageUrl: string = 'stub_url';
        const stubEnvironmentData: EnvironmentData = {
            timestamp: stubTimestamp,
            targetPageUrl: stubTargetPageUrl,
        };

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

        it('outputs a sarif log whose run uses the axeToolPropertyProvider to populate the tool property', () => {
            const axeToolPropertyProviderMock: IMock<
                () => Sarif.ToolComponent
            > = Mock.ofInstance(getAxeToolProperties21);
            axeToolPropertyProviderMock
                .setup(ap => ap())
                .returns(() => stubToolProperties['driver'])
                .verifiable(Times.once());

            const irrelevantResults: Axe.AxeResults = {} as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter21(
                converterPropertyProviderStub,
                axeToolPropertyProviderMock.object,
                invocationProviderStub,
                artifactPropertyProviderStub,
            );

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
            );

            axeToolPropertyProviderMock.verifyAll();
            expect(actualResults).toHaveProperty('runs');
            expect(actualResults.runs[0]).toHaveProperty(
                'tool',
                stubToolProperties,
            );
        });

        it('outputs a sarif log whose run uses the invocationsProvider to populate the invocations property', () => {
            const stubResults: Axe.AxeResults = {
                timestamp: stubTimestamp,
                url: stubTargetPageUrl,
                passes: [],
                violations: [],
                inapplicable: [],
                incomplete: [],
                toolOptions: null!,
                testEngine: null!,
                testRunner: null!,
                testEnvironment: null!,
            } as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const invocationProviderMock: IMock<
                (environmentData: EnvironmentData) => Sarif.Invocation[]
            > = Mock.ofInstance(getInvocations21);
            invocationProviderMock
                .setup(ip =>
                    ip(It.isObjectWith<EnvironmentData>(stubEnvironmentData)),
                )
                .returns(() => stubInvocations)
                .verifiable(Times.once());

            const testSubject = new SarifConverter21(
                converterPropertyProviderStub,
                axeToolPropertyProviderStub,
                invocationProviderMock.object,
                artifactPropertyProviderStub,
            );

            const actualResults = testSubject.convert(
                stubResults,
                irrelevantOptions,
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

            const irrelevantResults: Axe.AxeResults = {} as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter21(
                converterPropertyProviderMock.object,
                axeToolPropertyProviderStub,
                invocationProviderStub,
                artifactPropertyProviderStub,
            );

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
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

            const irrelevantResults: Axe.AxeResults = {} as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter21(
                converterPropertyProviderStub,
                axeToolPropertyProviderStub,
                invocationProviderStub,
                artifactPropertyProviderMock.object,
            );

            const actualResults = testSubject.convert(
                irrelevantResults,
                irrelevantOptions,
            );

            artifactPropertyProviderMock.verifyAll();
            expect(actualResults).toHaveProperty('runs');
            expect(actualResults.runs[0]).toHaveProperty('artifacts', [
                stubArtifactProperties,
            ]);
        });
    });
});
