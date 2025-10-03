export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Parsing manual de expressões");

	function evaluateExpression(expression: string): number {
		// Implementação ingênua com eval ou parsing manual complexo
		try {
			// Usar eval é perigoso e limitado
			const result = eval(expression);
			console.log(`Avaliando "${expression}" = ${result}`);
			return result;
		} catch (error) {
			console.log(`Erro avaliando "${expression}": ${error}`);
			return 0;
		}
	}

	function evaluateManually(expr: string): number {
		// Parsing manual complexo e limitado
		expr = expr.replace(/\s/g, ""); // Remove espaços

		// Só funciona para casos muito simples
		if (expr.includes("+")) {
			const parts = expr.split("+");
			return parseInt(parts[0]) + parseInt(parts[1]);
		}

		if (expr.includes("-")) {
			const parts = expr.split("-");
			return parseInt(parts[0]) - parseInt(parts[1]);
		}

		return parseInt(expr);
	}

	// Testes
	evaluateExpression("2 + 3");
	evaluateExpression("10 - 5");

	console.log("\nParsing manual:");
	console.log(`5+3 = ${evaluateManually("5+3")}`);
	console.log(`10-2 = ${evaluateManually("10-2")}`);

	console.log(
		"\nProblemas: eval inseguro, parsing manual limitado, difícil extensão",
	);
}
