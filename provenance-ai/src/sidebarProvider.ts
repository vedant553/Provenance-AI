import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'provenanceSummary';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        this.updateView('');
    }

    public setSummary(summary: string) {
        if (this._view) {
            this.updateView(summary);
        }
    }

    private updateView(summary: string) {
        if (!this._view) {
            return;
        }

        const style = `
            body {
                font-family: var(--vscode-font-family);
                padding: 10px;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                margin: 0;
            }
            pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                line-height: 1.5;
                margin: 0;
            }
            .loading {
                color: var(--vscode-descriptionForeground);
                font-style: italic;
            }
        `;

        const content = summary 
            ? `<pre>${this.escapeHtml(summary)}</pre>`
            : '<div class="loading">Select some code and run the analysis to see results here.</div>';

        this._view.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${style}</style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
