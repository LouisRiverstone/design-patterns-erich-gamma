import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	TextEditor,
	EditorInvoker,
	AddTextCommand,
	DeleteTextCommand,
	InsertAtCommand,
	MacroCommand,
} from "./after";

describe("Command Pattern", () => {
	describe("Before: Without Command Pattern", () => {
		it("should demonstrate problems with direct operations", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Command Pattern", () => {
		let editor: TextEditor;
		let invoker: EditorInvoker;

		beforeEach(() => {
			editor = new TextEditor();
			invoker = new EditorInvoker();
		});

		describe("Basic Commands", () => {
			it("should execute AddTextCommand correctly", () => {
				const command = new AddTextCommand(editor, "Hello");

				command.execute();

				expect(editor.getContent()).toBe("Hello");
				expect(command.getDescription()).toBe('Add "Hello"');
			});

			it("should undo AddTextCommand correctly", () => {
				const command = new AddTextCommand(editor, "Hello");

				command.execute();
				expect(editor.getContent()).toBe("Hello");

				command.undo();
				expect(editor.getContent()).toBe("");
			});

			it("should execute DeleteTextCommand correctly", () => {
				editor.setContent("Hello World");
				const command = new DeleteTextCommand(editor, 5);

				command.execute();

				expect(editor.getContent()).toBe("Hello ");
			});

			it("should undo DeleteTextCommand correctly", () => {
				editor.setContent("Hello World");
				const command = new DeleteTextCommand(editor, 5);

				command.execute();
				expect(editor.getContent()).toBe("Hello ");

				command.undo();
				expect(editor.getContent()).toBe("Hello World");
			});

			it("should execute InsertAtCommand correctly", () => {
				editor.setContent("Hello World");
				const command = new InsertAtCommand(editor, 6, "Beautiful ");

				command.execute();

				expect(editor.getContent()).toBe("Hello Beautiful World");
			});

			it("should undo InsertAtCommand correctly", () => {
				editor.setContent("Hello World");
				const command = new InsertAtCommand(editor, 6, "Beautiful ");

				command.execute();
				expect(editor.getContent()).toBe("Hello Beautiful World");

				command.undo();
				expect(editor.getContent()).toBe("Hello World");
			});
		});

		describe("EditorInvoker", () => {
			it("should execute commands and maintain history", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				invoker.executeCommand(new AddTextCommand(editor, "Hello"));
				invoker.executeCommand(new AddTextCommand(editor, " World"));

				expect(editor.getContent()).toBe("Hello World");
				expect(spy).toHaveBeenCalledWith('✓ Executado: Add "Hello"');
				expect(spy).toHaveBeenCalledWith('✓ Executado: Add " World"');

				spy.mockRestore();
			});

			it("should undo commands correctly", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				invoker.executeCommand(new AddTextCommand(editor, "Hello"));
				invoker.executeCommand(new AddTextCommand(editor, " World"));

				expect(invoker.canUndo()).toBe(true);

				const undoResult = invoker.undo();
				expect(undoResult).toBe(true);
				expect(editor.getContent()).toBe("Hello");
				expect(spy).toHaveBeenCalledWith(' Desfez: Add " World"');

				spy.mockRestore();
			});

			it("should redo commands correctly", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				invoker.executeCommand(new AddTextCommand(editor, "Hello"));
				invoker.undo();

				expect(invoker.canRedo()).toBe(true);

				const redoResult = invoker.redo();
				expect(redoResult).toBe(true);
				expect(editor.getContent()).toBe("Hello");
				expect(spy).toHaveBeenCalledWith(' Refez: Add "Hello"');

				spy.mockRestore();
			});

			it("should handle undo when no commands to undo", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				expect(invoker.canUndo()).toBe(false);

				const undoResult = invoker.undo();
				expect(undoResult).toBe(false);
				expect(spy).toHaveBeenCalledWith("Nada para desfazer");

				spy.mockRestore();
			});

			it("should handle redo when no commands to redo", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				invoker.executeCommand(new AddTextCommand(editor, "Hello"));

				expect(invoker.canRedo()).toBe(false);

				const redoResult = invoker.redo();
				expect(redoResult).toBe(false);
				expect(spy).toHaveBeenCalledWith("Nada para refazer");

				spy.mockRestore();
			});

			it("should clear redo history when new command is executed after undo", () => {
				invoker.executeCommand(new AddTextCommand(editor, "Hello"));
				invoker.executeCommand(new AddTextCommand(editor, " World"));
				invoker.undo(); // Agora pode refazer

				expect(invoker.canRedo()).toBe(true);

				// Novo comando deve limpar histórico de redo
				invoker.executeCommand(new AddTextCommand(editor, " New"));

				expect(invoker.canRedo()).toBe(false);
				expect(editor.getContent()).toBe("Hello New");
			});

			it("should provide correct history", () => {
				invoker.executeCommand(new AddTextCommand(editor, "Hello"));
				invoker.executeCommand(new AddTextCommand(editor, " World"));
				invoker.undo();

				const history = invoker.getHistory();

				expect(history).toEqual(['✓ Add "Hello"', '○ Add " World"']);
			});
		});

		describe("MacroCommand", () => {
			it("should execute multiple commands", () => {
				const commands = [
					new AddTextCommand(editor, "Line 1"),
					new AddTextCommand(editor, "\n"),
					new AddTextCommand(editor, "Line 2"),
				];

				const macro = new MacroCommand(commands, "Add two lines");
				macro.execute();

				expect(editor.getContent()).toBe("Line 1\nLine 2");
				expect(macro.getDescription()).toBe("Add two lines");
			});

			it("should undo multiple commands in reverse order", () => {
				editor.setContent("Start ");

				const commands = [
					new AddTextCommand(editor, "Middle "),
					new AddTextCommand(editor, "End"),
				];

				const macro = new MacroCommand(commands, "Add middle and end");
				macro.execute();
				expect(editor.getContent()).toBe("Start Middle End");

				macro.undo();
				expect(editor.getContent()).toBe("Start ");
			});

			it("should work with invoker", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const commands = [
					new AddTextCommand(editor, "A"),
					new AddTextCommand(editor, "B"),
					new AddTextCommand(editor, "C"),
				];

				const macro = new MacroCommand(commands, "Add ABC");
				invoker.executeCommand(macro);

				expect(editor.getContent()).toBe("ABC");
				expect(spy).toHaveBeenCalledWith("✓ Executado: Add ABC");

				invoker.undo();
				expect(editor.getContent()).toBe("");

				spy.mockRestore();
			});
		});

		describe("Complex Scenarios", () => {
			it("should handle mixed operations with undo/redo", () => {
				// Sequência complexa de operações
				invoker.executeCommand(new AddTextCommand(editor, "Hello"));
				invoker.executeCommand(new AddTextCommand(editor, " World"));
				invoker.executeCommand(new DeleteTextCommand(editor, 5)); // Remove "World"
				invoker.executeCommand(new InsertAtCommand(editor, 6, "TypeScript"));

				expect(editor.getContent()).toBe("Hello TypeScript");

				// Desfaz inserção
				invoker.undo();
				expect(editor.getContent()).toBe("Hello ");

				// Desfaz deleção (restaura "World")
				invoker.undo();
				expect(editor.getContent()).toBe("Hello World");

				// Refaz deleção
				invoker.redo();
				expect(editor.getContent()).toBe("Hello ");

				// Nova operação deve limpar redo
				invoker.executeCommand(new AddTextCommand(editor, "Bun"));
				expect(editor.getContent()).toBe("Hello Bun");
				expect(invoker.canRedo()).toBe(false);
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Command)"),
			);

			spy.mockRestore();
		});
	});
});
