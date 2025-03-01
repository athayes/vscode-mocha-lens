import * as vscode from 'vscode';
import { Config } from './config/config';
import parse from 'jest-editor-support/build/parsers';
import {
  escapeRegExp,
  findFullTestName,
  pushMany,
  unquote,
} from './util';
import { findJsWorkspaceRoot } from './config/files';
import { buildJestArgs, getJestCommand } from './config/jest';

export class JestRunner {
  private terminal: vscode.Terminal;

  constructor(private readonly config: Config) {
    vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
      if (this.terminal === closedTerminal) {
        this.terminal = null;
      }
    });
  }

  public async runTest(debug: boolean, currentTestName?: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();
    const testName = currentTestName || this.findCurrentTestName(editor);
    const resolvedTestName = updateTestNameIfUsingProperties(testName);

    const filePath = editor.document.fileName;
    const cwd = await findJsWorkspaceRoot(filePath);
    const jestCommand = await getJestCommand();
    const debugConfig = await this.getDebugConfig(editor.document.fileName, jestCommand, cwd, debug, resolvedTestName);

    vscode.debug.startDebugging(undefined, debugConfig);
  }

  private async getDebugConfig(
    filePath: string,
    program: string,
    cwd: string,
    debug: boolean,
    currentTestName?: string,
  ): Promise<vscode.DebugConfiguration> {
    const config: vscode.DebugConfiguration = {
      console: 'integratedTerminal',
      internalConsoleOptions: 'neverOpen',
      name: 'Debug Jest Tests',
      program,
      request: 'launch',
      type: 'node',
      cwd,
      noDebug: !debug,
      ...this.config.debugOptions,
    }

    config.args = config.args ? config.args.slice() : [];
    const standardArgs = await buildJestArgs(filePath, currentTestName, false, this.config);
    pushMany(config.args, standardArgs);
    config.args.push('--runInBand');

    return config;
  }

  private findCurrentTestName(editor: vscode.TextEditor): string | undefined {
    // from selection
    const { selection, document } = editor;
    if (!selection.isEmpty) {
      return unquote(document.getText(selection));
    }

    const selectedLine = selection.active.line + 1;
    const filePath = editor.document.fileName;
    const testFile = parse(filePath);

    const fullTestName = findFullTestName(selectedLine, testFile.root.children);
    return fullTestName ? escapeRegExp(fullTestName) : undefined;
  }
}

export function updateTestNameIfUsingProperties(receivedTestName?: string) {
  if (receivedTestName === undefined) {
    return undefined;
  }

  const namePropertyRegex = /(?<=\S)\\.name/g;
  const testNameWithoutNameProperty = receivedTestName.replace(namePropertyRegex, '');

  const prototypePropertyRegex = /\w*\\.prototype\\./g;
  return testNameWithoutNameProperty.replace(prototypePropertyRegex, '');
}
