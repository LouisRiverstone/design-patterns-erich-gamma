import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	NumberNode,
	BinaryOpNode,
	VariableNode,
	FunctionNode,
	EvaluatorVisitor,
	PrinterVisitor,
	ValidatorVisitor,
	OptimizerVisitor,
	StatisticsVisitor,
	ASTBuilder,
} from "./after";

describe("Visitor Pattern", () => {
	describe("Before: Without Visitor Pattern", () => {
		it("should demonstrate problems with mixed concerns", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Visitor Pattern", () => {
		describe("AST Nodes", () => {
			it("should create different types of nodes", () => {
				const numberNode = new NumberNode(42);
				const variableNode = new VariableNode("x");
				const binaryOpNode = new BinaryOpNode(numberNode, "+", variableNode);
				const functionNode = new FunctionNode("sin", [variableNode]);

				expect(numberNode.getType()).toBe("Number");
				expect(variableNode.getType()).toBe("Variable");
				expect(binaryOpNode.getType()).toBe("BinaryOperation");
				expect(functionNode.getType()).toBe("Function");
			});

			it("should accept visitors", () => {
				const numberNode = new NumberNode(42);
				const mockVisitor = {
					visitNumber: vi.fn().mockReturnValue("visited"),
					visitBinaryOp: vi.fn(),
					visitVariable: vi.fn(),
					visitFunction: vi.fn(),
				};

				const result = numberNode.accept(mockVisitor);

				expect(mockVisitor.visitNumber).toHaveBeenCalledWith(numberNode);
				expect(result).toBe("visited");
			});
		});

		describe("EvaluatorVisitor", () => {
			let evaluator: EvaluatorVisitor;

			beforeEach(() => {
				evaluator = new EvaluatorVisitor();
			});

			it("should evaluate number nodes", () => {
				const node = new NumberNode(42);
				const result = node.accept(evaluator);
				expect(result).toBe(42);
			});

			it("should evaluate binary operations", () => {
				const addNode = new BinaryOpNode(
					new NumberNode(5),
					"+",
					new NumberNode(3),
				);

				const multiplyNode = new BinaryOpNode(
					new NumberNode(4),
					"*",
					new NumberNode(6),
				);

				expect(addNode.accept(evaluator)).toBe(8);
				expect(multiplyNode.accept(evaluator)).toBe(24);
			});

			it("should handle all binary operators", () => {
				const operators: Array<
					["+" | "-" | "*" | "/" | "**" | "%", number, number, number]
				> = [
					["+", 5, 3, 8],
					["-", 10, 4, 6],
					["*", 3, 7, 21],
					["/", 15, 3, 5],
					["**", 2, 3, 8],
					["%", 10, 3, 1],
				];

				operators.forEach(([op, left, right, expected]) => {
					const node = new BinaryOpNode(
						new NumberNode(left),
						op,
						new NumberNode(right),
					);
					expect(node.accept(evaluator)).toBe(expected);
				});
			});

			it("should handle division by zero", () => {
				const divByZero = new BinaryOpNode(
					new NumberNode(5),
					"/",
					new NumberNode(0),
				);

				expect(() => divByZero.accept(evaluator)).toThrow("Divisão por zero");
			});

			it("should evaluate variables", () => {
				evaluator.setVariable("x", 10);
				evaluator.setVariable("y", 5);

				const xNode = new VariableNode("x");
				const yNode = new VariableNode("y");

				expect(xNode.accept(evaluator)).toBe(10);
				expect(yNode.accept(evaluator)).toBe(5);
			});

			it("should throw error for undefined variables", () => {
				const undefinedVar = new VariableNode("undefined");

				expect(() => undefinedVar.accept(evaluator)).toThrow(
					"Variável 'undefined' não definida",
				);
			});

			it("should evaluate functions", () => {
				const sinNode = new FunctionNode("sin", [new NumberNode(0)]);
				const absNode = new FunctionNode("abs", [new NumberNode(-5)]);
				const maxNode = new FunctionNode("max", [
					new NumberNode(3),
					new NumberNode(7),
					new NumberNode(2),
				]);

				expect(sinNode.accept(evaluator)).toBe(0);
				expect(absNode.accept(evaluator)).toBe(5);
				expect(maxNode.accept(evaluator)).toBe(7);
			});

			it("should handle complex expressions", () => {
				evaluator.setVariable("x", 2);

				// (x + 3) * sin(0) + abs(-10)
				const complexExpr = new BinaryOpNode(
					new BinaryOpNode(
						new BinaryOpNode(new VariableNode("x"), "+", new NumberNode(3)),
						"*",
						new FunctionNode("sin", [new NumberNode(0)]),
					),
					"+",
					new FunctionNode("abs", [new NumberNode(-10)]),
				);

				expect(complexExpr.accept(evaluator)).toBe(10); // (2+3)*0 + 10 = 10
			});
		});

		describe("PrinterVisitor", () => {
			let printer: PrinterVisitor;

			beforeEach(() => {
				printer = new PrinterVisitor();
			});

			it("should print simple expressions", () => {
				const addExpr = new BinaryOpNode(
					new NumberNode(5),
					"+",
					new NumberNode(3),
				);

				expect(addExpr.accept(printer)).toBe("(5 + 3)");
			});

			it("should print complex expressions", () => {
				const complexExpr = new BinaryOpNode(
					new VariableNode("x"),
					"*",
					new FunctionNode("sin", [new VariableNode("y")]),
				);

				expect(complexExpr.accept(printer)).toBe("(x * sin(y))");
			});

			it("should print with indentation", () => {
				const expr = new BinaryOpNode(
					new NumberNode(1),
					"+",
					new NumberNode(2),
				);

				const indented = printer.printWithIndentation(expr);
				expect(indented).toContain("BinaryOperation: +");
				expect(indented).toContain("Number: 1");
				expect(indented).toContain("Number: 2");
			});
		});

		describe("ValidatorVisitor", () => {
			let validator: ValidatorVisitor;

			beforeEach(() => {
				validator = new ValidatorVisitor();
			});

			it("should validate correct expressions", () => {
				const validExpr = new BinaryOpNode(
					new NumberNode(5),
					"+",
					new VariableNode("valid_name"),
				);

				const result = validator.validate(validExpr);
				expect(result.isValid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});

			it("should detect invalid numbers", () => {
				const invalidNumber = new NumberNode(NaN);

				const result = invalidNumber.accept(validator);
				expect(result.isValid).toBe(false);
				expect(result.errors[0]).toContain("Valor numérico inválido");
			});

			it("should detect invalid variable names", () => {
				const invalidVar = new VariableNode("123invalid");

				const result = validator.validate(invalidVar);
				expect(result.isValid).toBe(false);
				expect(result.errors[0]).toContain("Nome de variável inválido");
			});

			it("should detect invalid functions", () => {
				const invalidFunc = new FunctionNode("unknown_function", [
					new NumberNode(1),
				]);

				const result = validator.validate(invalidFunc);
				expect(result.isValid).toBe(false);
				expect(result.errors[0]).toContain("Função não suportada");
			});
		});

		describe("OptimizerVisitor", () => {
			let optimizer: OptimizerVisitor;

			beforeEach(() => {
				optimizer = new OptimizerVisitor();
			});

			it("should perform constant folding", () => {
				const constantExpr = new BinaryOpNode(
					new NumberNode(2),
					"+",
					new NumberNode(3),
				);

				const optimized = constantExpr.accept(optimizer);
				expect(optimized).toBeInstanceOf(NumberNode);
				expect((optimized as NumberNode).value).toBe(5);
			});

			it("should optimize algebraic identities", () => {
				// x + 0 = x
				const addZero = new BinaryOpNode(
					new VariableNode("x"),
					"+",
					new NumberNode(0),
				);

				// x * 1 = x
				const multiplyOne = new BinaryOpNode(
					new VariableNode("x"),
					"*",
					new NumberNode(1),
				);

				// x * 0 = 0
				const multiplyZero = new BinaryOpNode(
					new VariableNode("x"),
					"*",
					new NumberNode(0),
				);

				const optimizedAdd = addZero.accept(optimizer);
				const optimizedMulOne = multiplyOne.accept(optimizer);
				const optimizedMulZero = multiplyZero.accept(optimizer);

				expect(optimizedAdd).toBeInstanceOf(VariableNode);
				expect((optimizedAdd as VariableNode).name).toBe("x");

				expect(optimizedMulOne).toBeInstanceOf(VariableNode);
				expect((optimizedMulOne as VariableNode).name).toBe("x");

				expect(optimizedMulZero).toBeInstanceOf(NumberNode);
				expect((optimizedMulZero as NumberNode).value).toBe(0);
			});

			it("should optimize constant functions", () => {
				const constantFunc = new FunctionNode("abs", [new NumberNode(-5)]);

				const optimized = constantFunc.accept(optimizer);
				expect(optimized).toBeInstanceOf(NumberNode);
				expect((optimized as NumberNode).value).toBe(5);
			});

			it("should handle optimization errors gracefully", () => {
				const divByZero = new BinaryOpNode(
					new NumberNode(1),
					"/",
					new NumberNode(0),
				);

				const optimized = divByZero.accept(optimizer);
				expect(optimized).toBeInstanceOf(BinaryOpNode);
			});
		});

		describe("StatisticsVisitor", () => {
			let statistics: StatisticsVisitor;

			beforeEach(() => {
				statistics = new StatisticsVisitor();
			});

			it("should count nodes correctly", () => {
				const expr = new BinaryOpNode(
					new NumberNode(1),
					"+",
					new FunctionNode("sin", [new VariableNode("x")]),
				);

				const stats = statistics.analyze(expr);

				expect(stats.nodeCount).toBe(4);
				expect(stats.numberNodes).toBe(1);
				expect(stats.binaryOpNodes).toBe(1);
				expect(stats.variableNodes).toBe(1);
				expect(stats.functionNodes).toBe(1);
			});

			it("should track variables and functions", () => {
				const expr = new BinaryOpNode(
					new VariableNode("x"),
					"+",
					new FunctionNode("sin", [new VariableNode("y")]),
				);

				const stats = statistics.analyze(expr);

				expect(Array.from(stats.variables)).toEqual(["x", "y"]);
				expect(Array.from(stats.functions)).toEqual(["sin"]);
			});

			it("should calculate depth correctly", () => {
				const deepExpr = new BinaryOpNode(
					new BinaryOpNode(new NumberNode(1), "+", new NumberNode(2)),
					"*",
					new NumberNode(3),
				);

				const stats = statistics.analyze(deepExpr);
				expect(stats.depth).toBe(3);
			});
		});

		describe("ASTBuilder", () => {
			it("should build AST nodes with convenience methods", () => {
				const expr = ASTBuilder.add(
					ASTBuilder.number(5),
					ASTBuilder.multiply(ASTBuilder.variable("x"), ASTBuilder.number(2)),
				);

				expect(expr).toBeInstanceOf(BinaryOpNode);
				expect(expr.operator).toBe("+");
				expect(expr.left).toBeInstanceOf(NumberNode);
				expect(expr.right).toBeInstanceOf(BinaryOpNode);
			});

			it("should build function nodes", () => {
				const funcNode = ASTBuilder.func("sin", ASTBuilder.variable("x"));

				expect(funcNode).toBeInstanceOf(FunctionNode);
				expect(funcNode.name).toBe("sin");
				expect(funcNode.args).toHaveLength(1);
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Visitor)"),
			);

			spy.mockRestore();
		});
	});
});
