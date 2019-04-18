// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeResults } from 'axe-core';
import { EnvironmentData } from './environment-data';

export function getEnvironmentData(axeResults: AxeResults): EnvironmentData {
    return {
        timestamp: axeResults.timestamp,
        targetPageUrl: axeResults.url,
        targetPageTitle: '',
    };
}
