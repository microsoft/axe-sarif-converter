// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { EnvironmentData } from './environment-data';

export function getEnvironmentDataFromResults(
    axeResults: Axe.AxeResults,
): EnvironmentData {
    return {
        timestamp: axeResults.timestamp,
        targetPageUrl: axeResults.url,
    };
}

export function getEnvironmentDataFromEnvironment(): EnvironmentData {
    return {
        timestamp: new Date().toISOString(),
        targetPageUrl: window.location.href,
        targetPageTitle: document.title,
    };
}
