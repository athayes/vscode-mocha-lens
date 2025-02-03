import { escapeRegExpForPath, escapeSingleQuotes, normalizePath, quote } from '../util';
import { Config } from './config';
import path from 'path';

export async function getJestCommand(config: Config, cwd: string): Promise<string> {
  const jestCommand: string = config.getJestCommand();
  if (jestCommand) {
    return jestCommand;
  }

  return normalizePath(path.join(cwd, 'node_modules/.bin/jest'));
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
