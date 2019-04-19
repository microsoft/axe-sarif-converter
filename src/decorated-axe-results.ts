// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { WCAGLinkData } from './wcag-link-data';

export interface AxeResultDecorations {
    WCAG?: WCAGLinkData[];
}

export type DecoratedAxeResult = Axe.Result & AxeResultDecorations;

export interface DecoratedAxeResults {
    passes: DecoratedAxeResult[];
    violations: DecoratedAxeResult[];
    inapplicable: DecoratedAxeResult[];
    incomplete: DecoratedAxeResult[];
    timestamp: string;
    targetPageUrl: string;
    targetPageTitle: string;
}
