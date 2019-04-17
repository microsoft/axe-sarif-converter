// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from './sarif/sarif-2.0.0';

export function getAxeToolProperties() {
    return {
        name: 'axe',
        fullName: 'axe-core',
        semanticVersion: '3.2.2',
        version: '3.2.2',
        properties: {
            downloadUri: 'https://www.deque.com/axe/',
        },
    } as Sarif.Run['tool'];
}
