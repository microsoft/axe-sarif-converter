// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { IMock, It, Mock, Times } from 'typemoq';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { ConverterOptions } from './converter-options';
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';
import { SarifConverter } from './sarif-converter';
import * as Sarif from './sarif/sarif-2.0.0';

describe('SarifConverter', () => {
    describe('convert', () => {
        const stubToolProperties: Sarif.Run['tool'] = {
            name: 'stub_tool_property',
        };
        const stubInvocations: Sarif.Invocation[] = [
            { commandLine: 'stub_invocation' },
        ];
        const stubTimestamp: string = 'stub_timestamp';
        const stubTargetPageUrl: string = 'stub_url';
        const stubEnvironmentData: EnvironmentData = {
            timestamp: stubTimestamp,
            targetPageUrl: stubTargetPageUrl,
        };
        const axeToolPropertyProviderStub: () => Sarif.Run['tool'] = () => {
            return {} as Sarif.Run['tool'];
        };
        const invocationProviderStub: () => Sarif.Invocation[] = () => {
            return stubInvocations;
        };

        it('outputs a sarif log whose run uses the axeToolPropertyProvider to populate the tool property', () => {
            const axeToolPropertyProviderMock: IMock<
                () => Sarif.Run['tool']
            > = Mock.ofInstance(getAxeToolProperties);
            axeToolPropertyProviderMock
                .setup(ap => ap())
                .returns(() => stubToolProperties)
                .verifiable(Times.once());

            const irrelevantResults: Axe.AxeResults = {} as Axe.AxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter(
                axeToolPropertyProviderMock.object,
                invocationProviderStub,
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
                toolOptions: {} as Axe.RunOptions,
                testEngine: {} as Axe.TestEngine,
                testRunner: {} as Axe.TestRunner,
                testEnvironment: {} as Axe.TestEnvironment,
            };
            const irrelevantOptions: ConverterOptions = {};

            const invocationProviderMock: IMock<
                (environmentData: EnvironmentData) => Sarif.Invocation[]
            > = Mock.ofInstance(getInvocations);
            invocationProviderMock
                .setup(ip =>
                    ip(It.isObjectWith<EnvironmentData>(stubEnvironmentData)),
                )
                .returns(() => stubInvocations)
                .verifiable(Times.once());

            const testSubject = new SarifConverter(
                axeToolPropertyProviderStub,
                invocationProviderMock.object,
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
    });
});
