// Command interface
export interface Command {
	execute(): void;
	undo(): void;
	getDescription(): string;
}

// Receiver - quem sabe como fazer as operações
export class TextEditor {
	private content: string = "";

	addText(text: string): void {
		this.content += text;
	}

	deleteText(length: number): string {
		const deleted = this.content.substring(this.content.length - length);
		this.content = this.content.substring(0, this.content.length - length);
		return deleted;
	}

	insertAt(position: number, text: string): void {
		this.content =
			this.content.slice(0, position) + text + this.content.slice(position);
	}

	deleteAt(position: number, length: number): string {
		const deleted = this.content.substring(position, position + length);
		this.content =
			this.content.slice(0, position) + this.content.slice(position + length);
		return deleted;
	}

	getContent(): string {
		return this.content;
	}

	setContent(content: string): void {
		this.content = content;
	}
}

// Concrete Commands
export class AddTextCommand implements Command {
	constructor(
		private editor: TextEditor,
		private text: string,
	) {}

	execute(): void {
		this.editor.addText(this.text);
	}

	undo(): void {
		this.editor.deleteText(this.text.length);
	}

	getDescription(): string {
		return `Add "${this.text}"`;
	}
}

export class DeleteTextCommand implements Command {
	private deletedText: string = "";

	constructor(
		private editor: TextEditor,
		private length: number,
	) {}

	execute(): void {
		this.deletedText = this.editor.deleteText(this.length);
	}

	undo(): void {
		this.editor.addText(this.deletedText);
	}

	getDescription(): string {
		return `Delete ${this.length} chars`;
	}
}

export class InsertAtCommand implements Command {
	constructor(
		private editor: TextEditor,
		private position: number,
		private text: string,
	) {}

	execute(): void {
		this.editor.insertAt(this.position, this.text);
	}

	undo(): void {
		this.editor.deleteAt(this.position, this.text.length);
	}

	getDescription(): string {
		return `Insert "${this.text}" at ${this.position}`;
	}
}

// Invoker - controla execução e histórico
export class EditorInvoker {
	private history: Command[] = [];
	private currentPosition: number = -1;

	executeCommand(command: Command): void {
		// Remove comandos após a posição atual (se fez undo e depois novo comando)
		this.history = this.history.slice(0, this.currentPosition + 1);

		command.execute();
		this.history.push(command);
		this.currentPosition++;

		console.log(`✓ Executado: ${command.getDescription()}`);
	}

	undo(): boolean {
		if (this.currentPosition >= 0) {
			const command = this.history[this.currentPosition];
			command.undo();
			this.currentPosition--;
			console.log(` Desfez: ${command.getDescription()}`);
			return true;
		}
		console.log("Nada para desfazer");
		return false;
	}

	redo(): boolean {
		if (this.currentPosition < this.history.length - 1) {
			this.currentPosition++;
			const command = this.history[this.currentPosition];
			command.execute();
			console.log(` Refez: ${command.getDescription()}`);
			return true;
		}
		console.log("Nada para refazer");
		return false;
	}

	getHistory(): string[] {
		return this.history.map((cmd, index) => {
			const indicator = index <= this.currentPosition ? "✓" : "○";
			return `${indicator} ${cmd.getDescription()}`;
		});
	}

	canUndo(): boolean {
		return this.currentPosition >= 0;
	}

	canRedo(): boolean {
		return this.currentPosition < this.history.length - 1;
	}
}

// Macro Command - executa múltiplos comandos
export class MacroCommand implements Command {
	constructor(
		private commands: Command[],
		private description: string,
	) {}

	execute(): void {
		for (const command of this.commands) {
			command.execute();
		}
	}

	undo(): void {
		// Desfaz na ordem reversa
		for (let i = this.commands.length - 1; i >= 0; i--) {
			this.commands[i].undo();
		}
	}

	getDescription(): string {
		return this.description;
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução Command) - Comandos encapsulados com undo/redo");

	const editor = new TextEditor();
	const invoker = new EditorInvoker();

	// Sequência de operações
	invoker.executeCommand(new AddTextCommand(editor, "Hello "));
	invoker.executeCommand(new AddTextCommand(editor, "World!"));
	invoker.executeCommand(new DeleteTextCommand(editor, 1));
	invoker.executeCommand(new InsertAtCommand(editor, 5, " Beautiful"));

	console.log(`\nConteúdo: "${editor.getContent()}"`);

	// Testando undo/redo
	console.log("\n=== Testando Undo/Redo ===");
	invoker.undo();
	console.log(`Após undo: "${editor.getContent()}"`);

	invoker.undo();
	console.log(`Após segundo undo: "${editor.getContent()}"`);

	invoker.redo();
	console.log(`Após redo: "${editor.getContent()}"`);

	// Macro command
	console.log("\n=== Macro Command ===");
	const macroCommands = [
		new AddTextCommand(editor, "\n"),
		new AddTextCommand(editor, "Line 2"),
		new AddTextCommand(editor, "\n"),
		new AddTextCommand(editor, "Line 3"),
	];

	const macro = new MacroCommand(macroCommands, "Add multiple lines");
	invoker.executeCommand(macro);

	console.log(`\nApós macro: "${editor.getContent()}"`);

	console.log("\n=== Histórico ===");
	console.log(invoker.getHistory().join("\n"));
}
