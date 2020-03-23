// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { IMock, It, Mock, Times } from 'typemoq';
import { getArtifactProperties } from './artifact-property-provider';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { ConverterOptions } from './converter-options';
import { getConverterProperties } from './converter-property-provider';
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';
import { SarifConverter } from './sarif-converter';

describe('SarifConverter', () => {
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
        const stubAxeVersion: string = 'stub_axe_version';
        const stubEnvironmentData: EnvironmentData = {
            timestamp: stubTimestamp,
            targetPageUrl: stubTargetPageUrl,
            axeVersion: stubAxeVersion,
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
            const axeToolPropertyProviderMock: IMock<(
                environmentData: EnvironmentData,
            ) => Sarif.ToolComponent> = Mock.ofInstance(getAxeToolProperties);
            axeToolPropertyProviderMock
                .setup((ap) =>
                    ap(
                        It.isObjectWith({
                            axeVersion: stubAxeVersion,
                        } as EnvironmentData),
                    ),
                )
                .returns(() => stubToolProperties['driver'])
                .verifiable(Times.once());

            const stubAxeResults: Axe.AxeResults = {
                testEngine: {
                    version: stubAxeVersion,
                },
            } as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter(
                converterPropertyProviderStub,
                axeToolPropertyProviderMock.object,
                invocationProviderStub,
                artifactPropertyProviderStub,
            );

            const actualResults = testSubject.convert(
                stubAxeResults,
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
                toolOptions: {} as Axe.RunOptions,
                testEngine: {
                    version: stubAxeVersion,
                } as Axe.TestEngine,
                testRunner: {} as Axe.TestRunner,
                testEnvironment: {} as Axe.TestEnvironment,
            };
            const irrelevantOptions: ConverterOptions = {};

            const invocationProviderMock: IMock<(
                environmentData: EnvironmentData,
            ) => Sarif.Invocation[]> = Mock.ofInstance(getInvocations);
            invocationProviderMock
                .setup((ip) =>
                    ip(It.isObjectWith<EnvironmentData>(stubEnvironmentData)),
                )
                .returns(() => stubInvocations)
                .verifiable(Times.once());

            const testSubject = new SarifConverter(
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
            const converterPropertyProviderMock: IMock<() => Sarif.Run['conversion']> = Mock.ofInstance(
                getConverterProperties,
            );
            converterPropertyProviderMock
                .setup((cp) => cp())
                .returns(() => stubConverterProperties)
                .verifiable(Times.once());

            const stubAxeResults: Axe.AxeResults = {
                testEngine: {
                    version: stubAxeVersion,
                },
            } as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter(
                converterPropertyProviderMock.object,
                axeToolPropertyProviderStub,
                invocationProviderStub,
                artifactPropertyProviderStub,
            );

            const actualResults = testSubject.convert(
                stubAxeResults,
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
            const artifactPropertyProviderMock: IMock<(
                environmentData: EnvironmentData,
            ) => Sarif.Artifact> = Mock.ofInstance(getArtifactProperties);
            artifactPropertyProviderMock
                .setup((ap) =>
                    ap(
                        It.isObjectWith({
                            targetPageUrl: stubTargetPageUrl,
                        } as EnvironmentData),
                    ),
                )
                .returns(() => stubArtifactProperties)
                .verifiable(Times.once());

            const stubAxeResults: Axe.AxeResults = {
                testEngine: {
                    version: stubAxeVersion,
                },
                url: stubTargetPageUrl,
            } as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter(
                converterPropertyProviderStub,
                axeToolPropertyProviderStub,
                invocationProviderStub,
                artifactPropertyProviderMock.object,
            );

            const actualResults = testSubject.convert(
                stubAxeResults,
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
