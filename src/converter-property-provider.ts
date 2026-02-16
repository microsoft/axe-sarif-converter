// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';

export function getConverterProperties(): Sarif.Run['conversion'] {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const packagejson = require('../package.json');
    const version = packagejson.version;
    return {
        tool: {
            driver: {
                name: 'axe-sarif-converter',
                fullName: 'axe-sarif-converter v' + version,
                version: version,
                semanticVersion: version,
                informationUri:
                    'https://github.com/microsoft/axe-sarif-converter/releases/tag/v' +
                    version,
                downloadUri:
                    'https://www.npmjs.com/package/axe-sarif-converter/v/' +
                    version,
            },
        },
    };
}
