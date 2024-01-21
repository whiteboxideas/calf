import * as vscode from 'vscode';
import { getNonce } from './getNonce';
import { Parser } from './parser';

export default class TreePanel {
  public static currentPanel: TreePanel | undefined;

  private static readonly viewType = 'calf';

  private   _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _extContext: vscode.ExtensionContext;
  private parser: Parser | undefined;
  private _disposables: vscode.Disposable[] = [];


  private constructor(
    extContext: vscode.ExtensionContext,
    column: vscode.ViewColumn
  ) {
    this._extContext = extContext;
    this._extensionUri = extContext.extensionUri;
    // Not added - state preserver**

    // Create and show a new webview panel
    this.resolveWebViewPanel(column)
    
    // Set webview favicon
    this._panel.iconPath = vscode.Uri.joinPath(this._extensionUri, "src/media", "favicon.ico");

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (msg: any) => {
        switch (msg.type) {
          case 'onFile':
            if (!msg.value) break; //if doesnt work change to return
            this.parseAndShowFile(msg.value); 
            break;
          case 'onViewFile':
            if (!msg.value) return;
            const doc = await vscode.workspace.openTextDocument(msg.value);
            const editor = await vscode.window.showTextDocument(doc, {
              preserveFocus: false,
              preview: false,
            });
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extContext: vscode.ExtensionContext,fileName:any) {
    const columnToShowIn = vscode.ViewColumn.Beside;

    if (!TreePanel.currentPanel) {
      
      TreePanel.currentPanel = new TreePanel(extContext, columnToShowIn);
    }

    if (fileName && TreePanel.currentPanel) {
      TreePanel.currentPanel.parseAndShowFile(fileName);
    }
  }
  private resolveWebViewPanel(column: vscode.ViewColumn){
    this._panel = vscode.window.createWebviewPanel(
      TreePanel.viewType,
      'Calf',
      column,
      {
        // Enable javascript in the webview
        enableScripts: true,
        retainContextWhenHidden: true,
        // And restric the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [this._extensionUri],
      }
    );
  }

  private parseAndShowFile(fileName: string) {
    this.parser = new Parser(fileName);
       this.parser.parse().then((res) => { console.log('panel.ts-90: parser parse result ',res); }); 
    this.updateView();
  }


  private async updateView() {
    // Save current state of tree to workspace state:
    const tree = this.parser!.getTree();
    this._extContext.workspaceState.update('calf', tree);
    // Send updated tree to webview
    this._panel.webview.postMessage({
      type: 'parsed-data',
      value: tree,
      settings: await vscode.workspace.getConfiguration('calf'),
    });
  }

  public dispose() {
    TreePanel.currentPanel = undefined;
    // Clean up our resources
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'main.wv.js')
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css')
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>reacttree</title>
        <link rel="stylesheet" href="${styleUri}">
      </head>
      <body>
        <div id="root"></div>
        <script>
          const vscode = acquireVsCodeApi();
          window.onload = function() {
            vscode.postMessage({ command: 'startup' });
          };
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
