// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { EnvironmentData } from './environment-data';
import { getInvocations21 } from './invocation-provider';

describe('invocation-provider-2.1', () => {
    describe('getInvocations21', () => {
        it('populates invocations with data from environmentData parameter', () => {
            const environmentDataStub: EnvironmentData = {
                targetPageUrl: 'https://example.com',
                targetPageTitle: 'Environment Data Stub',
                timestamp: '2018-03-23T21:36:58.321Z',
            };
            const invocationStub: Sarif.Invocation[] = [
                {
                    startTimeUtc: '2018-03-23T21:36:58.321Z',
                    endTimeUtc: '2018-03-23T21:36:58.321Z',
                    executionSuccessful: true,
                },
            ];
            const actualResults: Sarif.Invocation[] = getInvocations21(
                environmentDataStub,
            );
            expect(actualResults).toEqual(invocationStub);
        });
    });
});
