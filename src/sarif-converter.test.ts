// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, Times } from 'typemoq';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { ConverterOptions } from './converter-options';
import { DecoratedAxeResults } from './decorated-axe-results';
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';
import { defaultSarifConverter, SarifConverter } from './sarif-converter';
import * as Sarif from './sarif/sarif-2.0.0';

describe('SarifConverter', () => {
    it('is defined', () => {
        expect(defaultSarifConverter()).toBeDefined();
    });

    describe('convert', () => {
        let stubToolProperties: Sarif.Run['tool'];
        let stubInvocations: Sarif.Invocation[];

        let axeToolPropertyProviderMock: IMock<() => Sarif.Run['tool']>;
        let invocationProviderMock: IMock<
            (environmentData: EnvironmentData) => Sarif.Invocation[]
        >;

        const stubTimestamp: string = 'stub_timestamp';
        const stubTargetPageUrl: string = 'stub_url';
        const stubTargetPageTitle: string = 'stub_title';
        const stubEnvironmentData: EnvironmentData = {
            timestamp: stubTimestamp,
            targetPageUrl: stubTargetPageUrl,
            targetPageTitle: stubTargetPageTitle,
        };

        beforeEach(() => {
            stubToolProperties = {
                name: 'stub_tool_property',
            };
            stubInvocations = [{ commandLine: 'stub_invocation' }];

            axeToolPropertyProviderMock = Mock.ofInstance(getAxeToolProperties);
            invocationProviderMock = Mock.ofInstance(getInvocations);

            axeToolPropertyProviderMock
                .setup(ap => ap())
                .returns(() => stubToolProperties)
                .verifiable(Times.once());

            invocationProviderMock
                .setup(ip =>
                    ip(It.isObjectWith<EnvironmentData>(stubEnvironmentData)),
                )
                .returns(() => stubInvocations)
                .verifiable(Times.once());
        });
        it('outputs a sarif log whose run uses the axeToolPropertyProvider to populate the tool property', () => {
            const testSubject = new SarifConverter(
                axeToolPropertyProviderMock.object,
                invocationProviderMock.object,
            );
            const irrelevantResults: DecoratedAxeResults = {} as DecoratedAxeResults;
            const irrelevantOptions: ConverterOptions = {};

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

            const testSubject = new SarifConverter(
                axeToolPropertyProviderMock.object,
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
