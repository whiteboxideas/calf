import * as vscode from 'vscode';
import ReacTreePanel from './panel';
import { ReacTreeViewProvider } from './ReacTreeViewProvider';
import { getNonce } from './getNonce';

export function activate(extContext: vscode.ExtensionContext) {
  

	const provider = new ReacTreeViewProvider(extContext);
	extContext.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ReacTreeViewProvider.viewType,  provider));

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
        // Get the filename of the focused file
        const fileName = editor.document.fileName;
        // Execute the 'reacTree.start' command with the fileName
        vscode.commands.executeCommand('reacTree.start', fileName);
    }
  });

  extContext.subscriptions.push(
    vscode.commands.registerCommand('reacTree.start', (fileName) => {
      // If fileName is not provided, get it from the active text editor
      if (!fileName) {
        const editor = vscode.window.activeTextEditor;
        fileName = editor ? editor.document.fileName : null;
      }

      if (fileName) {
        ReacTreePanel.createOrShow(extContext, fileName);
		      } else {
        vscode.window.showInformationMessage('No active editor or file selected');
      }
    })
  );
  
  // Create reacTree status bar button
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  item.command = 'reacTree.start';
  item.tooltip = 'Activate ReacTree';
  item.text = '$(type-hierarchy) Start Tree';
  item.show();
}

export function deactivate() {}
