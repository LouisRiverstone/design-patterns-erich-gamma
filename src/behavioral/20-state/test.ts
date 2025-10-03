import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	DocumentContext,
	ValidatedDocumentContext,
	EditingState,
	ReviewingState,
	PublishedState,
	ArchivedState,
	StateMachineValidator,
} from "./after";

describe("State Pattern", () => {
	describe("Before: Without State Pattern", () => {
		it("should demonstrate problems with complex conditional logic", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With State Pattern", () => {
		describe("DocumentContext", () => {
			let document: DocumentContext;

			beforeEach(() => {
				document = new DocumentContext();
			});

			it("should start in editing state", () => {
				expect(document.getCurrentStateName()).toBe("Editing");
				expect(document.getAllowedActions()).toContain("save");
				expect(document.getAllowedActions()).toContain("addContent");
			});

			it("should handle content management", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.addContent("Hello ");
				document.addContent("World!");

				expect(document.getContent()).toBe("Hello World!");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Adicionando conteúdo"),
				);

				spy.mockRestore();
			});

			it("should track version and history", () => {
				expect(document.getVersion()).toBe(1);
				expect(document.getHistory()).toHaveLength(0);

				document.save();

				expect(document.getHistory()).toHaveLength(1);
				expect(document.getHistory()[0].action).toBe("save");
			});

			it("should provide current state information", () => {
				expect(document.getCurrentStateName()).toBe("Editing");

				const allowedActions = document.getAllowedActions();
				expect(allowedActions).toContain("save");
				expect(allowedActions).toContain("submitReview");
				expect(allowedActions).toContain("addContent");
			});
		});

		describe("State Transitions", () => {
			let document: DocumentContext;

			beforeEach(() => {
				document = new DocumentContext();
			});

			it("should transition from Editing to Reviewing", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				expect(document.getCurrentStateName()).toBe("Editing");

				document.submitReview();

				expect(document.getCurrentStateName()).toBe("Reviewing");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Estado alterado para: Reviewing"),
				);

				spy.mockRestore();
			});

			it("should transition from Reviewing to Published on approval", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.submitReview();
				document.approve();

				expect(document.getCurrentStateName()).toBe("Published");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Documento aprovado!"),
				);

				spy.mockRestore();
			});

			it("should transition from Reviewing to Editing on rejection", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.submitReview();
				document.reject();

				expect(document.getCurrentStateName()).toBe("Editing");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Documento rejeitado"),
				);

				spy.mockRestore();
			});

			it("should transition from Published to Archived", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.submitReview();
				document.approve();
				document.archive();

				expect(document.getCurrentStateName()).toBe("Archived");

				spy.mockRestore();
			});

			it("should create new version from Published state", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.submitReview();
				document.approve();

				expect(document.getVersion()).toBe(1);

				document.createVersion();

				expect(document.getCurrentStateName()).toBe("Editing");
				expect(document.getVersion()).toBe(2);

				spy.mockRestore();
			});

			it("should create new version from Archived state", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.submitReview();
				document.approve();
				document.archive();

				document.createVersion();

				expect(document.getCurrentStateName()).toBe("Editing");
				expect(document.getVersion()).toBe(2);

				spy.mockRestore();
			});
		});

		describe("State-specific Actions", () => {
			let document: DocumentContext;

			beforeEach(() => {
				document = new DocumentContext();
			});

			it("should handle editing state actions", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.save();
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Salvando documento"),
				);

				document.addContent("Test content");
				expect(document.getContent()).toBe("Test content");

				spy.mockRestore();
			});

			it("should handle reviewing state actions", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				document.submitReview();

				document.addComment("This needs revision");
				expect(document.getComments()).toHaveLength(1);
				expect(document.getComments()[0]).toBe("This needs revision");

				spy.mockRestore();
			});

			it("should reject invalid actions in each state", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				// In editing state, archive should not be allowed
				document.archive();
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining(
						'Ação "archive" não permitida no estado Editing',
					),
				);

				// In reviewing state, addContent should not be allowed
				document.submitReview();
				document.addContent("Invalid content");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining(
						'Ação "addContent" não permitida no estado Reviewing',
					),
				);

				spy.mockRestore();
			});
		});

		describe("Concrete States", () => {
			it("should have correct state names and allowed actions", () => {
				const editingState = new EditingState();
				expect(editingState.getStateName()).toBe("Editing");
				expect(editingState.getAllowedActions()).toEqual([
					"save",
					"submitReview",
					"addContent",
				]);

				const reviewingState = new ReviewingState();
				expect(reviewingState.getStateName()).toBe("Reviewing");
				expect(reviewingState.getAllowedActions()).toEqual([
					"approve",
					"reject",
					"addComment",
				]);

				const publishedState = new PublishedState();
				expect(publishedState.getStateName()).toBe("Published");
				expect(publishedState.getAllowedActions()).toEqual([
					"archive",
					"createVersion",
				]);

				const archivedState = new ArchivedState();
				expect(archivedState.getStateName()).toBe("Archived");
				expect(archivedState.getAllowedActions()).toEqual(["createVersion"]);
			});
		});

		describe("StateMachineValidator", () => {
			it("should validate valid transitions", () => {
				expect(
					StateMachineValidator.isValidTransition("Editing", "Reviewing"),
				).toBe(true);
				expect(
					StateMachineValidator.isValidTransition("Reviewing", "Published"),
				).toBe(true);
				expect(
					StateMachineValidator.isValidTransition("Reviewing", "Editing"),
				).toBe(true);
				expect(
					StateMachineValidator.isValidTransition("Published", "Archived"),
				).toBe(true);
				expect(
					StateMachineValidator.isValidTransition("Published", "Editing"),
				).toBe(true);
				expect(
					StateMachineValidator.isValidTransition("Archived", "Editing"),
				).toBe(true);
			});

			it("should reject invalid transitions", () => {
				expect(
					StateMachineValidator.isValidTransition("Editing", "Published"),
				).toBe(false);
				expect(
					StateMachineValidator.isValidTransition("Editing", "Archived"),
				).toBe(false);
				expect(
					StateMachineValidator.isValidTransition("Reviewing", "Archived"),
				).toBe(false);
				expect(
					StateMachineValidator.isValidTransition("Archived", "Published"),
				).toBe(false);
			});

			it("should provide valid transitions list", () => {
				expect(StateMachineValidator.getValidTransitions("Editing")).toEqual([
					"Reviewing",
				]);
				expect(StateMachineValidator.getValidTransitions("Reviewing")).toEqual([
					"Published",
					"Editing",
				]);
				expect(StateMachineValidator.getValidTransitions("Published")).toEqual([
					"Archived",
					"Editing",
				]);
				expect(StateMachineValidator.getValidTransitions("Archived")).toEqual([
					"Editing",
				]);
			});

			it("should throw error for invalid transitions", () => {
				expect(() => {
					StateMachineValidator.validateTransition("Editing", "Published");
				}).toThrow("Transição inválida de Editing para Published");
			});
		});

		describe("ValidatedDocumentContext", () => {
			let validatedDocument: ValidatedDocumentContext;

			beforeEach(() => {
				validatedDocument = new ValidatedDocumentContext();
			});

			it("should allow valid transitions", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				expect(validatedDocument.getCurrentStateName()).toBe("Editing");

				validatedDocument.submitReview();
				expect(validatedDocument.getCurrentStateName()).toBe("Reviewing");

				spy.mockRestore();
			});

			it("should prevent invalid transitions", () => {
				const spy = vi.spyOn(console, "error").mockImplementation(() => {});

				expect(() => {
					validatedDocument.setState(new PublishedState());
				}).toThrow("Transição inválida de Editing para Published");

				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Erro de transição"),
				);

				spy.mockRestore();
			});

			it("should provide valid next states", () => {
				expect(validatedDocument.getValidNextStates()).toEqual(["Reviewing"]);

				validatedDocument.submitReview();
				expect(validatedDocument.getValidNextStates()).toEqual([
					"Published",
					"Editing",
				]);
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução State)"),
			);

			spy.mockRestore();
		});
	});
});
