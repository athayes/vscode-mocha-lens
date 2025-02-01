import { findUp } from 'find-up';
import vscode from 'vscode';
import path from 'node:path';

export async function findJsWorkspaceRoot(filePath: string) {
  // todo should stopAt the vscode workspace root
  const packageJson = await findUp('package.json', { cwd: path.dirname(filePath) });

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

export async function findJestConfig(filePath) {
  console.log('filePath', filePath);
  return findUp(jestConfigPossibilities, { cwd: path.dirname(filePath), stopAt: this.currentWorkspaceFolderPath });
}
