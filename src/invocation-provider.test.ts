// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';
import * as Sarif from './sarif/sarif-2.0.0';

describe('invocation-provider', () => {
    describe('getInvocations', () => {
        it('populates invocations with data from environmentData parameter', () => {
            const environmentDataStub: EnvironmentData = {
                targetPageUrl: 'https://example.com',
                targetPageTitle: 'Environment Data Stub',
                timestamp: '2018-03-23T21:36:58.321Z',
            };
            const invocationStub: Sarif.Invocation[] = [
                {
                    startTime: '2018-03-23T21:36:58.321Z',
                    endTime: '2018-03-23T21:36:58.321Z',
                },
            ];
            const actualResults: Sarif.Invocation[] = getInvocations(
                environmentDataStub,
            );
            expect(actualResults).toEqual(invocationStub);
        });
    });
});
