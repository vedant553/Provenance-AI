import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';
import { sendAnalyzeRequest } from './backendClient';
import { registerTestCommand } from './testView';

// Debug state
const DEBUG = true;
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[ProvenanceAI]', ...args);
  }
}

let sidebarProvider: SidebarProvider; // singleton

export async function activate(context: vscode.ExtensionContext) {
  debugLog('Extension activating...');
  
  // Create and register the sidebar provider
  sidebarProvider = new SidebarProvider(context.extensionUri);
  const registration = vscode.window.registerWebviewViewProvider(
    SidebarProvider.viewType, // 'provenanceSummary'
    sidebarProvider,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  );
  
  context.subscriptions.push(registration);
  debugLog('Webview view provider registered with type:', SidebarProvider.viewType);
  
  // Try to ensure the view is created
  try {
    await vscode.commands.executeCommand('setContext', 'provenanceai.viewReady', true);
    debugLog('View context set');
  } catch (error) {
    debugLog('Error setting view context:', error instanceof Error ? error.message : String(error));
  }

  const disposable = vscode.commands.registerCommand('provenance-ai.helloWorld', async () => {
    debugLog('Analyze Code command triggered');
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const doc = editor.document;
    const sel = editor.selection;
    const selected = doc.getText(sel);
    if (!selected) {
      vscode.window.showWarningMessage('No text selected!');
      return;
    }

    try {
      debugLog('Starting analysis...');
      
      // 1. First, ensure the container is visible
      debugLog('Revealing container...');
      await vscode.commands.executeCommand('workbench.view.extension.provenanceai');
      debugLog('Container revealed');
      
      // 2. Set loading state
      debugLog('Setting loading state');
      sidebarProvider.setSummary('Analyzing code...');
      
      // 3. Get analysis result
      debugLog('Sending analysis request...');
      const result = await sendAnalyzeRequest({
        code: selected,
        filePath: doc.fileName,
        startLine: sel.start.line + 1,
        endLine: sel.end.line + 1
      });
      
      debugLog('Analysis complete, updating view');
      
      // 4. Update view with result
      sidebarProvider.setSummary(result);
      debugLog('View updated with results');
      
      vscode.window.showInformationMessage('Analysis completed!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      debugLog('Analysis error:', error);
      sidebarProvider.setSummary(`Error: ${errorMessage}`);
      vscode.window.showErrorMessage(`Analysis failed: ${errorMessage}`);
    }
  });

  context.subscriptions.push(disposable);
  
  // Register test command
  const testCommand = registerTestCommand(context, sidebarProvider);
  context.subscriptions.push(testCommand);
  
  debugLog('Extension activation complete');
}
