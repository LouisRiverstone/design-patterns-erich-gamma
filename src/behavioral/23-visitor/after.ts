// Visitor interface
export interface ASTVisitor<T> {
	visitNumber(node: NumberNode): T;
	visitBinaryOp(node: BinaryOpNode): T;
	visitVariable(node: VariableNode): T;
	visitFunction(node: FunctionNode): T;
}

// Element interface
export interface ASTNode {
	accept<T>(visitor: ASTVisitor<T>): T;
	getType(): string;
}

// Concrete Elements
export class NumberNode implements ASTNode {
	constructor(public readonly value: number) {}

	accept<T>(visitor: ASTVisitor<T>): T {
		return visitor.visitNumber(this);
	}

	getType(): string {
		return "Number";
	}
}

export class BinaryOpNode implements ASTNode {
	constructor(
		public readonly left: ASTNode,
		public readonly operator: "+" | "-" | "*" | "/" | "**" | "%",
		public readonly right: ASTNode,
	) {}

	accept<T>(visitor: ASTVisitor<T>): T {
		return visitor.visitBinaryOp(this);
	}

	getType(): string {
		return "BinaryOperation";
	}
}

export class VariableNode implements ASTNode {
	constructor(public readonly name: string) {}

	accept<T>(visitor: ASTVisitor<T>): T {
		return visitor.visitVariable(this);
	}

	getType(): string {
		return "Variable";
	}
}

export class FunctionNode implements ASTNode {
	constructor(
		public readonly name: string,
		public readonly args: ASTNode[],
	) {}

	accept<T>(visitor: ASTVisitor<T>): T {
		return visitor.visitFunction(this);
	}

	getType(): string {
		return "Function";
	}
}

// Concrete Visitors
export class EvaluatorVisitor implements ASTVisitor<number> {
	constructor(private variables: Map<string, number> = new Map()) {}

	visitNumber(node: NumberNode): number {
		return node.value;
	}

	visitBinaryOp(node: BinaryOpNode): number {
		const left = node.left.accept(this);
		const right = node.right.accept(this);

		switch (node.operator) {
			case "+":
				return left + right;
			case "-":
				return left - right;
			case "*":
				return left * right;
			case "/":
				if (right === 0) {
					throw new Error("Divisão por zero");
				}
				return left / right;
			case "**":
				return Math.pow(left, right);
			case "%":
				return left % right;
			default:
				throw new Error(`Operador ${node.operator} não implementado`);
		}
	}

	visitVariable(node: VariableNode): number {
		const value = this.variables.get(node.name);
		if (value === undefined) {
			throw new Error(`Variável '${node.name}' não definida`);
		}
		return value;
	}

	visitFunction(node: FunctionNode): number {
		const args = node.args.map((arg) => arg.accept(this));

		switch (node.name) {
			case "sin":
				return Math.sin(args[0]);
			case "cos":
				return Math.cos(args[0]);
			case "sqrt":
				return Math.sqrt(args[0]);
			case "abs":
				return Math.abs(args[0]);
			case "min":
				return Math.min(...args);
			case "max":
				return Math.max(...args);
			case "sum":
				return args.reduce((a, b) => a + b, 0);
			default:
				throw new Error(`Função '${node.name}' não implementada`);
		}
	}

	setVariable(name: string, value: number): void {
		this.variables.set(name, value);
	}

	getVariables(): Map<string, number> {
		return new Map(this.variables);
	}
}

export class PrinterVisitor implements ASTVisitor<string> {
	private indentLevel: number = 0;

	visitNumber(node: NumberNode): string {
		return node.value.toString();
	}

	visitBinaryOp(node: BinaryOpNode): string {
		const left = node.left.accept(this);
		const right = node.right.accept(this);
		return `(${left} ${node.operator} ${right})`;
	}

	visitVariable(node: VariableNode): string {
		return node.name;
	}

	visitFunction(node: FunctionNode): string {
		const args = node.args.map((arg) => arg.accept(this)).join(", ");
		return `${node.name}(${args})`;
	}

