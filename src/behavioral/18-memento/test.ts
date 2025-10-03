import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	Document,
	DocumentHistory,
	BranchingDocumentHistory,
} from "./after";

describe("Memento Pattern", () => {
	describe("Before: Without Memento Pattern", () => {
		it("should demonstrate problems with exposed state", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Memento Pattern", () => {
		describe("Document (Originator)", () => {
			let document: Document;

			beforeEach(() => {
				document = new Document();
			});

			it("should handle text operations", () => {
				document.write("Hello");
				expect(document.getContent()).toBe("Hello");

				document.write(" World");
				expect(document.getContent()).toBe("Hello World");

				document.setCursorPosition(5);
				document.write("!");
				expect(document.getContent()).toBe("Hello! World");
			});

			it("should handle deletion", () => {
				document.write("Hello World");
				document.delete(5); // Delete 'World'
				expect(document.getContent()).toBe("Hello ");
			});

			it("should manage cursor position", () => {
				document.write("Hello");
				expect(document.getCursorPosition()).toBe(5);

				document.setCursorPosition(2);
				expect(document.getCursorPosition()).toBe(2);

				document.setCursorPosition(-1); // Should clamp to 0
				expect(document.getCursorPosition()).toBe(0);

				document.setCursorPosition(100); // Should clamp to content length
				expect(document.getCursorPosition()).toBe(5);
			});

			it("should handle formatting", () => {
				document.write("Hello");
				document.setFontSize(16);
				document.setFontFamily("Times");

				expect(document.getFontSize()).toBe(16);
				expect(document.getFontFamily()).toBe("Times");
				expect(document.getFormattedText()).toBe("[Times, 16px] Hello");
			});

			it("should create and restore mementos", () => {
				document.write("Hello");
				document.setFontSize(16);
				document.setCursorPosition(2);

				const memento = document.createMemento("Test state");

				expect(memento.description).toBe("Test state");
				expect(memento.timestamp).toBeInstanceOf(Date);

				// Change state
				document.write(" World");
				document.setFontSize(12);

				expect(document.getContent()).toBe("He Worldllo");
				expect(document.getFontSize()).toBe(12);

				// Restore
				document.restoreFromMemento(memento);

				expect(document.getContent()).toBe("Hello");
				expect(document.getFontSize()).toBe(16);
				expect(document.getCursorPosition()).toBe(2);
			});

			it("should reject invalid memento", () => {
				const invalidMemento = {
					timestamp: new Date(),
					description: "Invalid",
				};

				expect(() =>
					document.restoreFromMemento(invalidMemento as any),
				).toThrow("Invalid memento type");
			});
		});

		describe("DocumentHistory (Caretaker)", () => {
			let document: Document;
			let history: DocumentHistory;

			beforeEach(() => {
				document = new Document();
				history = new DocumentHistory();
			});

			it("should save and restore states", () => {
				const initialMemento = document.createMemento("Initial");
				history.save(initialMemento);

				document.write("Hello");
				const helloMemento = document.createMemento("Hello");
				history.save(helloMemento);

				document.write(" World");
				const worldMemento = document.createMemento("Hello World");
				history.save(worldMemento);

				expect(document.getContent()).toBe("Hello World");
				expect(history.getHistory()).toHaveLength(3);
			});

			it("should handle undo operations", () => {
				// Save initial state
				history.save(document.createMemento("Initial"));

				document.write("Hello");
				history.save(document.createMemento("Hello"));

				document.write(" World");
				history.save(document.createMemento("Hello World"));

				expect(history.canUndo()).toBe(true);

				// Undo to previous state
				const memento = history.undo();
				expect(memento).not.toBeNull();
				if (memento) {
					document.restoreFromMemento(memento);
					expect(document.getContent()).toBe("Hello");
				}

				// Undo to initial state
				const memento2 = history.undo();
				expect(memento2).not.toBeNull();
				if (memento2) {
					document.restoreFromMemento(memento2);
					expect(document.getContent()).toBe("");
				}

				// Can't undo further
				expect(history.canUndo()).toBe(false);
				expect(history.undo()).toBeNull();
			});

			it("should handle redo operations", () => {
				history.save(document.createMemento("Initial"));

				document.write("Hello");
				history.save(document.createMemento("Hello"));

				// Undo
				const memento = history.undo();
				if (memento) {
					document.restoreFromMemento(memento);
				}

				expect(history.canRedo()).toBe(true);

				// Redo
				const redoMemento = history.redo();
				expect(redoMemento).not.toBeNull();
				if (redoMemento) {
					document.restoreFromMemento(redoMemento);
					expect(document.getContent()).toBe("Hello");
				}

				expect(history.canRedo()).toBe(false);
				expect(history.redo()).toBeNull();
			});

			it("should clear future history on new saves", () => {
				history.save(document.createMemento("State 1"));

				document.write("Hello");
				history.save(document.createMemento("State 2"));

				document.write(" World");
				history.save(document.createMemento("State 3"));

				// Undo to state 2
				const memento = history.undo();
				if (memento) {
					document.restoreFromMemento(memento);
				}

				// Make new change - should clear state 3
				document.write(" Universe");
				history.save(document.createMemento("State 4"));

				expect(history.canRedo()).toBe(false);
				expect(history.getHistory()).toHaveLength(3); // States 1, 2, 4
			});

			it("should limit history size", () => {
				const smallHistory = new DocumentHistory(3);

				for (let i = 0; i < 5; i++) {
					document.write(`${i}`);
					smallHistory.save(document.createMemento(`State ${i}`));
				}

				expect(smallHistory.getHistory()).toHaveLength(3);
			});

			it("should provide access to specific mementos", () => {
				history.save(document.createMemento("State 0"));
				history.save(document.createMemento("State 1"));
				history.save(document.createMemento("State 2"));

				const memento1 = history.getMemento(1);
				expect(memento1?.description).toBe("State 1");

				const invalidMemento = history.getMemento(10);
				expect(invalidMemento).toBeNull();
			});

			it("should clear history", () => {
				history.save(document.createMemento("State 1"));
				history.save(document.createMemento("State 2"));

				expect(history.getHistory()).toHaveLength(2);

				history.clear();

				expect(history.getHistory()).toHaveLength(0);
				expect(history.getCurrentIndex()).toBe(-1);
				expect(history.canUndo()).toBe(false);
				expect(history.canRedo()).toBe(false);
			});
		});

		describe("BranchingDocumentHistory (Advanced Caretaker)", () => {
			let document: Document;
			let branchHistory: BranchingDocumentHistory;

			beforeEach(() => {
				document = new Document();
				branchHistory = new BranchingDocumentHistory();
			});

			it("should manage multiple branches", () => {
				// Main branch
				document.write("Base text");
				branchHistory.save(document.createMemento("Base"));

				// Create feature branch
				branchHistory.createBranch("feature");
				expect(branchHistory.getBranches()).toContain("feature");

				// Switch to feature branch
				expect(branchHistory.switchBranch("feature")).toBe(true);
				expect(branchHistory.getCurrentBranch()).toBe("feature");

				// Add to feature branch
				document.write(" - Feature A");
				branchHistory.save(document.createMemento("Feature A"));

				// Switch back to main
				branchHistory.switchBranch("main");
				const mainMemento = branchHistory.getCurrentMemento();
				if (mainMemento) {
					document.restoreFromMemento(mainMemento);
				}

				expect(document.getContent()).toBe("Base text");

				// Add to main branch
				document.write(" - Main feature");
				branchHistory.save(document.createMemento("Main feature"));

				expect(branchHistory.getBranches()).toHaveLength(2);
			});

			it("should handle invalid branch operations", () => {
				expect(branchHistory.switchBranch("nonexistent")).toBe(false);
				expect(branchHistory.getCurrentBranch()).toBe("main");
			});

			it("should support undo/redo in branches", () => {
				document.write("Text 1");
				branchHistory.save(document.createMemento("Text 1"));

				document.write(" Text 2");
				branchHistory.save(document.createMemento("Text 2"));

				// Undo
				const memento = branchHistory.undo();
				expect(memento?.description).toBe("Text 1");

				// Redo
				const redoMemento = branchHistory.redo();
				expect(redoMemento?.description).toBe("Text 2");
			});

			it("should handle empty branch undo", () => {
				// No mementos saved yet
				expect(branchHistory.undo()).toBeNull();
				expect(branchHistory.redo()).toBeNull();
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Memento)"),
			);

			spy.mockRestore();
		});
	});
});
