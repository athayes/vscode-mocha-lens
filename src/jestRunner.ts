import * as vscode from 'vscode';
import { Config } from './config';
import { parse } from './parser';
import { escapeRegExp, findFullTestName, pushMany, unquote, updateTestNameIfUsingProperties } from './util';
import { findJsWorkspaceRoot } from './config/files';
import { buildJestArgs, getJestCommand } from './config/jest';

interface DebugCommand {
  documentUri: vscode.Uri;
  config: vscode.DebugConfiguration;
}

export class JestRunner {
  private terminal: vscode.Terminal;
  private commands: string[] = [];

  constructor(private readonly config: Config) {
    this.setup();
  }

  public async runCurrentTest(argument?: Record<string, unknown> | string, options?: string[]): Promise<void> {
    const currentTestName = typeof argument === 'string' ? argument : undefined;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();
    const testName = currentTestName || this.findCurrentTestName(editor);
    const resolvedTestName = updateTestNameIfUsingProperties(testName);

    const args = await buildJestArgs(editor.document.fileName, resolvedTestName, true, options);
    const jestCommand = await getJestCommand();
    const command = `${jestCommand} ${args.join(' ')}`;

    await this.runTerminalCommand(command);
  }

  public async debugCurrentTest(currentTestName?: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();
    const testName = currentTestName || this.findCurrentTestName(editor);
    const resolvedTestName = updateTestNameIfUsingProperties(testName);

    const cwd = await findJsWorkspaceRoot();
    const jestCommand = await getJestCommand();
    const debugConfig = await this.getDebugConfig(editor.document.fileName, jestCommand, cwd, resolvedTestName);

    await this.executeDebugCommand({
      config: debugConfig,
      documentUri: editor.document.uri,
    });
  }

  private async executeDebugCommand(debugCommand: DebugCommand) {
    for (const command of this.commands) {
      await this.runTerminalCommand(command);
    }
    this.commands = [];

    vscode.debug.startDebugging(undefined, debugCommand.config);
  }

  private async getDebugConfig(
    filePath: string,
    program: string,
    cwd: string,
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
      ...this.config.debugOptions,
    };

    config.args = config.args ? config.args.slice() : [];

    const standardArgs = await buildJestArgs(filePath, currentTestName, false);
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

  private async runTerminalCommand(command: string) {
    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal('jest');
    }
    this.terminal.show(this.config.preserveEditorFocus);
    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    this.terminal.sendText(command);
  }

  private setup() {
    vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
      if (this.terminal === closedTerminal) {
        this.terminal = null;
      }
    });
  }
}
