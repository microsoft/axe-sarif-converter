// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { EnvironmentData } from './environment-data';
import { getInvocations } from './invocation-provider';

describe('invocation-provider', () => {
    describe('getInvocations', () => {
        it('populates invocations with data from environmentData parameter', () => {
            const environmentDataStub: EnvironmentData = {
                targetPageUrl: 'https://example.com',
                targetPageTitle: 'Environment Data Stub',
                timestamp: '2018-03-23T21:36:58.321Z',
                axeVersion: 'stub_version',
            };
            const invocationStub: Sarif.Invocation[] = [
                {
                    startTimeUtc: '2018-03-23T21:36:58.321Z',
                    endTimeUtc: '2018-03-23T21:36:58.321Z',
                    executionSuccessful: true,
                },
            ];
            const actualResults: Sarif.Invocation[] = getInvocations(
                environmentDataStub,
            );
            expect(actualResults).toEqual(invocationStub);
        });
    });
});
