// Memento interface (opaque interface)
export interface DocumentMemento {
	// Memento é opaco - não expõe detalhes internos
	readonly timestamp: Date;
	readonly description: string;
}

// Concrete Memento
class ConcreteDocumentMemento implements DocumentMemento {
	public readonly timestamp: Date;

	constructor(
		private readonly content: string,
		private readonly fontSize: number,
		private readonly fontFamily: string,
		private readonly cursorPosition: number,
		public readonly description: string,
	) {
		this.timestamp = new Date();
	}

	// Apenas o Originator pode acessar o estado interno
	getContent(): string {
		return this.content;
	}

	getFontSize(): number {
		return this.fontSize;
	}

	getFontFamily(): string {
		return this.fontFamily;
	}

	getCursorPosition(): number {
		return this.cursorPosition;
	}
}

// Originator
export class Document {
	private content: string = "";
	private fontSize: number = 12;
	private fontFamily: string = "Arial";
	private cursorPosition: number = 0;

	write(text: string): void {
		const before = this.content.substring(0, this.cursorPosition);
		const after = this.content.substring(this.cursorPosition);
		this.content = before + text + after;
		this.cursorPosition += text.length;
	}

	delete(length: number): void {
		if (this.cursorPosition >= length) {
			const before = this.content.substring(0, this.cursorPosition - length);
			const after = this.content.substring(this.cursorPosition);
			this.content = before + after;
			this.cursorPosition -= length;
		}
	}

	setCursorPosition(position: number): void {
		this.cursorPosition = Math.max(0, Math.min(position, this.content.length));
	}

	setFontSize(size: number): void {
		this.fontSize = size;
	}

	setFontFamily(family: string): void {
		this.fontFamily = family;
	}

	// Cria memento sem expor estado interno
	createMemento(description: string): DocumentMemento {
		return new ConcreteDocumentMemento(
			this.content,
			this.fontSize,
			this.fontFamily,
			this.cursorPosition,
			description,
		);
	}

	// Restaura estado do memento
	restoreFromMemento(memento: DocumentMemento): void {
		if (memento instanceof ConcreteDocumentMemento) {
			this.content = memento.getContent();
			this.fontSize = memento.getFontSize();
			this.fontFamily = memento.getFontFamily();
			this.cursorPosition = memento.getCursorPosition();
		} else {
			throw new Error("Invalid memento type");
		}
	}

	getContent(): string {
		return this.content;
	}

	getFontSize(): number {
		return this.fontSize;
	}

	getFontFamily(): string {
		return this.fontFamily;
	}

	getCursorPosition(): number {
		return this.cursorPosition;
	}

	getFormattedText(): string {
		return `[${this.fontFamily}, ${this.fontSize}px] ${this.content}`;
	}
}

// Caretaker
export class DocumentHistory {
	private mementos: DocumentMemento[] = [];
	private currentIndex: number = -1;
	private maxHistorySize: number;

	constructor(maxHistorySize: number = 50) {
		this.maxHistorySize = maxHistorySize;
	}

	save(memento: DocumentMemento): void {
		// Remove histórico futuro se estamos no meio da pilha
		this.mementos = this.mementos.slice(0, this.currentIndex + 1);

		// Adiciona novo memento
		this.mementos.push(memento);
		this.currentIndex++;

		// Limita tamanho do histórico
		if (this.mementos.length > this.maxHistorySize) {
			this.mementos.shift();
			this.currentIndex--;
		}
	}

	undo(): DocumentMemento | null {
		if (this.canUndo()) {
			this.currentIndex--;
			return this.mementos[this.currentIndex];
		}
		return null;
	}

	redo(): DocumentMemento | null {
		if (this.canRedo()) {
			this.currentIndex++;
			return this.mementos[this.currentIndex];
		}
		return null;
	}

	canUndo(): boolean {
		return this.currentIndex > 0;
	}

	canRedo(): boolean {
		return this.currentIndex < this.mementos.length - 1;
	}

	getHistory(): readonly DocumentMemento[] {
		return this.mementos;
	}

	getCurrentIndex(): number {
		return this.currentIndex;
	}

	clear(): void {
		this.mementos = [];
		this.currentIndex = -1;
	}

	getMemento(index: number): DocumentMemento | null {
		if (index >= 0 && index < this.mementos.length) {
			return this.mementos[index];
		}
		return null;
	}
}

