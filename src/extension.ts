import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodeCat is now active!');
    

    // 현재 활성 편집기 가져오기
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        if (document.languageId === 'c') {
            analyzeCode(editor);
        }
    }

    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        if (document.languageId === 'c') {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                analyzeCode(editor);
            }
        }
    });
}

async function analyzeCode(editor: vscode.TextEditor) {
    const code = editor.document.getText();
    console.log("Sent Code:", code);

    try {
        const result = await axios.post('http://127.0.0.1:5000/analyze', { code });
        const analysisResult = result.data;
        

        if (analysisResult) {
            console.log("Received analysis result: ", analysisResult);
            if (analysisResult.vulnerable) {
                vscode.window.showWarningMessage('주의: 취약점이 발견되었습니다.');
            } else {
                vscode.window.showInformationMessage('취약점이 발견되지 않았습니다.');
            }
        }
    } catch (error) {
        console.error('Error analyzing code:', error);
        vscode.window.showErrorMessage('코드 분석 중 오류가 발생했습니다. 서버 상태를 확인해주세요.');
    }
}

export function deactivate() {}
