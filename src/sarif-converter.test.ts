// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IMock, It, Mock, Times } from 'typemoq';
import { ConverterOptions } from './converter-options';
import { DecoratedAxeResults } from './decorated-axe-results';
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';
import { SarifConverter } from './sarif-converter';
import * as Sarif from './sarif/sarif-2.0.0';

describe('SarifConverter', () => {
    describe('convert', () => {
        it('outputs a sarif log whose run uses the invocationsProvider to populate the invocations property', () => {
            const stubTimestamp: string = 'stub_timestamp';
            const stubTargetPageUrl: string = 'stub_url';
            const stubTargetPageTitle: string = 'stub_title';
            const stubResults: DecoratedAxeResults = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
                targetPageTitle: stubTargetPageTitle,
                passes: [],
                violations: [],
                inapplicable: [],
                incomplete: [],
            };
            const stubEnvironmentData: EnvironmentData = {
                timestamp: stubTimestamp,
                targetPageUrl: stubTargetPageUrl,
                targetPageTitle: stubTargetPageTitle,
            };
            const stubInvocations: Sarif.Invocation[] = [
                { commandLine: 'stub_invocation' },
            ];
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
