import { findUp } from 'find-up';
import vscode from 'vscode';
import * as path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

export async function findJsWorkspaceRoot(filePath: string) {
  const cwd = path.dirname(filePath);
  const packageJson = await findUp('package.json', { cwd });

  if (packageJson) {
    return path.dirname(packageJson);
  }

  return vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri).uri.fsPath;
}

const jestConfigPossibilities = [
  'jest.config.js',
  'jest.config.ts',
  'jest.config.cjs',
  'jest.config.mjs',
  'jest.config.json',
];

export async function findJestConfig(filePath: string, stopAt?: string): Promise<string | undefined> {
  const cwd = path.dirname(filePath);
  const jestConfigPath = await findUp(jestConfigPossibilities, { cwd, stopAt });

  if (jestConfigPath) {
    return jestConfigPath;
  }

  return undefined;
}

export async function findJestInPackageJson(filePath: string): Promise<string | undefined> {
  const cwd = path.dirname(filePath);
  const packageJsonPath = await findUp('package.json', { cwd });

  if (packageJsonPath) {
    const packageJson = JSON.parse(await readFileAsync(packageJsonPath, 'utf8'));

    if (packageJson.devDependencies?.jest || packageJson.dependencies?.jest) {
      return path.dirname(packageJsonPath);
    }
  }

  return undefined;
}
