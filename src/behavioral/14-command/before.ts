export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Operações diretas sem encapsulamento");

	class SimpleTextEditor {
		private content: string = "";

		addText(text: string) {
			this.content += text;
			console.log(`Adicionando: "${text}"`);
		}

		deleteText(length: number) {
			const deleted = this.content.substring(this.content.length - length);
			this.content = this.content.substring(0, this.content.length - length);
			console.log(`Deletando: "${deleted}"`);
		}

		getContent(): string {
			return this.content;
		}
	}

	const editor = new SimpleTextEditor();

	// Operações diretas - sem histórico, sem undo/redo
	editor.addText("Hello ");
	editor.addText("World!");
	editor.deleteText(1);

	console.log(`Conteúdo final: "${editor.getContent()}"`);
	console.log("Problemas: sem undo/redo, sem histórico, operações acopladas");
}
