// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Sarif from 'sarif';
import { EnvironmentData } from './environment-data';

export function getArtifactProperties(
    environmentData: EnvironmentData,
): Sarif.Artifact {
    return {
        location: getArtifactLocation(environmentData),
        sourceLanguage: 'html',
        roles: ['analysisTarget'],
        description: {
            text: environmentData.targetPageTitle,
        },
    };
}

export function getArtifactLocation(
    environmentData: EnvironmentData,
): Sarif.Artifact['location'] {
    return {
        uri: environmentData.targetPageUrl,
        index: 0,
    };
}
