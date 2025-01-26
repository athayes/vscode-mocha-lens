'use strict';
import * as vscode from 'vscode';

import { JestRunner } from './jestRunner';
import { JestRunnerCodeLensProvider } from './JestRunnerCodeLensProvider';
import { JestRunnerConfig } from './jestRunnerConfig';

export function activate(context: vscode.ExtensionContext): void {
  const config = new JestRunnerConfig();
  const jestRunner = new JestRunner(config);
  const codeLensProvider = new JestRunnerCodeLensProvider(config.codeLensOptions);

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

  if (!config.isCodeLensDisabled) {
    const docSelectors: vscode.DocumentFilter[] = [
      {
        pattern: vscode.workspace.getConfiguration().get('jestrunner.codeLensSelector'),
      },
    ];
    const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(docSelectors, codeLensProvider);
    context.subscriptions.push(codeLensProviderDisposable);
  }
  context.subscriptions.push(runJest);
  context.subscriptions.push(debugJest);
}

export function deactivate(): void {
  // deactivate
}
