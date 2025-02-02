import { escapeRegExpForPath, escapeSingleQuotes, normalizePath, quote } from '../util';
import { findJestConfig } from './files';
import { Config } from './config';
import path from 'path';
import { execSync } from 'child_process';

export async function getJestCommand(config: Config, cwd: string): Promise<string> {
  // custom jest command if you want
  const jestCommand: string = config.getJestCommand();
  if (jestCommand) {
    return jestCommand;
  }

  // I wonder if there's an npm module for this, but it's probably fine for now
  const fallbackRelativeJestBinPath = 'node_modules/jest/bin/jest.js';
  const mayRelativeJestBin = ['node_modules/.bin/jest', 'node_modules/jest/bin/jest.js'];

  let jestPath: string;
  jestPath = mayRelativeJestBin.find((relativeJestBin) => isNodeExecuteAbleFile(path.join(cwd, relativeJestBin)));
  jestPath = jestPath || path.join(cwd, fallbackRelativeJestBinPath);

  return normalizePath(jestPath);
}

export function isNodeExecuteAbleFile(filepath: string): boolean {
  try {
    execSync(`node ${filepath} --help`);
    return true;
  } catch (err) {
    return false;
  }
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

  const jestConfigPath = await findJestConfig(normalizedFilePath);
  if (jestConfigPath) {
    args.push('-c');
    args.push(quoter(normalizePath(jestConfigPath)));
  }

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
