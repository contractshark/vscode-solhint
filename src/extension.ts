// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { processStr, Reporter } from 'solhint/lib';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension activated');
  

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "solidity-solhint-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('solidity-solhint-extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from contractshark-solhint!');
	});

	context.subscriptions.push(disposable);
}

	let editor = vscode.window.activeTextEditor;
	let timeout: NodeJS.Timer;
  
	/* We load our settings */
	const delay: number = vscode.workspace
	  .getConfiguration()
	  .get('solver.delay') as number;
	const warningStyle: object = vscode.workspace
	  .getConfiguration()
	  .get('solver.warningStyle') as object;
	const errorStyle: object = vscode.workspace
	  .getConfiguration()
	  .get('solver.errorStyle') as object;
	let solhintConfig: object;
  
	const warningDecoration = vscode.window.createTextEditorDecorationType(
	  warningStyle,
	);
	const errorDecoration = vscode.window.createTextEditorDecorationType(
	  errorStyle,
	);

	if (vscode.workspace.name) {
		vscode.workspace
		  .findFiles('**/.solhint.json', '**/node_modules/**')
		  .then((files: string | any[]) => {
			if (files.length > 0) {
			  const fs = vscode.workspace.fs;
	
			  fs.readFile(files[0]).then((content: { toString: () => string; }) => {
				solhintConfig = JSON.parse(content.toString());
				vscode.window.showInformationMessage(
				  'Using solhint.json configuration file from current workspace.',
				);
			  });
			} else {
			  solhintConfig = vscode.workspace
				.getConfiguration()
				.get('solver.config') as object;
			  vscode.window.showErrorMessage(
				'No solhint.json configuration file has been found in the current workspace, the rules set in the settings will be used.',
			  );
			}
		  });
	  } else {
		vscode.window.showErrorMessage(
		  'The current file is not in a workspace, the rules set in the settings will be used.',
		);
		solhintConfig = vscode.workspace
		  .getConfiguration()
		  .get('solver.config') as object;
	  }
	
	  function updateDecorations() {
		if (!editor || editor.document.languageId !== 'solidity') {
		  return;
		}
	
		const warnings = [];
		const errors = [];
	
		const report: Reporter = processStr(
		  editor.document.getText(),
		  solhintConfig,
		);
	
		for (let i = 0; i < report.messages.length; i += 1) {
		  const msg = report.messages[i];
	
		  const line = editor.document.lineAt(msg.line - 1);
	
		  const range = new vscode.Range(
			new vscode.Position(msg.line - 1, msg.column - 1),
			line.range.end,
		  );
	
		  if (msg.severity === 3) {
			const hoverMessage = `🆘 Rule "${msg.ruleId}": ${msg.message}.`;
	
			warnings.push({
			  hoverMessage,
			  range,
			});
		  } else {
			const hoverMessage = `❌ Rule "${msg.ruleId}": ${msg.message}.`;
	
			errors.push({
			  hoverMessage,
			  range,
			});
		  }
		}
	
		editor.setDecorations(warningDecoration, warnings);
		editor.setDecorations(errorDecoration, errors);
	  }
	
	  function triggerUpdateDecorations() {
		if (timeout) {
		  clearTimeout(timeout);
		}
	
		timeout = setTimeout(updateDecorations, delay);
	  }
	
	  vscode.window.onDidChangeActiveTextEditor(
		() => {
		  editor = vscode.window.activeTextEditor;
		  triggerUpdateDecorations();
		},
		null,
		context.subscriptions,
	  );
	
	  vscode.window.onDidChangeTextEditorSelection(
		() => {
		  editor = vscode.window.activeTextEditor;
		  triggerUpdateDecorations();
		},
		null,
		context.subscriptions,
	  );
	}

	
	// this method is called when your extension is deactivated

	export function deactivate() {
	  console.log('Extension deactivated');
	}