	printWithIndentation(node: ASTNode): string {
		this.indentLevel = 0;
		return this.printIndented(node);
	}

	private printIndented(node: ASTNode): string {
		const indent = "  ".repeat(this.indentLevel);
		const nodeType = node.getType();

		if (node instanceof NumberNode) {
			return `${indent}${nodeType}: ${node.value}`;
		} else if (node instanceof VariableNode) {
			return `${indent}${nodeType}: ${node.name}`;
		} else if (node instanceof BinaryOpNode) {
			this.indentLevel++;
			const left = this.printIndented(node.left);
			const right = this.printIndented(node.right);
			this.indentLevel--;
			return `${indent}${nodeType}: ${node.operator}\n${left}\n${right}`;
		} else if (node instanceof FunctionNode) {
			this.indentLevel++;
			const args = node.args.map((arg) => this.printIndented(arg)).join("\n");
			this.indentLevel--;
			return `${indent}${nodeType}: ${node.name}\n${args}`;
		}

		return `${indent}Unknown node type`;
	}
}

export class ValidatorVisitor implements ASTVisitor<ValidationResult> {
	private errors: string[] = [];

	visitNumber(node: NumberNode): ValidationResult {
		if (typeof node.value !== "number" || isNaN(node.value)) {
			this.errors.push(`Valor numérico inválido: ${node.value}`);
			return { isValid: false, errors: [...this.errors] };
		}
		return { isValid: true, errors: [] };
	}

	visitBinaryOp(node: BinaryOpNode): ValidationResult {
		const leftResult = node.left.accept(this);
		const rightResult = node.right.accept(this);

		const validOperators = ["+", "-", "*", "/", "**", "%"];
		if (!validOperators.includes(node.operator)) {
			this.errors.push(`Operador inválido: ${node.operator}`);
		}

		const isValid =
			leftResult.isValid && rightResult.isValid && this.errors.length === 0;
		return {
			isValid,
			errors: [...this.errors, ...leftResult.errors, ...rightResult.errors],
		};
	}

	visitVariable(node: VariableNode): ValidationResult {
		if (
			!node.name ||
			typeof node.name !== "string" ||
			!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(node.name)
		) {
			this.errors.push(`Nome de variável inválido: ${node.name}`);
			return { isValid: false, errors: [...this.errors] };
		}
		return { isValid: true, errors: [] };
	}

	visitFunction(node: FunctionNode): ValidationResult {
		const validFunctions = ["sin", "cos", "sqrt", "abs", "min", "max", "sum"];
		if (!validFunctions.includes(node.name)) {
			this.errors.push(`Função não suportada: ${node.name}`);
		}

		const argResults = node.args.map((arg) => arg.accept(this));
		const allArgsValid = argResults.every((result) => result.isValid);
		const allErrors = argResults.flatMap((result) => result.errors);

		return {
			isValid: allArgsValid && this.errors.length === 0,
			errors: [...this.errors, ...allErrors],
		};
	}

	validate(node: ASTNode): ValidationResult {
		this.errors = [];
		return node.accept(this);
	}
}

export class OptimizerVisitor implements ASTVisitor<ASTNode> {
	visitNumber(node: NumberNode): ASTNode {
		return node; // Números já estão otimizados
	}

