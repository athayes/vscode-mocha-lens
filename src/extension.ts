import * as vscode from 'vscode';

import { Jest } from './jest';
import { Lens } from './lens';
import { getCodeLensSelector } from './config/config';

type Argument = Record<string, unknown> | string;

export function activate(context: vscode.ExtensionContext): void {
  const jest = new Jest();
  const codeLensProvider = new Lens();

  const runJest = vscode.commands.registerCommand('extension.runJest', async (argument: Argument) => {
    const currentTestName = typeof argument === 'string' ? argument : undefined;
    return jest.runTest(false, currentTestName);
  });

  const debugJest = vscode.commands.registerCommand('extension.debugJest', async (argument: Argument) => {
    const currentTestName = typeof argument === 'string' ? argument : undefined;
    return jest.runTest(true, currentTestName);
  });

  const pattern = getCodeLensSelector();
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider([{ pattern }], codeLensProvider);

  context.subscriptions.push(codeLensProviderDisposable);
  context.subscriptions.push(runJest);
  context.subscriptions.push(debugJest);
}

export function deactivate(): void {
  // deactivate
}
