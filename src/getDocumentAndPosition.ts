import * as vscode from 'vscode';

export function getDocumentAndPosition(root: any) {
  const document = vscode.window.activeTextEditor.document.uri;
  console.log('getDocumentAndPosition.ts-5: root.mainExports',root);
  const position = new vscode.Position(root.mainExports[0]?.loc?.start?.line - 1, root.mainExports[0]?.loc?.start?.column - 1); // replace with the actual position
  return { document, position };
}