	visitBinaryOp(node: BinaryOpNode): ASTNode {
		const optimizedLeft = node.left.accept(this);
		const optimizedRight = node.right.accept(this);

		// Constant folding - se ambos operandos são números, calcular em tempo de compilação
		if (
			optimizedLeft instanceof NumberNode &&
			optimizedRight instanceof NumberNode
		) {
			try {
				const evaluator = new EvaluatorVisitor();
				const tempNode = new BinaryOpNode(
					optimizedLeft,
					node.operator,
					optimizedRight,
				);
				const result = tempNode.accept(evaluator);
				return new NumberNode(result);
			} catch {
				// Se der erro (divisão por zero, etc.), manter original
				return new BinaryOpNode(optimizedLeft, node.operator, optimizedRight);
			}
		}

		// Otimizações algébricas
		if (node.operator === "+") {
			// x + 0 = x
			if (optimizedRight instanceof NumberNode && optimizedRight.value === 0) {
				return optimizedLeft;
			}
			// 0 + x = x
			if (optimizedLeft instanceof NumberNode && optimizedLeft.value === 0) {
				return optimizedRight;
			}
		} else if (node.operator === "*") {
			// x * 0 = 0
			if (
				(optimizedLeft instanceof NumberNode && optimizedLeft.value === 0) ||
				(optimizedRight instanceof NumberNode && optimizedRight.value === 0)
			) {
				return new NumberNode(0);
			}
			// x * 1 = x
			if (optimizedRight instanceof NumberNode && optimizedRight.value === 1) {
				return optimizedLeft;
			}
			// 1 * x = x
			if (optimizedLeft instanceof NumberNode && optimizedLeft.value === 1) {
				return optimizedRight;
			}
		} else if (node.operator === "-") {
			// x - 0 = x
			if (optimizedRight instanceof NumberNode && optimizedRight.value === 0) {
				return optimizedLeft;
			}
		}

		return new BinaryOpNode(optimizedLeft, node.operator, optimizedRight);
	}

	visitVariable(node: VariableNode): ASTNode {
		return node; // Variáveis não podem ser otimizadas sem contexto
	}

	visitFunction(node: FunctionNode): ASTNode {
		const optimizedArgs = node.args.map((arg) => arg.accept(this));

		// Se todos os argumentos são constantes, avaliar a função
		if (optimizedArgs.every((arg) => arg instanceof NumberNode)) {
			try {
				const evaluator = new EvaluatorVisitor();
				const tempNode = new FunctionNode(node.name, optimizedArgs);
				const result = tempNode.accept(evaluator);
				return new NumberNode(result);
			} catch {
				// Se der erro, manter original
				return new FunctionNode(node.name, optimizedArgs);
			}
		}

		return new FunctionNode(node.name, optimizedArgs);
	}
}

export class StatisticsVisitor implements ASTVisitor<NodeStatistics> {
	private stats: NodeStatistics = {
		nodeCount: 0,
		numberNodes: 0,
		binaryOpNodes: 0,
		variableNodes: 0,
		functionNodes: 0,
		depth: 0,
		variables: new Set(),
		functions: new Set(),
	};

	visitNumber(node: NumberNode): NodeStatistics {
		this.stats.nodeCount++;
		this.stats.numberNodes++;
		return this.stats;
	}

	visitBinaryOp(node: BinaryOpNode): NodeStatistics {
		this.stats.nodeCount++;
		this.stats.binaryOpNodes++;

		const leftDepth = this.getDepth(node.left);
		const rightDepth = this.getDepth(node.right);
		this.stats.depth = Math.max(
			this.stats.depth,
			Math.max(leftDepth, rightDepth) + 1,
		);

		node.left.accept(this);
		node.right.accept(this);

		return this.stats;
	}

	visitVariable(node: VariableNode): NodeStatistics {
		this.stats.nodeCount++;
		this.stats.variableNodes++;
		this.stats.variables.add(node.name);
		return this.stats;
	}

	visitFunction(node: FunctionNode): NodeStatistics {
		this.stats.nodeCount++;
		this.stats.functionNodes++;
		this.stats.functions.add(node.name);

		node.args.forEach((arg) => arg.accept(this));

		return this.stats;
	}

	private getDepth(node: ASTNode): number {
		if (node instanceof NumberNode || node instanceof VariableNode) {
			return 1;
		} else if (node instanceof BinaryOpNode) {
			return Math.max(this.getDepth(node.left), this.getDepth(node.right)) + 1;
		} else if (node instanceof FunctionNode) {
			return Math.max(...node.args.map((arg) => this.getDepth(arg))) + 1;
		}
		return 0;
	}

