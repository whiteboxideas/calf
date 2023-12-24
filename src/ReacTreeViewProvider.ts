import * as vscode from 'vscode';
import { getNonce } from './getNonce';
import { Parser } from './parser';

export class ReacTreeViewProvider implements vscode.WebviewViewProvider {
  public static currentPanel: ReacTreeViewProvider | undefined;
  
  public static readonly viewType = 'reacTree';

  private _panel?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private readonly _extContext: vscode.ExtensionContext;
  private parser: Parser | undefined;
  private _disposables: vscode.Disposable[] = [];

  constructor( 
    extContext: vscode.ExtensionContext,) {

    this._extContext = extContext;
    this._extensionUri = extContext.extensionUri;
 

  }
public static init (extContext: vscode.ExtensionContext){
  ReacTreeViewProvider.currentPanel = new ReacTreeViewProvider(extContext);
}

  public static createOrShow(extContext: vscode.ExtensionContext,fileName:any) {
    
    if (!ReacTreeViewProvider.currentPanel) {
      
      ReacTreeViewProvider.currentPanel = new ReacTreeViewProvider(extContext);
      
    }

    if (fileName && ReacTreeViewProvider.currentPanel) {
      ReacTreeViewProvider.currentPanel.parseAndShowFile(fileName);
    }
  }

  //gets called on its own

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._panel = webviewView;
    //log to console 
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'onFile':
          if (!data.value) break;
          this.parseAndShowFile(data.value);
          break;
        case 'onViewFile':
          if (!data.value) return;
          const doc = await vscode.workspace.openTextDocument(data.value);
          await vscode.window.showTextDocument(doc, { preview: false });
          break;
      }
    }, null, this._disposables);
  }

  public parseAndShowFile(fileName: string) {
    this.parser = new Parser(fileName);
    this.parser.parse();
    this.updateView();
  }

  private async updateView() {
    if (!this._panel) {
      return;
    }
    const tree = this.parser!.getTree();
    this._extContext.workspaceState.update('reacTree', tree);
    this._panel.webview.postMessage({
      type: 'parsed-data',
      value: tree,
      settings: await vscode.workspace.getConfiguration('reacTree'),
    });
  }

  public dispose() {
    ReacTreeViewProvider.currentPanel = undefined;
    // Clean up our resources
     
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
      </html>`;
  }
}
