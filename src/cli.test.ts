// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
// tslint:disable: mocha-no-side-effect-code

describe('axe-sarif-converter CLI', () => {
    it('prints help info with --help', async () => {
        const output = await invokeCliWith('--help');
        expect(output.stderr).toBe('');
        expect(output.stdout).toMatchSnapshot('help_stdout');
    });

    it('prints version number from package.json with --version', async () => {
        const output = await invokeCliWith('--version');
        expect(output.stderr).toBe('');
        expect(output.stdout).toBe('0.0.0-managed-by-semantic-release\n');
    });

    it('requires the -i parameter', async () => {
        const outputFile = path.join(testResultsDir, 'overwrite_test.sarif');
        await writeFile(outputFile, 'preexisting content');

        try {
            await invokeCliWith(`-o irrelevant.sarif`);
            fail('Should have returned non-zero exit code');
        } catch (e) {
            expect(e.stderr).toMatch('Missing required argument: input');
        }
    });

    it('requires the -o parameter', async () => {
        const outputFile = path.join(testResultsDir, 'overwrite_test.sarif');
        await writeFile(outputFile, 'preexisting content');

        try {
            await invokeCliWith(`-i irrelevant.json`);
            fail('Should have returned non-zero exit code');
        } catch (e) {
            expect(e.stderr).toMatch('Missing required argument: outFile');
        }
    });

    it('supports basic conversion with short-form i/o args', async () => {
        const outputFile = path.join(testResultsDir, 'basic_short.sarif');
        await deleteIfExists(outputFile);

        const output = await invokeCliWith(
            `-i ${basicAxeV2File} -o ${outputFile}`,
        );

        expect(output.stderr).toBe('');
        expect(output.stdout).toBe('');
        expectSameJSONContent(outputFile, basicSarifFile);
    });

    it('supports basic conversion with long-form i/o args', async () => {
        const outputFile = path.join(testResultsDir, 'basic_long.sarif');
        await deleteIfExists(outputFile);

        const output = await invokeCliWith(
            `--input ${basicAxeV2File} --outFile ${outputFile}`,
        );

        expect(output.stderr).toBe('');
        expect(output.stdout).toBe('');
        expectSameJSONContent(outputFile, basicSarifFile);
    });

    it("doesn't overwrite existing files by default", async () => {
        const outputFile = path.join(
            testResultsDir,
            'overwrite_no_force.sarif',
        );
        await writeFile(outputFile, 'preexisting content');

        try {
            await invokeCliWith(`-i ${basicAxeV2File} -o ${outputFile}`);
            fail('Should have returned non-zero exit code');
        } catch (e) {
            expect(e.code).toBeGreaterThan(0);
            expect(e.stderr).toMatch('Did you mean to use --force?');
        }

        const outputFileContent = (await readFile(outputFile)).toString();
        expect(outputFileContent).toBe('preexisting content');
    });

    it.each(['-f', '--force'])('overwrites files with %s', async arg => {
        const outputFile = path.join(testResultsDir, `overwrite_${arg}.sarif`);
        await writeFile(outputFile, 'preexisting content');

        await invokeCliWith(`-i ${basicAxeV2File} -o ${outputFile} ${arg}`);

        expectSameJSONContent(outputFile, basicSarifFile);
    });

    it.each(['-v', '--verbose'])('emits verbose output', async verboseArg => {
        const outputFile = path.join(
            testResultsDir,
            'emits_verbose_output.sarif',
        );
        await deleteIfExists(outputFile);

        const output = await invokeCliWith(
            `-i ${basicAxeV2File} -o ${outputFile} ${verboseArg}`,
        );

        expect(output.stderr).toBe('');
        expect(output.stdout).toContain(basicAxeV2File);
        expect(output.stdout).toContain(outputFile);

        expectSameJSONContent(outputFile, basicSarifFile);
    });

    it.each(['-p', '--pretty'])('pretty-prints', async prettyArg => {
        const outputFile = path.join(testResultsDir, 'pretty-prints.sarif');
        await deleteIfExists(outputFile);

        await invokeCliWith(
            `-i ${basicAxeV2File} -o ${outputFile} ${prettyArg}`,
        );

        const outputContents = (await readFile(outputFile)).toString();

        const lines = outputContents.split('\n');
        expect(lines.length).toBeGreaterThan(100);
        expect(lines.every(line => line.length < 200)).toBe(true);
    });

    async function invokeCliWith(
        args: string,
    ): Promise<{ stderr: string; stdout: string }> {
        return await exec(`node ${__dirname}/../dist/cli.js ${args}`);
    }

    const testResourcesDir = path.join(__dirname, 'test-resources');
    const testResultsDir = path.join(__dirname, '..', 'test-results');
    const basicAxeV2File = path.join(
        testResourcesDir,
        'basic-axe-v3.2.2-reporter-v2.json',
    );
    const basicSarifFile = path.join(
        testResourcesDir,
        'basic-axe-v3.2.2-sarif-v2.1.2.sarif',
    );

    const writeFile = promisify(fs.writeFile);
    const readFile = promisify(fs.readFile);
    const unlink = promisify(fs.unlink);
    const exec = promisify(child_process.exec);

    async function deleteIfExists(path: string): Promise<void> {
        try {
            await unlink(path);
        } catch (e) {
            if (e.code != 'ENOENT') {
                throw e;
            }
        }
    }

    async function expectSameJSONContent(
        actualFile: string,
        expectedFile: string,
    ) {
        const actualContentBuffer = await readFile(actualFile);
        const actualJSONContent = JSON.parse(actualContentBuffer.toString());

        const expectedContentBuffer = await readFile(expectedFile);
        const expectedJSONContent = JSON.parse(
            expectedContentBuffer.toString(),
        );

        expect(actualJSONContent).toStrictEqual(expectedJSONContent);
    }
});
