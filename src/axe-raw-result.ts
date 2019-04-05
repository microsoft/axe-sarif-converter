export interface AxeRawResult {
    id: string;
    result: string;
    pageLevel: boolean;
    impact?: string;
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
    // node: {
    //     selector: Selector;
    // };
    node: {
        impact?: 'minor' | 'moderate' | 'serious' | 'critical';
        any: {
            id: string;
            // impact
            message: string;
        };
    };
    result?: 'passed' | 'failed' | 'inapplicable' | 'incomplete';
}

export type SelectorItem = string[] | string;

export type Selector = SelectorItem[];
