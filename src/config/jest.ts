import vscode from 'vscode';
import { detect } from 'detect-package-manager';
import { escapeRegExpForPath, escapeSingleQuotes, normalizePath, quote } from '../util';
import { findJestConfig } from './files';

export async function getJestCommand() {
  // custom
  const jestCommand: string = vscode.workspace.getConfiguration().get('jestrunner.jestCommand');
  if (jestCommand) {
    return jestCommand;
  }

  const packageManager = await detect();

  switch (packageManager) {
    case 'npm':
      return `npx jest`;
    case 'yarn':
      return `yarn jest`;
    case 'pnpm':
      return `pnpm jest`;
    case 'bun':
      return `bun run jest`;
    default:
      return `npx jest`;
  }
}

export async function buildJestArgs(
  filePath: string,
  testName: string,
  withQuotes: boolean,
  options: string[] = [],
): Promise<string[]> {
  const args: string[] = [];
  const quoter = withQuotes ? quote : (str) => str;

  args.push(quoter(escapeRegExpForPath(normalizePath(filePath))));

  const jestConfigPath = await findJestConfig(filePath);
  if (jestConfigPath) {
    args.push('-c');
    args.push(quoter(normalizePath(jestConfigPath)));
  }

  if (testName) {
    args.push('-t');
    args.push(quoter(escapeSingleQuotes(testName)));
  }

  const setOptions = new Set(options);

  if (this.config.runOptions) {
    this.config.runOptions.forEach((option) => setOptions.add(option));
  }

  args.push(...setOptions);
  return args;
}
