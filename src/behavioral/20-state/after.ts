// State interface
export interface DocumentState {
	save(context: DocumentContext): void;
	submitReview(context: DocumentContext): void;
	approve(context: DocumentContext): void;
	reject(context: DocumentContext): void;
	archive(context: DocumentContext): void;
	createVersion(context: DocumentContext): void;
	addContent(context: DocumentContext, content: string): void;
	addComment(context: DocumentContext, comment: string): void;
	getStateName(): string;
	getAllowedActions(): string[];
}

// Context
export class DocumentContext {
	private state: DocumentState;
	private content: string = "";
	private comments: string[] = [];
	private version: number = 1;
	private history: Array<{ action: string; timestamp: Date; state: string }> =
		[];

	constructor() {
		this.state = new EditingState();
	}

	setState(state: DocumentState): void {
		this.state = state;
		console.log(`Estado alterado para: ${state.getStateName()}`);
	}

	// Delegar ações para o estado atual
	save(): void {
		this.logAction("save");
		this.state.save(this);
	}

	submitReview(): void {
		this.logAction("submitReview");
		this.state.submitReview(this);
	}

	approve(): void {
		this.logAction("approve");
		this.state.approve(this);
	}

	reject(): void {
		this.logAction("reject");
		this.state.reject(this);
	}

	archive(): void {
		this.logAction("archive");
		this.state.archive(this);
	}

	createVersion(): void {
		this.logAction("createVersion");
		this.state.createVersion(this);
	}

	addContent(content: string): void {
		this.logAction("addContent");
		this.state.addContent(this, content);
	}

	addComment(comment: string): void {
		this.logAction("addComment");
		this.state.addComment(this, comment);
	}

	// Getters e setters para estado interno
	getContent(): string {
		return this.content;
	}

	setContent(content: string): void {
		this.content = content;
	}

	appendContent(content: string): void {
		this.content += content;
	}

	getComments(): readonly string[] {
		return this.comments;
	}

	addCommentDirect(comment: string): void {
		this.comments.push(comment);
	}

	getVersion(): number {
		return this.version;
	}

	incrementVersion(): void {
		this.version++;
	}

	getCurrentStateName(): string {
		return this.state.getStateName();
	}

	getAllowedActions(): string[] {
		return this.state.getAllowedActions();
	}

	getHistory(): ReadonlyArray<{
		action: string;
		timestamp: Date;
		state: string;
	}> {
		return this.history;
	}

	private logAction(action: string): void {
		this.history.push({
			action,
			timestamp: new Date(),
			state: this.state.getStateName(),
		});
	}
}

// Abstract base state (optional, for common functionality)
abstract class BaseDocumentState implements DocumentState {
	protected notAllowed(action: string): void {
		console.log(
			`Ação "${action}" não permitida no estado ${this.getStateName()}`,
		);
	}

	// Default implementations (throw errors or do nothing)
	save(context: DocumentContext): void {
		this.notAllowed("save");
	}

	submitReview(context: DocumentContext): void {
		this.notAllowed("submitReview");
	}

	approve(context: DocumentContext): void {
		this.notAllowed("approve");
	}

	reject(context: DocumentContext): void {
		this.notAllowed("reject");
	}

	archive(context: DocumentContext): void {
		this.notAllowed("archive");
	}

	createVersion(context: DocumentContext): void {
		this.notAllowed("createVersion");
	}

	addContent(context: DocumentContext, content: string): void {
		this.notAllowed("addContent");
	}

	addComment(context: DocumentContext, comment: string): void {
		this.notAllowed("addComment");
	}

	abstract getStateName(): string;
	abstract getAllowedActions(): string[];
}

// Concrete States
export class EditingState extends BaseDocumentState {
	save(context: DocumentContext): void {
		console.log(" Salvando documento...");
		// Lógica específica de salvamento
	}

	submitReview(context: DocumentContext): void {
		console.log(" Enviando documento para revisão...");
		context.setState(new ReviewingState());
	}

	addContent(context: DocumentContext, content: string): void {
		console.log(` Adicionando conteúdo: "${content}"`);
		context.appendContent(content);
	}

	getStateName(): string {
		return "Editing";
	}

	getAllowedActions(): string[] {
		return ["save", "submitReview", "addContent"];
	}
}

export class ReviewingState extends BaseDocumentState {
	approve(context: DocumentContext): void {
		console.log(" Documento aprovado! Publicando...");
		context.setState(new PublishedState());
	}

