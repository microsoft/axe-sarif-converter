// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, Mock, Times } from 'typemoq';
import { getAxeToolProperties } from './axe-tool-property-provider';
import { ConverterOptions } from './converter-options';
import { DecoratedAxeResults } from './decorated-axe-results';
import { defaultSarifConverter, SarifConverter } from './sarif-converter';
import * as Sarif from './sarif/sarif-2.0.0';

describe('SarifConverter', () => {
    it('is defined', () => {
        expect(defaultSarifConverter()).toBeDefined();
    });

    describe('convert', () => {
        it('outputs a sarif log whose run uses the axeToolPropertyProvider to populate the tool property', () => {
            const stubToolProperties: Sarif.Run['tool'] = {
                name: 'stub_tool_property',
            };

            const axeToolPropertyProviderMock: IMock<
                () => Sarif.Run['tool']
            > = Mock.ofInstance(getAxeToolProperties);

            axeToolPropertyProviderMock
                .setup(ap => ap())
                .returns(() => stubToolProperties)
                .verifiable(Times.once());

            const testSubject = new SarifConverter(
                axeToolPropertyProviderMock.object,
            );
            const irrelevantResults: DecoratedAxeResults = {
                passes: [],
                violations: [],
                inapplicable: [],
                incomplete: [],
                timestamp: 'stub_timestamp',
                targetPageUrl: 'https://example.com',
                targetPageTitle: 'stub_page_title',
            };
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
    });
});
