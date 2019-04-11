// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { WCAG } from './wcag';

export interface AxeResultDecorations {
    WCAG?: WCAG[];
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
