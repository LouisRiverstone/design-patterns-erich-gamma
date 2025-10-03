export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Estado exposto e sem histórico");

	class Document {
		private content: string = "";
		private fontSize: number = 12;
		private fontFamily: string = "Arial";

		write(text: string): void {
			this.content += text;
		}

		setFontSize(size: number): void {
			this.fontSize = size;
		}

		setFontFamily(family: string): void {
			this.fontFamily = family;
		}

		// Problema: estado interno exposto
		getState() {
			return {
				content: this.content,
				fontSize: this.fontSize,
				fontFamily: this.fontFamily,
			};
		}

		// Problema: acoplamento com estrutura interna
		setState(state: any): void {
			this.content = state.content;
			this.fontSize = state.fontSize;
			this.fontFamily = state.fontFamily;
		}

		getContent(): string {
			return this.content;
		}
	}

	class Editor {
		private document: Document = new Document();
		private history: any[] = [];

		execute(action: () => void): void {
			// Salva estado ANTES da ação (problemático)
			this.history.push(this.document.getState());
			action();
		}

		undo(): void {
			if (this.history.length > 0) {
				const previousState = this.history.pop();
				this.document.setState(previousState);
			}
		}
	}

	const editor = new Editor();
	const doc = (editor as any).document;

	editor.execute(() => doc.write("Hello "));
	editor.execute(() => doc.write("World!"));
	editor.execute(() => doc.setFontSize(16));

	console.log("Conteúdo atual:", doc.getContent());

	editor.undo();
	console.log("Após undo:", doc.getContent());

	console.log("Problemas: estado exposto, acoplamento, serialização manual");
}
