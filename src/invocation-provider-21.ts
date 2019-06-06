// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentData } from './environment-data';
import * as Sarif from './sarif/sarif-2.1.2';

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
