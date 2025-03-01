import * as vscode from 'vscode';
import { CodeLensOption } from '../types';

export function getRunOptions(): string[] | null {
  const runOptions = vscode.workspace.getConfiguration().get('jestrunner.runOptions');
  if (runOptions) {
    if (Array.isArray(runOptions)) {
      return runOptions;
    } else {
      vscode.window.showWarningMessage(
        'Please check your vscode settings. "jestrunner.runOptions" must be an Array. ',
      );
    }
  }
  return null;
}

export function getJestCommand(): string {
  return vscode.workspace.getConfiguration().get('jestrunner.jestCommand');
}

export function getDebugOptions(): Partial<vscode.DebugConfiguration> {
  const debugOptions = vscode.workspace.getConfiguration().get('jestrunner.debugOptions');
  if (debugOptions) {
    return debugOptions;
  }

  // default
  return {};
}

export function getCodeLensOptions(): CodeLensOption[] {
  const codeLensOptions = vscode.workspace.getConfiguration().get('jestrunner.codeLens');
  if (Array.isArray(codeLensOptions)) {
    return validateCodeLensOptions(codeLensOptions);
  }
  return [];
}

function isCodeLensOption(option: string): option is CodeLensOption {
  return ['run', 'debug'].includes(option);
}

export function validateCodeLensOptions(maybeCodeLensOptions: string[]): CodeLensOption[] {
  return [...new Set(maybeCodeLensOptions)].filter((value) => isCodeLensOption(value)) as CodeLensOption[];
}