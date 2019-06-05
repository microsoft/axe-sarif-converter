// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentData } from './environment-data';
import * as Sarif from './sarif/sarif-2.1.2';

export function getArtifactProperties(
    environmentData: EnvironmentData,
): Sarif.Artifact[] {
    return [
        {
            location: {
                uri: environmentData.targetPageUrl,
                index: 0,
            },
            sourceLanguage: 'html',
            roles: ['analysisTarget'],
            description: {
                text: environmentData.targetPageTitle,
            },
        },
    ];
}
