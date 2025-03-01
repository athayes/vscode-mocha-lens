import { escapeRegExpForPath, escapeSingleQuotes, normalizePath, quote } from '../util';
import * as vscode from 'vscode';
import { Config } from './config';

export async function getJestCommand(): Promise<string> {
  const jestCommand: string = vscode.workspace.getConfiguration().get('jestrunner.jestCommand');
  if (jestCommand) {
    return jestCommand;
  }

  return getJestBinPath();
}

// todo there has to be a bettter way to do this...
function getJestBinPath(): string {
  // custom
  const jestPath: string = vscode.workspace.getConfiguration().get('jestrunner.jestPath');
  if (jestPath) {
    return jestPath;
  }

  // default
  // const fallbackRelativeJestBinPath = 'node_modules/jest/bin/jest.js';
  // const mayRelativeJestBin = ['node_modules/.bin/jest', 'node_modules/jest/bin/jest.js'];
  // const cwd = this.cwd;

  // jestPath = mayRelativeJestBin.find((relativeJestBin) => isNodeExecuteAbleFile(path.join(cwd, relativeJestBin)));
  // jestPath = jestPath || path.join(cwd, fallbackRelativeJestBinPath);

  return normalizePath('node_modules/jest/bin/jest.js');
}

export async function buildJestArgs(
  filePath: string,
  testName: string,
  withQuotes: boolean,
  config: Config,
  options: string[] = [],
): Promise<string[]> {
  const args: string[] = [];
  const quoter = withQuotes ? quote : (str) => str;

  const normalizedFilePath = normalizePath(filePath);
  args.push(quoter(escapeRegExpForPath(normalizedFilePath)));

  if (testName) {
    args.push('-t');
    args.push(quoter(escapeSingleQuotes(testName)));
  }

  const setOptions = new Set(options);
  if (config.runOptions) {
    config.runOptions.forEach((option) => setOptions.add(option));
  }

  args.push(...setOptions);
  return args;
}

