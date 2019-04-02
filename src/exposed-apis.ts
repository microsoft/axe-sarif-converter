export interface ScannerOptions {
    testsToRun?: string[];
    dom?: NodeSelector & Node | NodeList;
    selector?: string;
    include?: string[][];
    exclude?: string[][];
    enableBestPracticeRules?: boolean;
    returnSarif?: boolean;
    testCaseId?: string;
    scanId?: string;
    scanName?: string;
    includeFailingInstancesOnly?: boolean;
}
