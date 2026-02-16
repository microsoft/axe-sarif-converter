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
    // We use the global "axe" object to detect this rather than saying
    // "import { version } from 'axe-core'"" because we want to pick up the
    // version of axe that is invoking us, which will usually be a *peer*
    // dependency, rather than using the version that axe-sarif-converter built
    // against as a child dependency.
    const globalWithAxe = global as unknown as {
        axe?: { version: string };
    };
    const globalAxeVersion = globalWithAxe.axe?.version;
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
