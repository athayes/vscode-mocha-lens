import * as vscode from 'vscode';

import { JestRunner } from './jestRunner';
import { JestCodeLensProvider } from './jestCodeLensProvider';
import { Config } from './config';

type Argument = Record<string, unknown> | string;

export function activate(context: vscode.ExtensionContext): void {
  const config = new Config();
  const jestRunner = new JestRunner(config);
  const codeLensProvider = new JestCodeLensProvider(config.codeLensOptions);

  const runJest = vscode.commands.registerCommand('extension.runJest', async (argument: Argument) => {
    return jestRunner.runCurrentTest(argument);
  });

  const debugJest = vscode.commands.registerCommand('extension.debugJest', async (argument: Argument) => {
    if (typeof argument === 'string') {
      return jestRunner.debugCurrentTest(argument);
    } else {
      return jestRunner.debugCurrentTest();
    }
  });

  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    [
      {
        pattern: vscode.workspace.getConfiguration().get('jestrunner.codeLensSelector'),
      },
    ],
    codeLensProvider,
  );

  context.subscriptions.push(codeLensProviderDisposable);
  context.subscriptions.push(runJest);
  context.subscriptions.push(debugJest);
}

export function deactivate(): void {
  // deactivate
}
