export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Estado complexo em métodos longos");

	class Document {
		private state: "editing" | "reviewing" | "published" = "editing";
		private content: string = "";

		processAction(action: string): void {
			if (this.state === "editing") {
				if (action === "save") {
					console.log("Salvando documento...");
					// Lógica complexa de salvamento
				} else if (action === "submit_review") {
					console.log("Enviando para revisão...");
					this.state = "reviewing";
				} else if (action === "add_content") {
					console.log("Adicionando conteúdo...");
					this.content += "novo conteúdo ";
				} else {
					console.log("Ação não permitida no estado editing");
				}
			} else if (this.state === "reviewing") {
				if (action === "approve") {
					console.log("Aprovando documento...");
					this.state = "published";
				} else if (action === "reject") {
					console.log("Rejeitando documento...");
					this.state = "editing";
				} else if (action === "add_comment") {
					console.log("Adicionando comentário de revisão...");
				} else {
					console.log("Ação não permitida no estado reviewing");
				}
			} else if (this.state === "published") {
				if (action === "archive") {
					console.log("Arquivando documento...");
				} else if (action === "create_version") {
					console.log("Criando nova versão...");
					this.state = "editing";
				} else {
					console.log("Ação não permitida no estado published");
				}
			}
		}

		getState(): string {
			return this.state;
		}
	}

	const doc = new Document();
	doc.processAction("add_content");
	doc.processAction("submit_review");
	doc.processAction("approve");
	doc.processAction("archive");

	console.log(
		"Problemas: lógica complexa, difícil manutenção, estados misturados",
	);
}
