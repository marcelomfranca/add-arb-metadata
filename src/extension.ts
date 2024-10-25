import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Define o tipo para o conteúdo do arquivo YAML
interface L10nConfig {
    'arb-dir'?: string; // Usando a chave com hífen
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('add-arb-metadata.addMetadata', async () => {
        // Caminho para o arquivo l10n.yaml
        const yamlPath = path.join(vscode.workspace.rootPath || '', 'l10n.yaml');
        
        let arbDir: string | undefined;

        // Ler o arquivo l10n.yaml para obter arb-dir
        try {
            const fileContents = fs.readFileSync(yamlPath, 'utf8');
            const data = yaml.load(fileContents) as L10nConfig;
            arbDir = data['arb-dir'];
        } catch (error: unknown) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage('Error reading l10n.yaml: ' + error.message);
            } else {
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
                    data[`@${key}`] = {};  // Adiciona metadado vazio
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                vscode.window.showInformationMessage(`Metadata added to file ${file}`);
            } else {
                vscode.window.showInformationMessage(`No changes needed in file ${file}`);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
