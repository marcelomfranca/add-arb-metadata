import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('add-arb-metadata.addMetadata', async () => {
        const l10nFile = path.join(vscode.workspace.rootPath || '', 'l10n.yaml');
        let arbDir = 'lib/l10n';  // Default directory

        // Read the l10n.yaml file
        try {
            const l10nContent = fs.readFileSync(l10nFile, 'utf8');
            const l10nData = yaml.load(l10nContent) as { 'arb-dir'?: string };
            arbDir = l10nData['arb-dir'] || arbDir;  // Get the arbDir dynamically
        } catch (error) {
            vscode.window.showErrorMessage('Error reading l10n.yaml: ' + (error as Error).message);
        }

        const arbPath = path.join(vscode.workspace.rootPath || '', arbDir);
        const files = fs.readdirSync(arbPath).filter(file => file.endsWith('.arb') || file.endsWith('_pt.arb') || file.endsWith('_pt-BR.arb'));

        for (const file of files) {
            const filePath = path.join(arbPath, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            let modified = false;
            for (const key in data) {
                if (!key.startsWith('@') && !data[`@${key}`]) {
                    data[`@${key}`] = {};  // Add empty metadata
                    modified = true;
                }
            }

            if (modified) {
                // Write to the file with metadata on a new line
                const output = Object.entries(data).map(([key, value]) => {
                    const keyLine = `"${key}": ${JSON.stringify(value, null, 2)}`;
                    const metadataLine = key.startsWith('@') ? '' : `"@${key}": {}`;
                    return keyLine + (metadataLine ? '\n' + metadataLine : '');
                }).join('\n');

                fs.writeFileSync(filePath, output, 'utf8');
                vscode.window.showInformationMessage(`Metadata added to file ${file}`);
            } else {
                vscode.window.showInformationMessage(`No changes needed for file ${file}`);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
