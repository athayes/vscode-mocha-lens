import { findUp } from 'find-up';
import vscode from 'vscode';
import path from 'node:path';

export async function findJsWorkspaceRoot() {
  const packageJson = await findUp('package.json', { stopAt: this.currentWorkspaceFolderPath });

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

export async function findJestConfig({ filePath }: { filePath: string }) {
  return findUp(jestConfigPossibilities, { cwd: path.dirname(filePath), stopAt: this.currentWorkspaceFolderPath });
}
