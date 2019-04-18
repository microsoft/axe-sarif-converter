// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentData } from './environment-data';
import * as Sarif from './sarif/sarif-2.0.0';

export function getInvocations(
    environmentData: EnvironmentData,
): Sarif.Invocation[] {
    return [
        {
            startTime: environmentData.timestamp,
            endTime: environmentData.timestamp,
        },
    ];
}
