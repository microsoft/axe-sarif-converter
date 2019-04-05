// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { CheckConfiguration, RuleConfiguration } from './ruleresults';

declare module 'axe-core/axe' {
    const commons: {
        aria: {
            label: Function;
            implicitRole: Function;
            getRolesByType: Function;
            lookupTable: any;
        };
        dom: {
            isVisible: Function;
            idrefs: (node: HTMLElement, attr: string) => HTMLElement[];
        };
        text: {
            accessibleText: Function;
        };
    };

    const utils: {
        toArray: Function;
        matchesSelector: Function;
    };

    const _audit: {
        defaultConfig: {
            rules: RuleConfiguration[];
            checks: CheckConfiguration[];
        };
    };

    export interface AxeRawResult {
        id: string;
        result: string;
        pageLevel: boolean;
        impact?: Impact;
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
        impact?: Impact;
        result?: 'passed' | 'failed' | 'inapplicable' | 'incomplete';
    }

    export interface AxeRawCheckResult {
        id: string;
        data?: any;
        relatedNodes: AxeRawNode[];
        impact: Impact;
        message?: string;
    }

    export interface AxeRawNode {
        selector: Selector;
    }

    export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

    export type SelectorItem = string[] | string;

    export type Selector = SelectorItem[];
}
