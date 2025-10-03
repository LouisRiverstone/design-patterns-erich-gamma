// Context - contém informações globais do interpretador
export class Context {
	private variables: Map<string, number> = new Map();

	setVariable(name: string, value: number): void {
		this.variables.set(name, value);
	}

	getVariable(name: string): number {
		const value = this.variables.get(name);
		if (value === undefined) {
			throw new Error(`Variable '${name}' not found`);
		}
		return value;
	}

	hasVariable(name: string): boolean {
		return this.variables.has(name);
	}

	getAllVariables(): Record<string, number> {
		return Object.fromEntries(this.variables);
	}
}

// Abstract Expression
export abstract class Expression {
	abstract interpret(context: Context): number;
	abstract toString(): string;
}

// Terminal Expression - números
export class NumberExpression extends Expression {
	constructor(private value: number) {
		super();
	}

	interpret(context: Context): number {
		return this.value;
	}

	toString(): string {
		return this.value.toString();
	}
}

// Terminal Expression - variáveis
export class VariableExpression extends Expression {
	constructor(private name: string) {
		super();
	}

	interpret(context: Context): number {
		return context.getVariable(this.name);
	}

	toString(): string {
		return this.name;
	}
}

// Non-terminal Expression - adição
export class AddExpression extends Expression {
	constructor(
		private left: Expression,
		private right: Expression,
	) {
		super();
	}

	interpret(context: Context): number {
		return this.left.interpret(context) + this.right.interpret(context);
	}

	toString(): string {
		return `(${this.left.toString()} + ${this.right.toString()})`;
	}
}

// Non-terminal Expression - subtração
export class SubtractExpression extends Expression {
	constructor(
		private left: Expression,
		private right: Expression,
	) {
		super();
	}

	interpret(context: Context): number {
		return this.left.interpret(context) - this.right.interpret(context);
	}

	toString(): string {
		return `(${this.left.toString()} - ${this.right.toString()})`;
	}
}

// Non-terminal Expression - multiplicação
export class MultiplyExpression extends Expression {
	constructor(
		private left: Expression,
		private right: Expression,
	) {
		super();
	}

	interpret(context: Context): number {
		return this.left.interpret(context) * this.right.interpret(context);
	}

	toString(): string {
		return `(${this.left.toString()} * ${this.right.toString()})`;
	}
}

// Non-terminal Expression - divisão
export class DivideExpression extends Expression {
	constructor(
		private left: Expression,
		private right: Expression,
	) {
		super();
	}

	interpret(context: Context): number {
		const rightValue = this.right.interpret(context);
		if (rightValue === 0) {
			throw new Error("Division by zero");
		}
		return this.left.interpret(context) / rightValue;
	}

	toString(): string {
		return `(${this.left.toString()} / ${this.right.toString()})`;
	}
}

// Parser simples para expressões
export class ExpressionParser {
	private tokens: string[] = [];
	private position: number = 0;

	parse(expression: string): Expression {
		this.tokens = this.tokenize(expression);
		this.position = 0;
		return this.parseExpression();
	}

	private tokenize(expression: string): string[] {
		return expression
			.replace(/\s+/g, "")
			.split(/([+\-*/()])/g)
			.filter((token) => token.length > 0);
	}

	private parseExpression(): Expression {
		let left = this.parseTerm();

		while (this.position < this.tokens.length) {
			const operator = this.tokens[this.position];

			if (operator === "+") {
				this.position++;
				const right = this.parseTerm();
				left = new AddExpression(left, right);
			} else if (operator === "-") {
				this.position++;
				const right = this.parseTerm();
				left = new SubtractExpression(left, right);
			} else {
				break;
			}
		}

		return left;
	}

	private parseTerm(): Expression {
		let left = this.parseFactor();

		while (this.position < this.tokens.length) {
			const operator = this.tokens[this.position];

			if (operator === "*") {
				this.position++;
				const right = this.parseFactor();
				left = new MultiplyExpression(left, right);
			} else if (operator === "/") {
				this.position++;
				const right = this.parseFactor();
				left = new DivideExpression(left, right);
			} else {
				break;
			}
		}

		return left;
	}

	private parseFactor(): Expression {
		const token = this.tokens[this.position];

		if (token === "(") {
			this.position++; // skip '('
			const expr = this.parseExpression();
			this.position++; // skip ')'
			return expr;
		}

		this.position++;

		// Verifica se é número
		if (/^\d+(\.\d+)?$/.test(token)) {
			return new NumberExpression(parseFloat(token));
		}

		// Assume que é variável
		return new VariableExpression(token);
	}
}

// Calculator que usa o interpreter
export class Calculator {
	private parser = new ExpressionParser();
	private context = new Context();

	setVariable(name: string, value: number): void {
		this.context.setVariable(name, value);
	}

	evaluate(expression: string): number {
		try {
			const parsedExpression = this.parser.parse(expression);
			const result = parsedExpression.interpret(this.context);
			console.log(`${parsedExpression.toString()} = ${result}`);
			return result;
		} catch (error) {
			console.error(`Erro: ${error}`);
			throw error;
		}
	}

	getVariables(): Record<string, number> {
		return this.context.getAllVariables();
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução Interpreter) - Grammar e AST estruturado");

	const calc = new Calculator();

	// Expressões simples
	console.log("\n=== Expressões Numéricas ===");
	calc.evaluate("5 + 3");
	calc.evaluate("10 - 2");
	calc.evaluate("4 * 7");
	calc.evaluate("15 / 3");

	// Expressões com precedência
	console.log("\n=== Precedência de Operadores ===");
	calc.evaluate("2 + 3 * 4"); // = 2 + 12 = 14
	calc.evaluate("(2 + 3) * 4"); // = 5 * 4 = 20

	// Variáveis
	console.log("\n=== Usando Variáveis ===");
	calc.setVariable("x", 10);
	calc.setVariable("y", 5);

	calc.evaluate("x + y");
	calc.evaluate("x * 2 - y");
	calc.evaluate("(x + y) / 3");

	console.log("\nVariáveis definidas:", calc.getVariables());

	// Expressões complexas
	console.log("\n=== Expressões Complexas ===");
	calc.setVariable("a", 2);
	calc.setVariable("b", 3);
	calc.setVariable("c", 4);

	calc.evaluate("a * b + c");
	calc.evaluate("a + b * c");
	calc.evaluate("(a + b) * (c - a)");
}
