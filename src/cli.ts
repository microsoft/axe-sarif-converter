#!/usr/bin/env node
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from 'fs';
import { Log } from 'sarif';
import * as yargs from 'yargs';
import { convertAxeToSarif } from '.';

type Arguments = {
    'input-files': string[];
    'output-file': string;
    verbose: boolean;
    pretty: boolean;
    force: boolean;
};

const argv: Arguments = yargs
    .scriptName('axe-sarif-converter')
    .version() // inferred from package.json
    .usage(
        '$0: Converts JSON files containing axe-core Result object(s) into SARIF files',
    )
    .example('$0 -i axe-results.json -o axe-results.sarif', '')
    .option('input-files', {
        alias: 'i',
        describe:
            'Input JSON file(s) containing axe-core Result object(s). Does not support globs. Each input file may consist of either a single root-level axe-core Results object or a root-level array of axe-core Results objects.',
        demandOption: true,
        type: 'string',
    })
    .array('input-files')
    .option('output-file', {
        alias: 'o',
        describe:
            'Output SARIF file. Multiple input files (or input files containing multiple Result objects) will be combined into one output file with a SARIF Run per axe-core Result.',
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
        describe: 'Includes line breaks and indentation in the output.',
        default: false,
        type: 'boolean',
    })
    .option('force', {
        alias: 'f',
        describe: 'Overwrites the output file if it already exists.',
        default: false,
        type: 'boolean',
    })
    .parseSync();

const verboseLog = argv.verbose ? console.log : () => {};

function exitWithErrorMessage(message: string) {
    console.error(message);
    process.exit(1);
}

function flatten<T>(nestedArray: T[][]): T[] {
    return nestedArray.reduce(
        (accumulator, next) => accumulator.concat(next),
        [],
    );
}

const sarifLogs: Log[] = flatten(
    argv['input-files'].map((inputFilePath, index) => {
        verboseLog(
            `Reading input file ${index + 1}/${
                argv['input-files'].length
            } ${inputFilePath}`,
        );

        // tslint:disable-next-line: non-literal-fs-path
        const rawInputFileContents = fs.readFileSync(inputFilePath);
        const inputFileJson = JSON.parse(rawInputFileContents.toString());
        if (Array.isArray(inputFileJson)) {
            // Treating as array of axe results, like @axe-core/cli produces
            return inputFileJson.map(convertAxeToSarif);
        } else {
            // Treating as a single axe results object, like
            // JSON.stringify(await axe.run(...)) would produce
            return [convertAxeToSarif(inputFileJson)];
        }
    }),
);

verboseLog(`Aggregating converted input file(s) into one SARIF log`);
const combinedLog: Log = {
    ...sarifLogs[0],
    runs: flatten(sarifLogs.map((log) => log.runs)),
};

verboseLog(`Formatting SARIF data into file contents`);
const jsonSpacing = argv.pretty ? 2 : undefined;
const outputFileContent = JSON.stringify(combinedLog, null, jsonSpacing);

verboseLog(`Writing output file ${argv['output-file']}`);
try {
    // tslint:disable-next-line: non-literal-fs-path
    fs.writeFileSync(argv['output-file'], outputFileContent, {
        flag: argv.force ? 'w' : 'wx',
    });
} catch (e) {
    if (typeof e === 'object' && e != null && (e as any).code === 'EEXIST') {
        exitWithErrorMessage(
            `Error: EEXIST: Output file ${argv['output-file']} already exists. Did you mean to use --force?`,
        );
    } else {
        throw e;
    }
}

verboseLog(`Done`);
