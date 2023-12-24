import * as vscode from 'vscode';
import { getNonce } from './getNonce';
import { Parser } from './parser';




export class ReacTreeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'reacTree';

  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private parser: Parser | undefined;
  private _disposables: vscode.Disposable[] = [];

  constructor(private readonly _extContext: vscode.ExtensionContext) {
    this._extensionUri = _extContext.extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;
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
    if (!this._view) {
      return;
    }

    const tree = this.parser!.getTree();
    this._extContext.workspaceState.update('reacTree', tree);
    this._view.webview.postMessage({
      type: 'parsed-data',
      value: tree,
      settings: await vscode.workspace.getConfiguration('reacTree'),
    });
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
