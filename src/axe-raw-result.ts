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
    any: AxeRawCheck[];
    all: AxeRawCheck[];
    none: AxeRawCheck[];

    node: AxeRawNode;
    impact?: Impact;
    result?: 'passed' | 'failed' | 'inapplicable' | 'incomplete';
}

export interface AxeRawCheck {
    id: string;
    data?: string | object;
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
