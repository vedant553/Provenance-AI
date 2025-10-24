import * as vscode from 'vscode';

const DEBUG = true;
const debugLog = (...args: any[]) => DEBUG && console.log('[ProvenanceAI]', new Date().toISOString(), ...args);

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'provenanceSummary';
  private _view: vscode.WebviewView | undefined;
  private _pendingContent: string | undefined;

  // Track initialization state
  private _isReady = false;
  private _resolveReady: (() => void) | undefined;
  private readonly _readyPromise = new Promise<void>((resolve) => {
    this._resolveReady = resolve;
  });

  // Public method to check if the view is ready
  public isReady(): boolean {
    return this._isReady;
  }

  // Wait for the view to be ready
  public async waitForReady(): Promise<void> {
    if (this._isReady) return;
    debugLog('Waiting for view to be ready...');
    return this._readyPromise;
  }

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    debugLog('resolveWebviewView called - View ID:', webviewView.viewType);
    this._view = webviewView;
    this._isReady = true;
    if (this._resolveReady) {
      this._resolveReady();
    }
    
    // Configure webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    // Log view state
    debugLog('WebviewView properties:', {
      visible: webviewView.visible,
      webview: {
        html: !!webviewView.webview.html,
        options: webviewView.webview.options
      }
    });
    
    // Handle view visibility changes
    webviewView.onDidChangeVisibility(() => {
      debugLog('View visibility changed:', webviewView.visible ? 'visible' : 'hidden');
    });
    
    // Handle view disposal
    webviewView.onDidDispose(() => {
      debugLog('View was disposed');
      this._isReady = false;
      this._view = undefined;
    });
    
    // Handle pending content
    if (this._pendingContent) {
      debugLog('Processing pending content');
      this._updateWebview(webviewView, this._pendingContent);
      this._pendingContent = undefined;
    } else {
      debugLog('No pending content, showing default view');
      this._updateWebview(webviewView, '');
    }
  }

  public setSummary(content: string) {
    debugLog('setSummary called', {
      hasView: !!this._view,
      isReady: this._isReady,
      hasPendingContent: !!this._pendingContent,
      contentLength: content?.length || 0
    });

    if (this._view) {
      try {
        this._updateWebview(this._view, content);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        debugLog('Error updating webview:', errorMessage);
        this._pendingContent = content; // Retry on next resolve
      }
    } else {
      debugLog('View not available, queuing content');
      this._pendingContent = content;
      
      // Try to force the view to be created
      vscode.commands.executeCommand('workbench.view.extension.provenanceai')
        .then(
          () => debugLog('Container reveal command executed'),
          (err: unknown) => debugLog('Error revealing container:', err instanceof Error ? err.message : String(err))
        );
    }
  }

  private _updateWebview(webviewView: vscode.WebviewView, content: string) {
    debugLog('_updateWebview called', {
      contentLength: content?.length || 0,
      viewVisible: webviewView.visible,
      hasWebview: !!webviewView.webview
    });

    if (!webviewView.webview) {
      debugLog('Webview not available in _updateWebview');
      return;
    }
    
    const style = `
      body { 
        font-family: var(--vscode-font-family); 
        padding: 10px; 
        color: var(--vscode-foreground); 
        background: var(--vscode-editor-background); 
        margin: 0; 
      }
      pre { 
        white-space: pre-wrap; 
        word-wrap: break-word; 
        font-family: var(--vscode-editor-font-family); 
        margin: 0; 
      }
      .loading { 
        color: var(--vscode-descriptionForeground); 
        font-style: italic; 
      }`;

    const htmlContent = content 
      ? `<pre>${this._escapeHtml(content)}</pre>`
      : '<div class="loading">Select some code and run the analysis to see results here.</div>';

    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>${style}</style>
        </head>
        <body>${htmlContent}</body>
        </html>`;
      
      debugLog('Setting webview HTML, length:', html.length);
      webviewView.webview.html = html;
      debugLog('Webview HTML updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLog('Error setting webview HTML:', errorMessage);
      
      // Fallback to simple error display
      webviewView.webview.html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h3>Error displaying content</h3>
          <pre>${this._escapeHtml(errorMessage)}</pre>
        </body>
        </html>`;
    }
  }

  private _escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
