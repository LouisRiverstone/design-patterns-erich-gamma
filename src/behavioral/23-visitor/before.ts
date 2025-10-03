export function demonstrateProblems() {
	console.log(
		"ANTES (Problemático) - Operações misturadas com estrutura de dados",
	);

	interface ASTNode {
		type: string;
		accept(operation: string): any;
	}

	class NumberNode implements ASTNode {
		type = "number";

		constructor(public value: number) {}

		accept(operation: string): any {
			if (operation === "evaluate") {
				return this.value;
			} else if (operation === "print") {
				return this.value.toString();
			} else if (operation === "validate") {
				return typeof this.value === "number";
			} else if (operation === "optimize") {
				return this; // Números já são otimizados
			}
			throw new Error(`Operação ${operation} não suportada`);
		}
	}

	class BinaryOpNode implements ASTNode {
		type = "binary_op";

		constructor(
			public left: ASTNode,
			public operator: string,
			public right: ASTNode,
		) {}

		accept(operation: string): any {
			if (operation === "evaluate") {
				const leftVal = this.left.accept("evaluate");
				const rightVal = this.right.accept("evaluate");

				switch (this.operator) {
					case "+":
						return leftVal + rightVal;
					case "-":
						return leftVal - rightVal;
					case "*":
						return leftVal * rightVal;
					case "/":
						return leftVal / rightVal;
					default:
						throw new Error(`Operador ${this.operator} não suportado`);
				}
			} else if (operation === "print") {
				return `(${this.left.accept("print")} ${this.operator} ${this.right.accept("print")})`;
			} else if (operation === "validate") {
				return this.left.accept("validate") && this.right.accept("validate");
			} else if (operation === "optimize") {
				// Lógica de otimização complexa misturada com estrutura
				const leftOpt = this.left.accept("optimize");
				const rightOpt = this.right.accept("optimize");

				// Se ambos são números, calcular em tempo de compilação
				if (leftOpt.type === "number" && rightOpt.type === "number") {
					const result = new BinaryOpNode(
						leftOpt,
						this.operator,
						rightOpt,
					).accept("evaluate");
					return new NumberNode(result);
				}

				return new BinaryOpNode(leftOpt, this.operator, rightOpt);
			}
			throw new Error(`Operação ${operation} não suportada`);
		}
	}

	// Uso
	const ast = new BinaryOpNode(
		new NumberNode(5),
		"+",
		new BinaryOpNode(new NumberNode(3), "*", new NumberNode(2)),
	);

	console.log("Resultado:", ast.accept("evaluate"));
	console.log("Impressão:", ast.accept("print"));
	console.log("Válido:", ast.accept("validate"));

	console.log(
		"Problemas: operações misturadas, difícil extensão, violação SRP",
	);
}
