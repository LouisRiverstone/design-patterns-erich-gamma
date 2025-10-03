export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Processamento direto de tickets");

	const tickets = [
		{ id: 1, complexity: 1, description: "Senha esquecida", priority: "low" },
		{
			id: 2,
			complexity: 5,
			description: "Pagamento com erro",
			priority: "high",
		},
		{
			id: 3,
			complexity: 3,
			description: "Bug intermitente",
			priority: "medium",
		},
	];

	// Código ingênuo: cliente decide manualmente quem deve resolver
	for (const t of tickets) {
		if (t.priority === "low") {
			console.log(`[L1] Resolvendo ticket #${t.id}: ${t.description}`);
			continue;
		}

		if (t.priority === "medium") {
			console.log(`[L2] Resolvendo ticket #${t.id}: ${t.description}`);
			continue;
		}

		if (t.priority === "high") {
			console.log(`[MANAGER] Resolvendo ticket #${t.id}: ${t.description}`);
			continue;
		}
	}

	console.log("Problemas: lógica duplicada, difícil extender e testar.");
}
