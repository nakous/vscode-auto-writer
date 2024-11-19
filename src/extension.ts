import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.autoWrite', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const text = await vscode.env.clipboard.readText();
        if (!text) {
            vscode.window.showInformationMessage('No text in clipboard');
            return;
        }

        const config = vscode.workspace.getConfiguration('autoWriter');
        const speed = getWritingSpeed(config.get('writingSpeed', 'normal'));
        const waitingChars = config.get('waitingAfterCharList', []);
        const autoFormat = config.get('autoFormatBeforeWriting', false);

        if (autoFormat) {
            await vscode.commands.executeCommand('editor.action.formatDocument');
        }

        await writeTextCharByChar(editor, text, speed, waitingChars);
    });

    context.subscriptions.push(disposable);
}

async function writeTextCharByChar(editor: vscode.TextEditor, text: string, speed: number, waitingChars: [string, number][]) {
    const waitingCharMap = new Map(waitingChars);
    for (const char of text) {
        await editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, char);
        });
        const waitTime = waitingCharMap.get(char) || speed;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
}

function getWritingSpeed(speed: string): number {
    switch (speed) {
        case 'slow': return 100;
        case 'fast': return 20;
        default: return 50;
    }
}

export function deactivate() {}
