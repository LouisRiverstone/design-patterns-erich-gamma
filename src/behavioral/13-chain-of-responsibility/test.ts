import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	createSupportChain,
	Level1Handler,
	Level2Handler,
	ManagerHandler,
	type Ticket,
} from "./after";

describe("Chain of Responsibility Pattern", () => {
	it("Before: demonstra problema sem padrão", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});

		demonstrateProblems();

		expect(spy).toHaveBeenCalledWith(
			expect.stringContaining("ANTES (Problemático)"),
		);

		spy.mockRestore();
	});

	describe("After: cadeia de handlers", () => {
		let chain = createSupportChain();

		beforeEach(() => {
			chain = createSupportChain();
		});

		it("deve permitir que L1 resolva tickets simples", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			const ticket: Ticket = {
				id: 10,
				complexity: 1,
				description: "Pequeno problema",
				priority: "low",
			};
			const handled = chain.handle(ticket);

			expect(handled).toBe(true);
			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("[L1] Resolvendo ticket #10"),
			);

			spy.mockRestore();
		});

		it("deve escalar para L2 quando necessário", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			const ticket: Ticket = {
				id: 11,
				complexity: 3,
				description: "Problema médio",
				priority: "medium",
			};
			const handled = chain.handle(ticket);

			expect(handled).toBe(true);
			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("[L2] Resolvendo ticket #11"),
			);

			spy.mockRestore();
		});

		it("deve escalar para manager para casos complexos", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			const ticket: Ticket = {
				id: 12,
				complexity: 8,
				description: "Problema grave",
				priority: "high",
			};
			const handled = chain.handle(ticket);

			expect(handled).toBe(true);
			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("[MANAGER] Resolvendo ticket #12"),
			);

			spy.mockRestore();
		});

		it("deve retornar false quando não houver handler capaz", () => {
			// Criamos uma cadeia limitada para testar não tratado
			const limitedChain = new Level1Handler(); // sem next

			const ticket: Ticket = {
				id: 13,
				complexity: 10,
				description: "Muito complexo",
				priority: "high",
			};

			const handled = limitedChain.handle(ticket);
			expect(handled).toBe(false);
		});

		it("deve parar na primeira resolução (não continuar após tratado)", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			// Handler customizado que sempre processa e registra
			class SpyHandler extends Level1Handler {
				protected process(ticket: Ticket): void {
					super.process(ticket);
					console.log("[SPY] Processo executado");
				}
			}

			const head = new SpyHandler();
			head.setNext(new ManagerHandler());

			const ticket: Ticket = {
				id: 14,
				complexity: 1,
				description: "Pequeno",
				priority: "low",
			};
			const handled = head.handle(ticket);

			expect(handled).toBe(true);
			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("[L1] Resolvendo ticket #14"),
			);
			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("[SPY] Processo executado"),
			);
			// Manager não deve ser chamado
			expect(spy).not.toHaveBeenCalledWith(
				expect.stringContaining("[MANAGER]"),
			);

			spy.mockRestore();
		});
	});
});
