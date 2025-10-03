export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Acesso direto aos elementos");

	class SimpleList<T> {
		private items: T[] = [];

		add(item: T): void {
			this.items.push(item);
		}

		// Cliente precisa conhecer estrutura interna
		getItems(): T[] {
			return this.items; // Expõe implementação interna
		}

		getAt(index: number): T {
			return this.items[index];
		}

		size(): number {
			return this.items.length;
		}
	}

	const list = new SimpleList<string>();
	list.add("A");
	list.add("B");
	list.add("C");

	console.log("Iteração manual (frágil):");
	// Cliente deve saber como iterar
	for (let i = 0; i < list.size(); i++) {
		console.log(`Item ${i}: ${list.getAt(i)}`);
	}

	console.log("\nUsando array exposto (quebra encapsulamento):");
	const items = list.getItems();
	for (const item of items) {
		console.log(`Item: ${item}`);
	}

	console.log(
		"\nProblemas: estrutura exposta, só um tipo de iteração, cliente acoplado",
	);
}
