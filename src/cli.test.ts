// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// tslint:disable: mocha-no-side-effect-code

describe('axe-sarif-converter CLI', () => {
    beforeAll(async () => {
        await ensureDirectoryExists(testResultsDir);
    });

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
        try {
            await invokeCliWith(`-o irrelevant.sarif`);
            fail('Should have returned non-zero exit code');
        } catch (e: any) {
            expect(e.stderr).toMatch('Missing required argument: input-files');
        }
    });

    it('requires the -o parameter', async () => {
        try {
            await invokeCliWith(`-i irrelevant.json`);
            fail('Should have returned non-zero exit code');
        } catch (e: any) {
            expect(e.stderr).toMatch('Missing required argument: output-file');
        }
    });

    it.each`
        inputFile
        ${'w3citylights-axe-v3.3.2.axe-cli-v3.1.1.json'}
        ${'basic-axe-v3.4.1.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.4.1.axe-cli-v3.2.0.json'}
        ${'basic-axe-v3.4.2.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.4.2.axe-cli-v3.2.0.json'}
        ${'basic-axe-v3.5.1.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.5.1.axe-cli-v3.2.0.json'}
        ${'basic-axe-v3.5.2.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.5.2.axe-cli-v3.2.0.json'}
        ${'basic-axe-v3.5.3.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.5.3.axe-cli-v3.2.0.json'}
        ${'basic-axe-v3.5.4.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.5.4.axe-cli-v3.2.0.json'}
        ${'basic-axe-v3.5.5.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v3.5.5.axe-cli-v3.2.0.json'}
        ${'basic-axe-v4.0.1.axe-cli-v3.2.0.json'}
        ${'w3citylights-axe-v4.0.1.axe-cli-v3.2.0.json'}
        ${'basic-axe-v4.0.2.axe-cli-v4.0.0.json'}
        ${'w3citylights-axe-v4.0.2.axe-cli-v4.0.0.json'}
        ${'basic-axe-v4.1.1.axe-cli-v4.1.0.json'}
        ${'w3citylights-axe-v4.1.1.axe-cli-v4.1.0.json'}
        ${'basic-axe-v4.2.0.axe-cli-v4.1.1.json'}
        ${'w3citylights-axe-v4.2.0.axe-cli-v4.1.1.json'}
        ${'basic-axe-v4.3.2.axe-cli-v4.2.2.json'}
        ${'w3citylights-axe-v4.3.2.axe-cli-v4.2.2.json'}
        ${'basic-axe-v4.4.1.axe-cli-v4.4.2.json'}
        ${'w3citylights-axe-v4.4.1.axe-cli-v4.4.2.json'}
        ${'basic-axe-v4.6.3.axe-cli-v4.6.0.json'}
        ${'w3citylights-axe-v4.6.3.axe-cli-v4.6.0.json'}
        ${'basic-axe-v4.7.2.axe-cli-v4.7.3.json'}
        ${'w3citylights-axe-v4.7.2.axe-cli-v4.7.3.json'}
        ${'basic-axe-v4.7.2.axe-cli-v4.8.4.json'}
        ${'w3citylights-axe-v4.7.2.axe-cli-v4.8.4.json'}
        ${'basic-axe-v4.7.2.axe-cli-v4.8.5.json'}
        ${'w3citylights-axe-v4.7.2.axe-cli-v4.8.5.json'}
        ${'basic-axe-v4.8.4.axe-cli-v4.8.5.json'}
        ${'w3citylights-axe-v4.8.4.axe-cli-v4.8.5.json'}
        ${'basic-axe-v4.8.4.axe-cli-v4.9.0.json'}
        ${'w3citylights-axe-v4.8.4.axe-cli-v4.9.0.json'}
        ${'basic-axe-v4.8.4.axe-cli-v4.9.1.json'}
        ${'w3citylights-axe-v4.8.4.axe-cli-v4.9.1.json'}
    `(
        'supports conversion from axe-cli output $inputFile',
        async ({ inputFile }) => {
            const inputFilePath = path.join(
                testResourcesDir,
                inputFile as string,
            );
            const outputFile = path.join(testResultsDir, `${inputFile}.sarif`);
            await deleteIfExists(outputFile);

            const output = await invokeCliWith(
                `-i ${inputFilePath} -o ${outputFile}`,
            );

            expect(output.stderr).toBe('');
            expect(output.stdout).toBe('');

            const outputJson = JSON.parse(
                (await readFile(outputFile)).toString(),
            );
            expect(outputJson.runs.length).toBe(1);
        },
    );

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
            `--input-files ${basicAxeV2File} --output-file ${outputFile}`,
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
        } catch (e: any) {
            expect(e.code).toBeGreaterThan(0);
            expect(e.stderr).toMatch('Did you mean to use --force?');
        }

        const outputFileContent = (await readFile(outputFile)).toString();
        expect(outputFileContent).toBe('preexisting content');
    });

    it.each(['-f', '--force'])('overwrites files with %s', async (arg) => {
        const outputFile = path.join(testResultsDir, `overwrite_${arg}.sarif`);
        await writeFile(outputFile, 'preexisting content');

        await invokeCliWith(`-i ${basicAxeV2File} -o ${outputFile} ${arg}`);

        expectSameJSONContent(outputFile, basicSarifFile);
    });

    it.each(['-v', '--verbose'])('emits verbose output', async (verboseArg) => {
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

    it.each(['-p', '--pretty'])('pretty-prints', async (prettyArg) => {
        const outputFile = path.join(testResultsDir, 'pretty-prints.sarif');
        await deleteIfExists(outputFile);

        await invokeCliWith(
            `-i ${basicAxeV2File} -o ${outputFile} ${prettyArg}`,
        );

        const outputContents = (await readFile(outputFile)).toString();

        const lines = outputContents.split('\n');
        expect(lines.length).toBeGreaterThan(100);
        expect(lines.every((line) => line.length < 200)).toBe(true);
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
        'basic-axe-v4.8.4.reporter-v2.json',
    );
    const basicSarifFile = path.join(
        testResourcesDir,
        'basic-axe-v4.8.4.sarif',
    );

    const mkdir = promisify(fs.mkdir);
    const writeFile = promisify(fs.writeFile);
    const readFile = promisify(fs.readFile);
    const unlink = promisify(fs.unlink);
    const exec = promisify(child_process.exec);

    async function deleteIfExists(path: string): Promise<void> {
        try {
            await unlink(path);
        } catch (e: any) {
            if (e.code != 'ENOENT') {
                throw e;
            }
        }
    }

    async function ensureDirectoryExists(path: string): Promise<void> {
        try {
            await mkdir(path);
        } catch (e: any) {
            if (e.code !== 'EEXIST') {
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
