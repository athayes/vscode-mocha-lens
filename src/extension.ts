import * as vscode from 'vscode';

import { JestRunner } from './jestRunner';
import { JestCodeLensProvider } from './jestCodeLensProvider';
import { Config } from './config';

export function activate(context: vscode.ExtensionContext): void {
  const config = new Config();
  const jestRunner = new JestRunner(config);
  const codeLensProvider = new JestCodeLensProvider(config.codeLensOptions);

  const runJest = vscode.commands.registerCommand(
    'extension.runJest',
    async (argument: Record<string, unknown> | string) => {
      return jestRunner.runCurrentTest(argument);
    },
  );

  const debugJest = vscode.commands.registerCommand(
    'extension.debugJest',
    async (argument: Record<string, unknown> | string) => {
      if (typeof argument === 'string') {
        return jestRunner.debugCurrentTest(argument);
      } else {
        return jestRunner.debugCurrentTest();
      }
    },
  );

  const docSelectors: vscode.DocumentFilter[] = [
    {
      pattern: vscode.workspace.getConfiguration().get('jestrunner.codeLensSelector'),
    },
  ];
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(docSelectors, codeLensProvider);
  context.subscriptions.push(codeLensProviderDisposable);

  context.subscriptions.push(runJest);
  context.subscriptions.push(debugJest);
}

export function deactivate(): void {
  // deactivate
}
