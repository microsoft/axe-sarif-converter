export interface AxeRawResult {
    id: string;
    result: string;
    pageLevel: boolean;
    impact?: Impact;
    tags: string[];
    help: string;
    helpUrl: string;
    description: string;
    inapplicable: RawNodeResult[];
    violations?: RawNodeResult[];
    passes?: RawNodeResult[];
    incomplete?: RawNodeResult[];
}

export interface RawNodeResult {
    any: NodeElement[];
    all: NodeElement[];
    none: NodeElement[];

    node: {
        selector: Selector;
    };
    impact?: Impact;
    result?: 'passed' | 'failed' | 'inapplicable' | 'incomplete';
}

export interface NodeElement {
    id: string;
    data?: string | object;
    relatedNodes: []; // of type node in RawNodeResult
    impact: Impact;
    message?: string;
}

export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

export type SelectorItem = string[] | string;

export type Selector = SelectorItem[];
