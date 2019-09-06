#!/usr/bin/env node
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from 'fs';
import { Log } from 'sarif';
import * as yargs from 'yargs';
import { convertAxeToSarif } from '.';

type Arguments = {
    input: string[];
    outFile: string;
    verbose: boolean;
    pretty: boolean;
    force: boolean;
};

const argv: Arguments = yargs
    .scriptName('axe-sarif-converter')
    .version() // inferred from package.json
    .usage('$0: Converts axe-core result JSON files to SARIF files')
    .example('$0 -i axe-results.json -o axe-results.sarif', '')
    .option('input', {
        alias: 'i',
        describe: 'Input file(s). Does not support globs.',
        demandOption: true,
        type: 'string',
    })
    .array('input')
    .option('outFile', {
        alias: 'o',
        describe:
            'Output file. Multiple input files will be combined into one output file with multiple runs.',
        demandOption: true,
        type: 'string',
    })
    .option('verbose', {
        alias: 'v',
        describe: 'Enables verbose console output.',
        default: false,
        type: 'boolean',
    })
    .option('pretty', {
        alias: 'p',
        describe:
            'Includes line breaks and indentation in the output SARIF content.',
        default: false,
        type: 'boolean',
    })
    .option('force', {
        alias: 'f',
        describe:
            'Overwrites the output file if it already exists, instead of failing.',
        default: false,
        type: 'boolean',
    }).argv;

const verboseLog = argv.verbose ? console.log : () => {};

function exitWithErrorMessage(message: string) {
    console.error(message);
    process.exit(1);
}

const sarifLogs: Log[] = argv.input.map((inputFilePath, index) => {
    verboseLog(
        `Reading input file ${index + 1}/${argv.input.length} ${inputFilePath}`,
    );

    // tslint:disable-next-line: non-literal-fs-path
    const rawInputFileContents = fs.readFileSync(inputFilePath);
    const axeResults = JSON.parse(rawInputFileContents.toString());
    return convertAxeToSarif(axeResults);
});

verboseLog(`Aggregating converted input file(s) into one SARIF log`);
const combinedLog: Log = {
    ...sarifLogs[0],
    runs: sarifLogs.map(log => log.runs[0]),
};

verboseLog(`Formatting SARIF data into file contents`);
const jsonSpacing = argv.pretty ? 2 : undefined;
const outputFileContent = JSON.stringify(combinedLog, null, jsonSpacing);

verboseLog(`Writing output file ${argv.outFile}`);
try {
    // tslint:disable-next-line: non-literal-fs-path
    fs.writeFileSync(argv.outFile, outputFileContent, {
        flag: argv.force ? 'w' : 'wx',
    });
} catch (e) {
    if (e.code == 'EEXIST') {
        exitWithErrorMessage(
            `Error: EEXIST: Output file ${argv.outFile} already exists. Did you mean to use --force?`,
        );
    } else {
        throw e;
    }
}

verboseLog(`Done`);
