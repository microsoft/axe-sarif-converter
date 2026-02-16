// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ImpactValue } from 'axe-core';
export interface AxeRawResult {
    id: string;
    result: string;
    pageLevel: boolean;
    impact?: ImpactValue;
    tags: string[];
    help: string;
    helpUrl: string;
    description: string;
    inapplicable: AxeRawNodeResult[];
    violations?: AxeRawNodeResult[];
    passes?: AxeRawNodeResult[];
    incomplete?: AxeRawNodeResult[];
}

export interface AxeRawNodeResult {
    any: AxeRawCheckResult[];
    all: AxeRawCheckResult[];
    none: AxeRawCheckResult[];
    node: AxeRawNode;
    impact?: ImpactValue;
    result?: ResultValue;
}

export interface AxeRawCheckResult {
    id: string;
    data?: unknown;
    relatedNodes: AxeRawNode[];
    impact: ImpactValue;
    message?: string;
}

export interface AxeRawNode {
    selector: Selector;
    source: string;
    xpath: string[];
}

export type ResultValue = 'passed' | 'failed' | 'inapplicable' | 'cantTell';

export type Selector = string[];
