// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, Times } from 'typemoq';
import { getAxeToolProperties21 } from './axe-tool-property-provider-21';
import { ConverterOptions } from './converter-options';
import { DecoratedAxeResults } from './decorated-axe-results';
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';
import { SarifConverter21 } from './sarif-converter-21';
import * as Sarif from './sarif/sarif-2.1.2';

describe('SarifConverter21', () => {
    describe('convert', () => {
        const stubToolProperties: Sarif.Run['tool'] = {
            driver: {
                name: 'stub_tool_property',
            },
        };
        const stubInvocations: Sarif.Invocation[] = [
            { commandLine: 'stub_invocation' },
        ];
        const stubTimestamp: string = 'stub_timestamp';
        const stubTargetPageUrl: string = 'stub_url';
        const stubTargetPageTitle: string = 'stub_title';
        const stubEnvironmentData: EnvironmentData = {
            timestamp: stubTimestamp,
            targetPageUrl: stubTargetPageUrl,
            targetPageTitle: stubTargetPageTitle,
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
            > = Mock.ofInstance(getAxeToolProperties21);
            axeToolPropertyProviderMock
                .setup(ap => ap())
                .returns(() => stubToolProperties)
                .verifiable(Times.once());

            const irrelevantResults: DecoratedAxeResults = {} as DecoratedAxeResults;
            const irrelevantOptions: ConverterOptions = {};

            const testSubject = new SarifConverter21(
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
            const stubResults: DecoratedAxeResults = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
                targetPageTitle: stubTargetPageTitle,
                passes: [],
                violations: [],
                inapplicable: [],
                incomplete: [],
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

            const testSubject = new SarifConverter21(
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
