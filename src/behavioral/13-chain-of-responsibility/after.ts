export type Ticket = {
	id: number;
	complexity: number;
	description: string;
	priority: "low" | "medium" | "high";
};

export interface Handler {
	setNext(handler: Handler): Handler;
	handle(ticket: Ticket): boolean;
}

export abstract class BaseHandler implements Handler {
	private nextHandler: Handler | null = null;

	setNext(handler: Handler): Handler {
		this.nextHandler = handler;
		return handler;
	}

	handle(ticket: Ticket): boolean {
		if (this.canHandle(ticket)) {
			this.process(ticket);
			return true;
		}

		if (this.nextHandler) {
			return this.nextHandler.handle(ticket);
		}

		// Não foi tratado por nenhum handler
		return false;
	}

	protected abstract canHandle(ticket: Ticket): boolean;
	protected abstract process(ticket: Ticket): void;
}

export class Level1Handler extends BaseHandler {
	protected canHandle(ticket: Ticket): boolean {
		return ticket.priority === "low" || ticket.complexity <= 1;
	}

	protected process(ticket: Ticket): void {
		console.log(`[L1] Resolvendo ticket #${ticket.id}: ${ticket.description}`);
	}
}

export class Level2Handler extends BaseHandler {
	protected canHandle(ticket: Ticket): boolean {
		return (
			ticket.priority === "medium" ||
			(ticket.complexity > 1 && ticket.complexity <= 4)
		);
	}

	protected process(ticket: Ticket): void {
		console.log(`[L2] Resolvendo ticket #${ticket.id}: ${ticket.description}`);
	}
}

export class ManagerHandler extends BaseHandler {
	protected canHandle(ticket: Ticket): boolean {
		return ticket.priority === "high" || ticket.complexity > 4;
	}

	protected process(ticket: Ticket): void {
		console.log(
			`[MANAGER] Resolvendo ticket #${ticket.id}: ${ticket.description}`,
		);
	}
}

// Helper para construir a cadeia padrão
export function createSupportChain(): Handler {
	const l1 = new Level1Handler();
	const l2 = new Level2Handler();
	const mgr = new ManagerHandler();

	l1.setNext(l2).setNext(mgr);
	return l1;
}

export function demonstrateSolution() {
	console.log(
		"DEPOIS (Solução Chain of Responsibility) - Encadeamento de handlers",
	);

	const chain = createSupportChain();

	const tickets: Ticket[] = [
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
		{
			id: 4,
			complexity: 10,
			description: "Falha de segurança crítica",
			priority: "high",
		},
	];

	for (const t of tickets) {
		const handled = chain.handle(t);
		if (!handled) {
			console.log(`Ticket #${t.id} não pôde ser resolvido automaticamente.`);
		}
	}
}
