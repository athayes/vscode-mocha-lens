import { findUp } from 'find-up';
import vscode from 'vscode';
import * as path from 'path';
import { normalizePath } from '../util';

export async function findJsWorkspaceRoot(filePath: string) {
  // todo should stopAt the vscode workspace root
  const packageJson = await findUp('package.json', { cwd: path.dirname(normalizePath(filePath)) });

  if (packageJson) {
    return path.dirname(packageJson);
  }

  return vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri).uri.fsPath;
}
