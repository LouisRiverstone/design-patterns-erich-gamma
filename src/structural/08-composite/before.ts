// Cenário: Sistema de arquivos com pastas e arquivos
// Problema: Tratamento diferente para objetos individuais vs composições

// Abordagem ingênua: lógica separada para folhas vs composições
class File {
	constructor(
		public name: string,
		public size: number,
		public content: string = "",
	) {}

	getSize(): number {
		return this.size;
	}

	display(indent: string = ""): void {
		console.log(`${indent} ${this.name} (${this.size}KB)`);
	}
}

class Directory {
	private files: File[] = [];
	private subdirectories: Directory[] = [];

	constructor(public name: string) {}

	addFile(file: File): void {
		this.files.push(file);
	}

	addDirectory(dir: Directory): void {
		this.subdirectories.push(dir);
	}

	// Lógica complexa para calcular tamanho total
	getTotalSize(): number {
		let total = 0;

		// Soma arquivos
		for (const file of this.files) {
			total += file.getSize();
		}

		// Soma subdiretórios recursivamente
		for (const subdir of this.subdirectories) {
			total += subdir.getTotalSize();
		}

		return total;
	}

	// Lógica complexa para exibir estrutura
	display(indent: string = ""): void {
		console.log(`${indent} ${this.name}/`);

		// Exibe arquivos
		for (const file of this.files) {
			file.display(indent + "  ");
		}

		// Exibe subdiretórios
		for (const subdir of this.subdirectories) {
			subdir.display(indent + "  ");
		}
	}

	// Busca complexa
	findByName(name: string): (File | Directory)[] {
		const results: (File | Directory)[] = [];

		// Busca nos arquivos
		for (const file of this.files) {
			if (file.name.includes(name)) {
				results.push(file);
			}
		}

		// Busca nos subdiretórios
		for (const subdir of this.subdirectories) {
			if (subdir.name.includes(name)) {
				results.push(subdir);
			}
			// Busca recursivamente
			results.push(...subdir.findByName(name));
		}

		return results;
	}
}

// Cliente precisa tratar tipos diferentes
class FileSystemManager {
	analyzeStorage(items: (File | Directory)[]): void {
		let totalSize = 0;
		let fileCount = 0;
		let dirCount = 0;

		for (const item of items) {
			// Type checking necessário
			if (item instanceof File) {
				totalSize += item.getSize();
				fileCount++;
			} else if (item instanceof Directory) {
				totalSize += item.getTotalSize(); // Método diferente!
				dirCount++;
			}
		}

		console.log(
			` Análise: ${fileCount} arquivos, ${dirCount} diretórios, ${totalSize}KB total`,
		);
	}
}

export function demonstrateProblems() {
	console.log("=== ANTES (Problemático) ===");

	// Criando estrutura
	const root = new Directory("projeto");
	const src = new Directory("src");
	const docs = new Directory("docs");

	src.addFile(new File("app.ts", 45));
	src.addFile(new File("utils.ts", 23));
	docs.addFile(new File("README.md", 12));

	root.addDirectory(src);
	root.addDirectory(docs);
	root.addFile(new File("package.json", 5));

	console.log("📂 Estrutura:");
	root.display();

	console.log(`\n📏 Tamanho total: ${root.getTotalSize()}KB`);

	// Tratamento inconsistente
	const manager = new FileSystemManager();
	const items = [new File("test.txt", 10), new Directory("temp")];
	manager.analyzeStorage(items);

	console.log(
		"Problemas: lógica duplicada, tratamento inconsistente, complexidade",
	);
}
