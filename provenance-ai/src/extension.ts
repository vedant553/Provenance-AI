import * as vscode from 'vscode';
import { sendAnalyzeRequest } from './backendClient';
import { SidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Provenance AI extension is now active!');

    // Initialize sidebar provider
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SidebarProvider.viewType,
            sidebarProvider
        )
    );

    // Register the command
    let disposable = vscode.commands.registerCommand('provenance-ai.helloWorld', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        
        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);

        if (!selectedText) {
            vscode.window.showWarningMessage('No text selected!');
            return;
        }

        try {
            // Show loading state
            sidebarProvider.setSummary('Analyzing code...');
            
            // Show the sidebar if it's not already visible
            await vscode.commands.executeCommand('workbench.view.extension.provenanceai');

            const result = await sendAnalyzeRequest({
                code: selectedText,
                filePath: document.fileName,
                startLine: selection.start.line + 1,
                endLine: selection.end.line + 1
            });

            // Update the sidebar with the analysis result
            sidebarProvider.setSummary(result);
            vscode.window.showInformationMessage('Analysis completed! Check the Provenance AI sidebar for results.');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            vscode.window.showErrorMessage(`Analysis failed: ${errorMessage}`);
            console.error('Analysis error:', error);
            sidebarProvider.setSummary(`Error: ${errorMessage}`);
        }
    });

    context.subscriptions.push(disposable);
}