// Enhanced Caretaker with branching support
export class BranchingDocumentHistory {
	private branches: Map<string, DocumentMemento[]> = new Map();
	private currentBranch: string = "main";
	private currentIndex: number = -1;

	constructor(private maxHistorySize: number = 50) {
		this.branches.set("main", []);
	}

	save(memento: DocumentMemento, branchName?: string): void {
		const branch = branchName || this.currentBranch;

		if (!this.branches.has(branch)) {
			this.branches.set(branch, []);
		}

		const mementos = this.branches.get(branch)!;

		// Remove histórico futuro
		const newMementos = mementos.slice(0, this.currentIndex + 1);
		newMementos.push(memento);

		// Limita tamanho
		if (newMementos.length > this.maxHistorySize) {
			newMementos.shift();
		} else {
			this.currentIndex++;
		}

		this.branches.set(branch, newMementos);
	}

	createBranch(branchName: string, fromIndex?: number): void {
		const currentMementos = this.branches.get(this.currentBranch)!;
		const index = fromIndex ?? this.currentIndex;

		if (index >= 0 && index < currentMementos.length) {
			const branchMementos = currentMementos.slice(0, index + 1);
			this.branches.set(branchName, branchMementos);
		}
	}

	switchBranch(branchName: string): boolean {
		if (this.branches.has(branchName)) {
			this.currentBranch = branchName;
			this.currentIndex = this.branches.get(branchName)!.length - 1;
			return true;
		}
		return false;
	}

	undo(): DocumentMemento | null {
		const mementos = this.branches.get(this.currentBranch)!;
		if (this.currentIndex > 0) {
			this.currentIndex--;
			return mementos[this.currentIndex];
		}
		return null;
	}

	redo(): DocumentMemento | null {
		const mementos = this.branches.get(this.currentBranch)!;
		if (this.currentIndex < mementos.length - 1) {
			this.currentIndex++;
			return mementos[this.currentIndex];
		}
		return null;
	}

	getBranches(): string[] {
		return Array.from(this.branches.keys());
	}

	getCurrentBranch(): string {
		return this.currentBranch;
	}

	getCurrentMemento(): DocumentMemento | null {
		const mementos = this.branches.get(this.currentBranch)!;
		return this.currentIndex >= 0 ? mementos[this.currentIndex] : null;
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução Memento) - Estado encapsulado com histórico");

	// História simples
	console.log("\n=== História Linear ===");
	const document = new Document();
	const history = new DocumentHistory();

	// Estado inicial
	history.save(document.createMemento("Estado inicial"));

	document.write("Hello ");
	history.save(document.createMemento('Escreveu "Hello "'));

	document.write("World!");
	history.save(document.createMemento('Escreveu "World!"'));

	document.setFontSize(16);
	history.save(document.createMemento("Mudou fonte para 16px"));

	console.log("Conteúdo atual:", document.getFormattedText());

	// Undo/Redo
	if (history.canUndo()) {
		const memento = history.undo();
		if (memento) {
			document.restoreFromMemento(memento);
			console.log("Após undo:", document.getFormattedText());
		}
	}

	if (history.canRedo()) {
		const memento = history.redo();
		if (memento) {
			document.restoreFromMemento(memento);
			console.log("Após redo:", document.getFormattedText());
		}
	}

	// História com branches
	console.log("\n=== História com Branches ===");
	const doc2 = new Document();
	const branchHistory = new BranchingDocumentHistory();

	doc2.write("Texto base");
	branchHistory.save(doc2.createMemento("Texto base"));

	// Criar branch
	branchHistory.createBranch("feature");
	branchHistory.switchBranch("feature");

	doc2.write(" - Feature A");
	branchHistory.save(doc2.createMemento("Adicionou Feature A"));

	console.log("Branch feature:", doc2.getContent());

	// Voltar para main
	branchHistory.switchBranch("main");
	const mainMemento = branchHistory.getCurrentMemento();
	if (mainMemento) {
		doc2.restoreFromMemento(mainMemento);
	}

	doc2.write(" - Feature B");
	branchHistory.save(doc2.createMemento("Adicionou Feature B"));

	console.log("Branch main:", doc2.getContent());
	console.log("Branches disponíveis:", branchHistory.getBranches());
}
