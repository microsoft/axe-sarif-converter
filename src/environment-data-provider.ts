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
        axeVersion: axeResults.testEngine.version,
    };
}

export function getEnvironmentDataFromEnvironment(): EnvironmentData {
    // We use the global axe rather than the imported axe to match the version
    // we're scanning from the context of
    const globalAxeVersion = (global as any).axe && (global as any).axe.version;
    if (!globalAxeVersion) {
        throw Error(
            'Could not infer axe version from global axe object. Are you running from the context of an axe reporter?',
        );
    }

    return {
        timestamp: new Date().toISOString(),
        targetPageUrl: window.location.href,
        targetPageTitle: document.title,
        axeVersion: globalAxeVersion,
    };
}
