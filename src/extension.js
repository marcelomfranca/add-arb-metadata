"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
function activate(context) {
    const disposable = vscode.commands.registerCommand('add-arb-metadata.addMetadata', async () => {
        const yamlPath = path.join(vscode.workspace.rootPath || '', 'l10n.yaml');
        let arbDir;
        try {
            const fileContents = fs.readFileSync(yamlPath, 'utf8');
            const data = yaml.load(fileContents);
            arbDir = data['arb-dir'];
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage('Error reading l10n.yaml: ' + error.message);
            }
            else {
                vscode.window.showErrorMessage('Error reading l10n.yaml: Unknown error occurred.');
            }
            return;
        }
        if (!arbDir) {
            vscode.window.showErrorMessage('ARB directory not found in l10n.yaml.');
            return;
        }
        const arbPath = path.join(vscode.workspace.rootPath || '', arbDir);
        const files = fs.readdirSync(arbPath).filter(file => file.endsWith('.arb'));
        for (const file of files) {
            const filePath = path.join(arbPath, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let modified = false;
            for (const key in data) {
                if (!key.startsWith('@') && !data[`@${key}`]) {
                    data[`@${key}`] = {};
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                vscode.window.showInformationMessage(`Metadata added to file ${file}`);
            }
            else {
                vscode.window.showInformationMessage(`No changes needed in file ${file}`);
            }
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map