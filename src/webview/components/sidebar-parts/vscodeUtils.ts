// vscodeUtils.ts
interface vscode {
    postMessage(message: any): void;
}

  declare const vscode: vscode;
export const postMessage = (message: any) => {
    vscode.postMessage(message);
}
export const viewFile = (file: any) => {
    if (file) {
         postMessage({
            type: 'onViewFile',
            value: file,
        });
    }
};

export const sendFilePath = (item: any) => {
     postMessage({
        type: 'onViewFileContent',
        value: item,
    });
};