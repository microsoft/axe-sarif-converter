// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { SarifConverter } from './sarif-converter';

describe('SarifConverter tests', () => {
    it('sarif converter is defined', () => {
        expect(new SarifConverter()).toBeDefined();
    });
});
