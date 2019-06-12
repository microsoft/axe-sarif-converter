// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { EnvironmentData } from './environment-data';

export function getInvocations21(
    environmentData: EnvironmentData,
): Sarif.Invocation[] {
    return [
        {
            startTimeUtc: environmentData.timestamp,
            endTimeUtc: environmentData.timestamp,
            executionSuccessful: true,
        },
    ];
}
