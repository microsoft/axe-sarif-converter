// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DecoratedAxeResults } from './decorated-axe-results';
import { EnvironmentData } from './environment-data';

export function getEnvironmentData(
    axeResults: DecoratedAxeResults,
): EnvironmentData {
    return {
        timestamp: axeResults.timestamp,
        targetPageUrl: axeResults.targetPageUrl,
        targetPageTitle: axeResults.targetPageTitle,
    };
}
