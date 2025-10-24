import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';

export function registerTestCommand(context: vscode.ExtensionContext, sidebarProvider: SidebarProvider) {
  return vscode.commands.registerCommand('provenance-ai.testView', async () => {
    try {
      console.log('[ProvenanceAI] Test command started');
      
      // 1. Show the view container
      console.log('[ProvenanceAI] Showing view container...');
      await vscode.commands.executeCommand('workbench.view.extension.provenanceai');
      
      // 2. Try to get the view
      const view = vscode.window.visibleTextEditors.find(
        editor => editor.document.uri.scheme === 'provenance-ai'
      );
      
      console.log('[ProvenanceAI] View state:', {
        visibleTextEditors: vscode.window.visibleTextEditors.length,
        foundView: !!view,
        sidebarProvider: {
          isReady: sidebarProvider.isReady(),
          hasView: !!(sidebarProvider as any)._view
        }
      });
      
      // 3. Try to set some test content
      sidebarProvider.setSummary('This is a test message from the test command.');
      
      vscode.window.showInformationMessage('Test command completed. Check the console for details.');
    } catch (error) {
      console.error('[ProvenanceAI] Test command failed:', error);
      vscode.window.showErrorMessage(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}
