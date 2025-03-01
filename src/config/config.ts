import * as vscode from 'vscode';

export function getRunOptions(): string[] | null {
  const runOptions = vscode.workspace.getConfiguration().get('jestrunner.runOptions');
  if (runOptions) {
    if (Array.isArray(runOptions)) {
      return runOptions;
    } else {
      vscode.window.showWarningMessage('Please check your vscode settings. "jestrunner.runOptions" must be an Array. ');
    }
  }
  return null;
}

export function getConfigJestCommand(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.jestCommand');
}

// do we need this?
export function getJestPath(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.jestPath');
}

export function getDebugOptions(): Partial<vscode.DebugConfiguration> {
  const debugOptions = vscode.workspace.getConfiguration().get('jestrunner.debugOptions');
  if (debugOptions) {
    return debugOptions;
  }

  // default
  return {};
}

export function getBaseGlob(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.codeLensSelector');
}

