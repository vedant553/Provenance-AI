import * as vscode from 'vscode';
import { sendAnalyzeRequest } from './backendClient';

export function activate(context: vscode.ExtensionContext) {
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

        const filePath = document.fileName;
        const startLine = selection.start.line + 1;
        const endLine = selection.end.line + 1;

        const result = await sendAnalyzeRequest({
            code: selectedText,
            filePath,
            startLine,
            endLine
        });

        vscode.window.showInformationMessage(`Analysis summary: ${result}`);
    });
    context.subscriptions.push(disposable);
}
