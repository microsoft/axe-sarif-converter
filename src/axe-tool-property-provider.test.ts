// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { getAxeToolProperties } from './axe-tool-property-provider';
import * as Sarif from './sarif/sarif-2.0.0';

describe('axe-tool-property-provider', () => {
    describe('getAxeToolProperties', () => {
        it("returns the axe properties as a Sarif.Run['tool']", () => {
            const expectedResults: Sarif.Run['tool'] = {
                name: 'axe',
                fullName: 'axe-core',
                semanticVersion: '3.2.2',
                version: '3.2.2',
                properties: {
                    downloadUri: 'https://www.deque.com/axe/',
                },
            };

            const actualResults: Sarif.Run['tool'] = getAxeToolProperties();
            expect(actualResults).toEqual(expectedResults);
        });
    });
});
