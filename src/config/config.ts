import * as vscode from 'vscode';
import { workspace } from 'vscode';

export function getRunOptions(): string[] | null {
  const runOptions = vscode.workspace.getConfiguration().get('jestrunner.runOptions');
  if (runOptions) {
    if (Array.isArray(runOptions)) {
      return runOptions;
    } else {
      vscode.window.showWarningMessage('Please check your vscode settings. "jestrunner.runOptions" must be an Array. ').then();
    }
  }
  return null;
}

export function getConfigJestCommand(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.jestCommand');
}

export function getJestPath(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.jestPath');
}

export function getDebugOptions(): Partial<vscode.DebugConfiguration> {
  return vscode.workspace.getConfiguration().get('jestrunner.debugOptions') || {};
}

// should add this to package.json...
export function getExclude() {
  const config = workspace.getConfiguration('jestrunner')
  return config.get<string[]>('exclude', []);
}

export function getBaseGlob(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.baseGlob');
}

