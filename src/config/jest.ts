import { detect } from 'detect-package-manager';
import { escapeRegExpForPath, escapeSingleQuotes, normalizePath, quote } from '../util';
import { findJestConfig } from './files';
import { Config } from './config';

export async function getJestCommand(config: Config, normalizedPath: string): Promise<string> {
  // custom
  const jestCommand: string = config.getJestCommand();
  if (jestCommand) {
    return jestCommand;
  }

  const packageManager = await detect({ cwd: normalizedPath });

  switch (packageManager) {
    case 'npm':
      return `npm exec jest`;
    case 'yarn':
      return `yarn jest`;
    case 'pnpm':
      return `pnpm jest`;
    case 'bun':
      return `bun run jest`;
    default:
      return `npm exec jest`;
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
