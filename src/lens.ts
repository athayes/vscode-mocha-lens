import type { ParsedNode } from 'jest-editor-support';
import parse from 'jest-editor-support/build/parsers';
import { CodeLens, CodeLensProvider, Range, TextDocument, window, workspace } from 'vscode';
import { escapeRegExp, findFullTestName, normalizePath } from './util';
import { CodeLensOption } from './types';
import { homedir } from 'os';
import { findJestConfig, findJestInPackageJson } from './config/files';
import { sync } from 'fast-glob';

export class Lens implements CodeLensProvider {
  private lastSuccessfulCodeLens: CodeLens[] = [];

  constructor(private readonly codeLensOptions: CodeLensOption[]) {}

  public async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    try {
      const filePath = normalizePath(document.fileName);
      const root =  normalizePath(this.currentWorkspaceFolderPath || homedir());

      const config = workspace.getConfiguration('jestrunner');
      const exclude = config.get<string[]>('exclude', []);

      // If matches the exclude glob, return empty array
      if (exclude && exclude.length > 0 && sync(exclude, { cwd: root, absolute: true }).includes(filePath)) {
        return [];
      }

      // Check if there is an ancestor jest config
      const jestConfigPath = findJestConfig(filePath, root);
      if (!jestConfigPath) {
        const isJestInPackageJson = await findJestInPackageJson(filePath);
        if (!isJestInPackageJson) {
          return [];
        }
      }

      const parseResults = parse(document.fileName, document.getText(), { plugins: { decorators: 'legacy' } }).root
        .children;
      this.lastSuccessfulCodeLens = parseResults.flatMap((parseResult) =>
        getTestsBlocks(parseResult, parseResults, this.codeLensOptions),
      );
    } catch (e) {
      console.error('jest-editor-support parser returned error', e);
    }
    return this.lastSuccessfulCodeLens;
  }

  private get currentWorkspaceFolderPath(): string | undefined {
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
      const workspaceFolder = workspace.getWorkspaceFolder(activeEditor.document.uri);
      return workspaceFolder ? workspaceFolder.uri.fsPath : undefined;
    }
    return undefined;
  }
}

function getCodeLensForOption(range: Range, codeLensOption: CodeLensOption, fullTestName: string): CodeLens {
  const titleMap: Record<CodeLensOption, string> = {
    run: 'Run',
    debug: 'Debug',
  };
  const commandMap: Record<CodeLensOption, string> = {
    run: 'extension.runJest',
    debug: 'extension.debugJest',
  };

  return new CodeLens(range, {
    arguments: [fullTestName],
    title: titleMap[codeLensOption],
    command: commandMap[codeLensOption],
  });
}

function getTestsBlocks(
  parsedNode: ParsedNode,
  parseResults: ParsedNode[],
  codeLensOptions: CodeLensOption[],
): CodeLens[] {
  const codeLens: CodeLens[] = [];

  parsedNode.children?.forEach((subNode) => {
    codeLens.push(...getTestsBlocks(subNode, parseResults, codeLensOptions));
  });

  const range = new Range(
    parsedNode.start.line - 1,
    parsedNode.start.column,
    parsedNode.end.line - 1,
    parsedNode.end.column,
  );

  if (parsedNode.type === 'expect') {
    return [];
  }

  const fullTestName = escapeRegExp(findFullTestName(parsedNode.start.line, parseResults));
  codeLens.push(...codeLensOptions.map((option) => getCodeLensForOption(range, option, fullTestName)));
  return codeLens;
}
