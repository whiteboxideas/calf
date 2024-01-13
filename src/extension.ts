import * as vscode from 'vscode'; 
import { TreeViewProvider } from './TreeViewProvider';
import { getNonce } from './getNonce';

export function activate(extContext: vscode.ExtensionContext) {
  
if(TreeViewProvider.currentPanel === undefined){TreeViewProvider.init(extContext)}	 
	extContext.subscriptions.push(
		vscode.window.registerWebviewViewProvider(TreeViewProvider.viewType,  TreeViewProvider.currentPanel ));

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
        // Get the filename of the focused file
        const fileName = editor.document.fileName;
        // Execute the 'calf.start' command with the fileName
        vscode.commands.executeCommand('calf.start', fileName);
    }
  });

  extContext.subscriptions.push(
    vscode.commands.registerCommand('calf.start', (fileName) => {
      // If fileName is not provided, get it from the active text editor
      if (!fileName) {
        const editor = vscode.window.activeTextEditor;
        fileName = editor ? editor.document.fileName : null;
      }

      if (fileName) { 
		TreeViewProvider.createOrShow(extContext, fileName);
		      } else {
        vscode.window.showInformationMessage('No active editor or file selected');
      }
    })
  );
  //forcing a revert
  // Create calf status bar button
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  item.command = 'calf.start';
  item.tooltip = 'Activate Calf';
  item.text = '$(type-hierarchy) Start Tree';
  item.show();
}

export function deactivate() {}
