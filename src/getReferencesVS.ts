import * as vscode from 'vscode';
import { filterReferencesUnique } from './filterReferencesUnique';

export const getReferencesVS = async (uri: vscode.Uri, position: vscode.Position): Promise<any> => {
  if (!position || !position.line || position.line === -1 || position.character === -1) {
    return;
  }

  const references = await vscode.commands.executeCommand(
    'vscode.executeReferenceProvider', uri, position);

  return filterReferencesUnique(references, uri.fsPath);
};
