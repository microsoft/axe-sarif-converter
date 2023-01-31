// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { getConverterProperties } from './converter-property-provider';

describe('converter-property-provider', () => {
    describe('getConverterProperties', () => {
        it('returns the converter properties as a Sarif.Run["conversion"', () => {
            var packagejson = require('../package.json');
            const version = packagejson.version;
            const expectedResults: Sarif.Run['conversion'] = {
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

            const actualResults: Sarif.Run['conversion'] =
                getConverterProperties();
            expect(actualResults).toEqual(expectedResults);
        });
    });
});
