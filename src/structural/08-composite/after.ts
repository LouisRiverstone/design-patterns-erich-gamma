// Solução: Composite Pattern trata objetos individuais e composições uniformemente
// Benefício: Interface única, transparência, recursão natural

//  Component - Interface comum
export interface FileSystemItem {
	getName(): string;
	getSize(): number;
	display(indent?: string): void;
	find(name: string): FileSystemItem[];
	getPath(): string;
	setParent(parent: FileSystemItem | null): void;
}

//  Leaf - Arquivo (objeto individual)
export class File implements FileSystemItem {
	private parent: FileSystemItem | null = null;

	constructor(
		private name: string,
		private size: number,
		private content: string = "",
	) {}

	getName(): string {
		return this.name;
	}

	getSize(): number {
		return this.size;
	}

	display(indent: string = ""): void {
		console.log(`${indent} ${this.name} (${this.size}KB)`);
	}

	find(name: string): FileSystemItem[] {
		return this.name.includes(name) ? [this] : [];
	}

	getPath(): string {
		const parentPath = this.parent?.getPath() || "";
		return parentPath ? `${parentPath}/${this.name}` : this.name;
	}

	setParent(parent: FileSystemItem | null): void {
		this.parent = parent;
	}

	//  Métodos específicos de arquivo
	getContent(): string {
		return this.content;
	}

	setContent(content: string): void {
		this.content = content;
		this.size = Math.ceil(content.length / 1024); // Recalcula tamanho
	}
}

//  Composite - Diretório (contém outros itens)
export class Directory implements FileSystemItem {
	private children: FileSystemItem[] = [];
	private parent: FileSystemItem | null = null;

	constructor(private name: string) {}

	getName(): string {
		return this.name;
	}

	//  Operação composta - calcula tamanho de todos os filhos
	getSize(): number {
		return this.children.reduce((total, child) => total + child.getSize(), 0);
	}

	display(indent: string = ""): void {
		console.log(`${indent} ${this.name}/`);
		this.children.forEach((child) => child.display(indent + "  "));
	}

	//  Busca recursiva transparente
	find(name: string): FileSystemItem[] {
		const results: FileSystemItem[] = [];

		// Verifica se o próprio diretório coincide
		if (this.name.includes(name)) {
			results.push(this);
		}

		// Busca nos filhos (polimorfismo!)
		this.children.forEach((child) => {
			results.push(...child.find(name));
		});

		return results;
	}

	getPath(): string {
		const parentPath = this.parent?.getPath() || "";
		return parentPath ? `${parentPath}/${this.name}` : this.name;
	}

	setParent(parent: FileSystemItem | null): void {
		this.parent = parent;
	}

	//  Métodos específicos de diretório
	add(item: FileSystemItem): void {
		this.children.push(item);
		item.setParent(this);
	}

	remove(item: FileSystemItem): void {
		const index = this.children.indexOf(item);
		if (index > -1) {
			this.children.splice(index, 1);
			item.setParent(null);
		}
	}

	getChildren(): FileSystemItem[] {
		return [...this.children];
	}

	getChildrenCount(): number {
		return this.children.length;
	}

	//  Operações úteis para diretórios
	isEmpty(): boolean {
		return this.children.length === 0;
	}

	getFileCount(): number {
		return this.children.reduce((count, child) => {
			if (child instanceof File) {
				return count + 1;
			} else if (child instanceof Directory) {
				return count + child.getFileCount();
			}
			return count;
		}, 0);
	}

	getDirectoryCount(): number {
		return this.children.reduce((count, child) => {
			if (child instanceof Directory) {
				return count + 1 + child.getDirectoryCount();
			}
			return count;
		}, 0);
	}
}

//  Cliente usa interface uniforme
export class FileSystemManager {
	//  Método único para qualquer tipo de item
	analyzeItem(item: FileSystemItem): void {
		console.log(` Analisando: ${item.getName()}`);
		console.log(`   Caminho: ${item.getPath()}`);
		console.log(`   Tamanho: ${item.getSize()}KB`);

		if (item instanceof Directory) {
			console.log(`   Arquivos: ${item.getFileCount()}`);
			console.log(`   Diretórios: ${item.getDirectoryCount()}`);
		}
	}

	//  Operação em lote - trata tudo igual
	calculateTotalSize(items: FileSystemItem[]): number {
		return items.reduce((total, item) => total + item.getSize(), 0);
	}

	//  Busca unificada
	searchInItems(items: FileSystemItem[], query: string): FileSystemItem[] {
		const results: FileSystemItem[] = [];
		items.forEach((item) => {
			results.push(...item.find(query));
		});
		return results;
	}

	//  Cópia recursiva
	copyStructure(source: FileSystemItem, targetName?: string): FileSystemItem {
		if (source instanceof File) {
			return new File(
				targetName || `${source.getName()}_copy`,
				source.getSize(),
				source.getContent(),
			);
		} else if (source instanceof Directory) {
			const newDir = new Directory(targetName || `${source.getName()}_copy`);
			source.getChildren().forEach((child) => {
				newDir.add(this.copyStructure(child));
			});
			return newDir;
		}

		throw new Error("Tipo de item não suportado");
	}
}

//  Builder para facilitar criação de estruturas
export class FileSystemBuilder {
	private root: Directory;

	constructor(rootName: string) {
		this.root = new Directory(rootName);
	}

	addFile(path: string, name: string, size: number, content?: string): this {
		const targetDir = this.getOrCreateDirectory(path);
		targetDir.add(new File(name, size, content));
		return this;
	}

	addDirectory(path: string, name: string): this {
		const targetDir = this.getOrCreateDirectory(path);
		targetDir.add(new Directory(name));
		return this;
	}

	private getOrCreateDirectory(path: string): Directory {
		if (!path || path === "/") return this.root;

		const parts = path.split("/").filter((p) => p);
		let current = this.root;

		for (const part of parts) {
			let found = current
				.getChildren()
				.find(
					(child) => child.getName() === part && child instanceof Directory,
				) as Directory;

			if (!found) {
				found = new Directory(part);
				current.add(found);
			}

			current = found;
		}

		return current;
	}

	build(): Directory {
		return this.root;
	}
}

export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Composite) ===");

	//  Criação fluente com builder
	const project = new FileSystemBuilder("my-project")
		.addDirectory("/", "src")
		.addDirectory("/", "docs")
		.addDirectory("/", "tests")
		.addFile("/src", "app.ts", 45, "export class App {}")
		.addFile("/src", "utils.ts", 23, "export const utils = {}")
		.addFile("/docs", "README.md", 12, "# Project Documentation")
		.addFile("/tests", "app.test.ts", 18, "describe('App', () => {})")
		.addFile("/", "package.json", 5, '{"name": "my-project"}')
		.build();

	console.log("📂 Estrutura completa:");
	project.display();

	//  Interface uniforme
	const manager = new FileSystemManager();

	console.log("\n Análise do projeto:");
	manager.analyzeItem(project);

	//  Busca transparente
	console.log("\n Busca por 'test':");
	const searchResults = project.find("test");
	searchResults.forEach((item) => {
		console.log(`   Encontrado: ${item.getPath()}`);
	});

	//  Operações em lote
	const allItems = [project, ...project.getChildren()];
	console.log(`\n📏 Tamanho total: ${manager.calculateTotalSize(allItems)}KB`);

	//  Cópia de estrutura
	console.log("\n Criando backup:");
	const backup = manager.copyStructure(project, "my-project-backup");
	console.log(`Backup criado: ${backup.getName()}`);

	console.log(
		"\n Benefícios: interface única, recursão natural, transparência",
	);
}
