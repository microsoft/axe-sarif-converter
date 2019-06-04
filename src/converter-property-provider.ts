// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from './sarif/sarif-2.1.2';

export function geConverterProperties(): Sarif.Run['conversion'] {
    return {
        tool: {
            driver: {
                name: 'axe-sarif-converter',
                fullName: 'axe-sarif-converter v1.3.0',
                version: '1.3.0',
                semanticVersion: '1.3.0',
                informationUri:
                    'https://github.com/microsoft/axe-sarif-converter/releases/tag/v1.3.0',
                downloadUri:
                    'https://www.npmjs.com/package/axe-sarif-converter/v/1.3.0',
            },
        },
    };
}