	analyze(node: ASTNode): NodeStatistics {
		this.stats = {
			nodeCount: 0,
			numberNodes: 0,
			binaryOpNodes: 0,
			variableNodes: 0,
			functionNodes: 0,
			depth: 0,
			variables: new Set(),
			functions: new Set(),
		};

		node.accept(this);
		return { ...this.stats };
	}
}

// Supporting interfaces
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface NodeStatistics {
	nodeCount: number;
	numberNodes: number;
	binaryOpNodes: number;
	variableNodes: number;
	functionNodes: number;
	depth: number;
	variables: Set<string>;
	functions: Set<string>;
}

// AST Builder utility
export class ASTBuilder {
	static number(value: number): NumberNode {
		return new NumberNode(value);
	}

	static variable(name: string): VariableNode {
		return new VariableNode(name);
	}

	static binaryOp(
		left: ASTNode,
		operator: "+" | "-" | "*" | "/" | "**" | "%",
		right: ASTNode,
	): BinaryOpNode {
		return new BinaryOpNode(left, operator, right);
	}

	static func(name: string, ...args: ASTNode[]): FunctionNode {
		return new FunctionNode(name, args);
	}

	// Convenience methods
	static add(left: ASTNode, right: ASTNode): BinaryOpNode {
		return new BinaryOpNode(left, "+", right);
	}

	static multiply(left: ASTNode, right: ASTNode): BinaryOpNode {
		return new BinaryOpNode(left, "*", right);
	}

	static power(base: ASTNode, exponent: ASTNode): BinaryOpNode {
		return new BinaryOpNode(base, "**", exponent);
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução Visitor) - Operações separadas da estrutura");

	// Construir AST: (5 + x) * sin(y)
	const ast = ASTBuilder.multiply(
		ASTBuilder.add(ASTBuilder.number(5), ASTBuilder.variable("x")),
		ASTBuilder.func("sin", ASTBuilder.variable("y")),
	);

	console.log("\n=== Impressão da Árvore ===");
	const printer = new PrinterVisitor();
	console.log("Expressão:", ast.accept(printer));
	console.log("\nÁrvore estruturada:");
	console.log(printer.printWithIndentation(ast));

	console.log("\n=== Validação ===");
	const validator = new ValidatorVisitor();
	const validation = validator.validate(ast);
	console.log("Válida:", validation.isValid);
	if (!validation.isValid) {
		console.log("Erros:", validation.errors);
	}

	console.log("\n=== Avaliação ===");
	const evaluator = new EvaluatorVisitor();
	evaluator.setVariable("x", 3);
	evaluator.setVariable("y", Math.PI / 2); // sin(π/2) = 1

	try {
		const result = ast.accept(evaluator);
		console.log("Resultado:", result); // (5 + 3) * sin(π/2) = 8 * 1 = 8
	} catch (error) {
		console.error("Erro na avaliação:", error);
	}

	console.log("\n=== Otimização ===");
	const optimizer = new OptimizerVisitor();

	// Expressão com constantes: (2 + 3) * 4
	const constantExpr = ASTBuilder.multiply(
		ASTBuilder.add(ASTBuilder.number(2), ASTBuilder.number(3)),
		ASTBuilder.number(4),
	);

	console.log("Original:", constantExpr.accept(printer));
	const optimized = constantExpr.accept(optimizer);
	console.log("Otimizada:", optimized.accept(printer)); // Deve ser: 20

	console.log("\n=== Estatísticas ===");
	const statistics = new StatisticsVisitor();
	const stats = statistics.analyze(ast);

	console.log("Total de nós:", stats.nodeCount);
	console.log("Profundidade:", stats.depth);
	console.log("Variáveis usadas:", Array.from(stats.variables));
	console.log("Funções usadas:", Array.from(stats.functions));
	console.log("Tipos de nós:", {
		números: stats.numberNodes,
		operações: stats.binaryOpNodes,
		variáveis: stats.variableNodes,
		funções: stats.functionNodes,
	});
}
