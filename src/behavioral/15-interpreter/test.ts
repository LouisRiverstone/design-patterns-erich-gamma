import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	Context,
	NumberExpression,
	VariableExpression,
	AddExpression,
	SubtractExpression,
	MultiplyExpression,
	DivideExpression,
	ExpressionParser,
	Calculator,
} from "./after";

describe("Interpreter Pattern", () => {
	describe("Before: Without Interpreter Pattern", () => {
		it("should demonstrate problems with manual parsing", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Interpreter Pattern", () => {
		let context: Context;

		beforeEach(() => {
			context = new Context();
		});

		describe("Context", () => {
			it("should store and retrieve variables", () => {
				context.setVariable("x", 10);
				context.setVariable("y", 5);

				expect(context.getVariable("x")).toBe(10);
				expect(context.getVariable("y")).toBe(5);
			});

			it("should throw error for undefined variables", () => {
				expect(() => context.getVariable("undefined")).toThrow(
					"Variable 'undefined' not found",
				);
			});

			it("should check if variable exists", () => {
				context.setVariable("test", 1);

				expect(context.hasVariable("test")).toBe(true);
				expect(context.hasVariable("nonexistent")).toBe(false);
			});

			it("should return all variables", () => {
				context.setVariable("a", 1);
				context.setVariable("b", 2);

				expect(context.getAllVariables()).toEqual({ a: 1, b: 2 });
			});
		});

		describe("Terminal Expressions", () => {
			it("should interpret number expressions", () => {
				const expr = new NumberExpression(42);

				expect(expr.interpret(context)).toBe(42);
				expect(expr.toString()).toBe("42");
			});

			it("should interpret variable expressions", () => {
				context.setVariable("test", 25);
				const expr = new VariableExpression("test");

				expect(expr.interpret(context)).toBe(25);
				expect(expr.toString()).toBe("test");
			});
		});

		describe("Non-terminal Expressions", () => {
			it("should interpret addition expressions", () => {
				const left = new NumberExpression(5);
				const right = new NumberExpression(3);
				const expr = new AddExpression(left, right);

				expect(expr.interpret(context)).toBe(8);
				expect(expr.toString()).toBe("(5 + 3)");
			});

			it("should interpret subtraction expressions", () => {
				const left = new NumberExpression(10);
				const right = new NumberExpression(4);
				const expr = new SubtractExpression(left, right);

				expect(expr.interpret(context)).toBe(6);
				expect(expr.toString()).toBe("(10 - 4)");
			});

			it("should interpret multiplication expressions", () => {
				const left = new NumberExpression(6);
				const right = new NumberExpression(7);
				const expr = new MultiplyExpression(left, right);

				expect(expr.interpret(context)).toBe(42);
				expect(expr.toString()).toBe("(6 * 7)");
			});

			it("should interpret division expressions", () => {
				const left = new NumberExpression(15);
				const right = new NumberExpression(3);
				const expr = new DivideExpression(left, right);

				expect(expr.interpret(context)).toBe(5);
				expect(expr.toString()).toBe("(15 / 3)");
			});

			it("should throw error on division by zero", () => {
				const left = new NumberExpression(10);
				const right = new NumberExpression(0);
				const expr = new DivideExpression(left, right);

				expect(() => expr.interpret(context)).toThrow("Division by zero");
			});

			it("should handle complex nested expressions", () => {
				context.setVariable("x", 2);
				context.setVariable("y", 3);

				// (x + 5) * (y - 1) = (2 + 5) * (3 - 1) = 7 * 2 = 14
				const left = new AddExpression(
					new VariableExpression("x"),
					new NumberExpression(5),
				);
				const right = new SubtractExpression(
					new VariableExpression("y"),
					new NumberExpression(1),
				);
				const expr = new MultiplyExpression(left, right);

				expect(expr.interpret(context)).toBe(14);
				expect(expr.toString()).toBe("((x + 5) * (y - 1))");
			});
		});

		describe("ExpressionParser", () => {
			let parser: ExpressionParser;

			beforeEach(() => {
				parser = new ExpressionParser();
				context.setVariable("x", 10);
				context.setVariable("y", 5);
			});

			it("should parse simple number expressions", () => {
				const expr = parser.parse("42");

				expect(expr.interpret(context)).toBe(42);
			});

			it("should parse simple addition", () => {
				const expr = parser.parse("5 + 3");

				expect(expr.interpret(context)).toBe(8);
			});

			it("should parse simple subtraction", () => {
				const expr = parser.parse("10 - 4");

				expect(expr.interpret(context)).toBe(6);
			});

			it("should parse multiplication and division", () => {
				const mult = parser.parse("6 * 7");
				const div = parser.parse("15 / 3");

				expect(mult.interpret(context)).toBe(42);
				expect(div.interpret(context)).toBe(5);
			});

			it("should handle operator precedence", () => {
				const expr1 = parser.parse("2 + 3 * 4"); // Should be 2 + (3 * 4) = 14
				const expr2 = parser.parse("10 - 6 / 2"); // Should be 10 - (6 / 2) = 7

				expect(expr1.interpret(context)).toBe(14);
				expect(expr2.interpret(context)).toBe(7);
			});

			it("should handle parentheses", () => {
				const expr1 = parser.parse("(2 + 3) * 4"); // Should be 5 * 4 = 20
				const expr2 = parser.parse("(10 - 6) / 2"); // Should be 4 / 2 = 2

				expect(expr1.interpret(context)).toBe(20);
				expect(expr2.interpret(context)).toBe(2);
			});

			it("should parse variable expressions", () => {
				const expr = parser.parse("x + y");

				expect(expr.interpret(context)).toBe(15);
			});

			it("should handle complex expressions with variables", () => {
				const expr = parser.parse("(x + y) * 2 - 5");
				// (10 + 5) * 2 - 5 = 15 * 2 - 5 = 30 - 5 = 25

				expect(expr.interpret(context)).toBe(25);
			});
		});

		describe("Calculator", () => {
			let calculator: Calculator;

			beforeEach(() => {
				calculator = new Calculator();
			});

			it("should evaluate simple expressions", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const result = calculator.evaluate("5 + 3");

				expect(result).toBe(8);
				expect(spy).toHaveBeenCalledWith(expect.stringContaining("= 8"));

				spy.mockRestore();
			});

			it("should handle variables", () => {
				calculator.setVariable("x", 10);
				calculator.setVariable("y", 5);

				const result = calculator.evaluate("x * y");

				expect(result).toBe(50);
				expect(calculator.getVariables()).toEqual({ x: 10, y: 5 });
			});

			it("should handle complex expressions", () => {
				calculator.setVariable("a", 2);
				calculator.setVariable("b", 3);

				const result = calculator.evaluate("(a + b) * (a + b)"); // (2 + 3)^2 = 25

				expect(result).toBe(25);
			});

			it("should handle errors gracefully", () => {
				const errorSpy = vi
					.spyOn(console, "error")
					.mockImplementation(() => {});

				expect(() => calculator.evaluate("x + 1")).toThrow(); // x não definido
				expect(errorSpy).toHaveBeenCalled();

				errorSpy.mockRestore();
			});

			it("should handle division by zero", () => {
				const errorSpy = vi
					.spyOn(console, "error")
					.mockImplementation(() => {});

				expect(() => calculator.evaluate("5 / 0")).toThrow("Division by zero");

				errorSpy.mockRestore();
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Interpreter)"),
			);

			spy.mockRestore();
		});
	});
});