	reject(context: DocumentContext): void {
		console.log("Documento rejeitado. Retornando para edição...");
		context.setState(new EditingState());
	}

	addComment(context: DocumentContext, comment: string): void {
		console.log(` Comentário de revisão adicionado: "${comment}"`);
		context.addCommentDirect(comment);
	}

	getStateName(): string {
		return "Reviewing";
	}

	getAllowedActions(): string[] {
		return ["approve", "reject", "addComment"];
	}
}

export class PublishedState extends BaseDocumentState {
	archive(context: DocumentContext): void {
		console.log("📦 Arquivando documento...");
		context.setState(new ArchivedState());
	}

	createVersion(context: DocumentContext): void {
		console.log(" Criando nova versão do documento...");
		context.incrementVersion();
		context.setState(new EditingState());
		console.log(`Versão atual: ${context.getVersion()}`);
	}

	getStateName(): string {
		return "Published";
	}

	getAllowedActions(): string[] {
		return ["archive", "createVersion"];
	}
}

export class ArchivedState extends BaseDocumentState {
	createVersion(context: DocumentContext): void {
		console.log(" Restaurando documento arquivado e criando nova versão...");
		context.incrementVersion();
		context.setState(new EditingState());
		console.log(`Versão atual: ${context.getVersion()}`);
	}

	getStateName(): string {
		return "Archived";
	}

	getAllowedActions(): string[] {
		return ["createVersion"];
	}
}

// Advanced state machine with transition validation
export class StateMachineValidator {
	private static transitions: Map<string, string[]> = new Map([
		["Editing", ["Reviewing"]],
		["Reviewing", ["Published", "Editing"]],
		["Published", ["Archived", "Editing"]],
		["Archived", ["Editing"]],
	]);

	static isValidTransition(from: string, to: string): boolean {
		const validTransitions = this.transitions.get(from) || [];
		return validTransitions.includes(to);
	}

	static getValidTransitions(from: string): string[] {
		return this.transitions.get(from) || [];
	}

	static validateTransition(from: string, to: string): void {
		if (!this.isValidTransition(from, to)) {
			throw new Error(`Transição inválida de ${from} para ${to}`);
		}
	}
}

// Enhanced DocumentContext with validation
export class ValidatedDocumentContext extends DocumentContext {
	setState(state: DocumentState): void {
		const currentState = this.getCurrentStateName();
		const newState = state.getStateName();

		try {
			StateMachineValidator.validateTransition(currentState, newState);
			super.setState(state);
		} catch (error) {
			console.error(`Erro de transição: ${error}`);
			throw error;
		}
	}

	getValidNextStates(): string[] {
		return StateMachineValidator.getValidTransitions(
			this.getCurrentStateName(),
		);
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução State) - Estados encapsulados e bem definidos");

	console.log("\n=== Fluxo Normal ===");
	const document = new DocumentContext();

	console.log(`Estado inicial: ${document.getCurrentStateName()}`);
	console.log(`Ações permitidas: ${document.getAllowedActions().join(", ")}`);

	// Editing state
	document.addContent("Introdução do documento...");
	document.addContent(" Mais conteúdo...");
	document.save();

	// Transition to reviewing
	document.submitReview();

	// Reviewing state
	document.addComment("Este documento precisa de mais detalhes na seção 2");
	document.addComment("Verificar referências");

	console.log(`Comentários: ${document.getComments().length}`);

	// Reject and go back to editing
	document.reject();

	// Edit more and resubmit
	document.addContent(" Seção 2 expandida...");
	document.submitReview();

	// Approve this time
	document.approve();

	// Published state
	console.log(`Documento publicado! Versão: ${document.getVersion()}`);

	// Create new version
	document.createVersion();
	document.addContent("Nova versão com melhorias...");

	console.log("\n=== Tentativa de Ação Inválida ===");
	// Try invalid action
	document.archive(); // Should fail - not in published state

	console.log("\n=== Estado Validado ===");
	const validatedDoc = new ValidatedDocumentContext();
	console.log(
		`Estados válidos a partir de ${validatedDoc.getCurrentStateName()}: ${validatedDoc.getValidNextStates().join(", ")}`,
	);

	console.log("\n=== Histórico de Ações ===");
	const history = document.getHistory();
	console.log(`Total de ações: ${history.length}`);
	history.slice(-3).forEach((entry) => {
		console.log(
			`${entry.action} em ${entry.state} às ${entry.timestamp.toLocaleTimeString()}`,
		);
	});
}
