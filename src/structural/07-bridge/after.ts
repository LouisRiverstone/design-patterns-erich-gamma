// Solução: Bridge Pattern separa abstração da implementação
// Benefício: Hierarquias independentes, fácil extensão

//  Implementação (Bridge) - Como enviar
interface NotificationSender {
	sendMessage(message: string, metadata: Record<string, any>): void;
	getPlatformName(): string;
}

//  Implementações concretas
export class EmailSender implements NotificationSender {
	sendMessage(message: string, metadata: Record<string, any>): void {
		console.log(` Enviando email: ${message}`);
		if (metadata.priority === "high") {
			console.log("   - Subject: [URGENTE] " + metadata.subject);
			console.log("   - Prioridade alta configurada");
		}
		if (metadata.attachments) {
			console.log(`   - Anexos: ${metadata.attachments.join(", ")}`);
		}
	}

	getPlatformName(): string {
		return "Email";
	}
}

export class SMSSender implements NotificationSender {
	sendMessage(message: string, metadata: Record<string, any>): void {
		console.log(` Enviando SMS: ${message}`);
		if (metadata.priority === "high") {
			console.log("   - Enviado imediatamente");
		}
		if (metadata.shortUrl) {
			console.log(`   - Link: ${metadata.shortUrl}`);
		}
	}

	getPlatformName(): string {
		return "SMS";
	}
}

export class PushSender implements NotificationSender {
	sendMessage(message: string, metadata: Record<string, any>): void {
		console.log(`🔔 Enviando push: ${message}`);
		if (metadata.priority === "high") {
			console.log("   - Som de alerta ativado");
			console.log("   - Vibração intensa");
		}
		if (metadata.icon) {
			console.log(`   - Ícone: ${metadata.icon}`);
		}
	}

	getPlatformName(): string {
		return "Push Notification";
	}
}

//  Abstração - O que enviar
export abstract class Notification {
	protected sender: NotificationSender;

	constructor(sender: NotificationSender) {
		this.sender = sender;
	}

	//  Método template que usa a implementação
	abstract send(message: string): void;

	//  Pode ser redefinido por subclasses
	protected prepareMetadata(): Record<string, any> {
		return {};
	}

	//  Funcionalidade comum
	getSenderInfo(): string {
		return this.sender.getPlatformName();
	}
}

//  Abstrações refinadas
export class UrgentNotification extends Notification {
	send(message: string): void {
		const metadata = {
			...this.prepareMetadata(),
			priority: "high",
			timestamp: new Date().toISOString(),
		};

		console.log(`🚨 URGENTE via ${this.getSenderInfo()}:`);
		this.sender.sendMessage(message, metadata);
	}

	protected prepareMetadata(): Record<string, any> {
		return {
			subject: "AÇÃO IMEDIATA NECESSÁRIA",
			icon: "warning",
			sound: "urgent_alert",
		};
	}
}

export class NormalNotification extends Notification {
	send(message: string): void {
		const metadata = {
			...this.prepareMetadata(),
			priority: "normal",
			timestamp: new Date().toISOString(),
		};

		console.log(`📢 Normal via ${this.getSenderInfo()}:`);
		this.sender.sendMessage(message, metadata);
	}

	protected prepareMetadata(): Record<string, any> {
		return {
			subject: "Informação",
			icon: "info",
			sound: "default",
		};
	}
}

export class MarketingNotification extends Notification {
	send(message: string): void {
		const metadata = {
			...this.prepareMetadata(),
			priority: "low",
			timestamp: new Date().toISOString(),
			campaign: "promotional",
		};

		console.log(` Marketing via ${this.getSenderInfo()}:`);
		this.sender.sendMessage(message, metadata);
	}

	protected prepareMetadata(): Record<string, any> {
		return {
			subject: "Oferta Especial",
			icon: "star",
			attachments: ["catalog.pdf"],
			shortUrl: "bit.ly/offer123",
		};
	}
}

//  Factory simplificado
export class NotificationFactory {
	static create(senderType: string, notificationType: string): Notification {
		const sender = this.createSender(senderType);
		return this.createNotification(notificationType, sender);
	}

	private static createSender(type: string): NotificationSender {
		switch (type) {
			case "email":
				return new EmailSender();
			case "sms":
				return new SMSSender();
			case "push":
				return new PushSender();
			default:
				throw new Error(`Sender não suportado: ${type}`);
		}
	}

	private static createNotification(
		type: string,
		sender: NotificationSender,
	): Notification {
		switch (type) {
			case "urgent":
				return new UrgentNotification(sender);
			case "normal":
				return new NormalNotification(sender);
			case "marketing":
				return new MarketingNotification(sender);
			default:
				throw new Error(`Tipo não suportado: ${type}`);
		}
	}

	static getAvailableSenders(): string[] {
		return ["email", "sms", "push"];
	}

	static getAvailableTypes(): string[] {
		return ["urgent", "normal", "marketing"];
	}
}

//  Sistema de notificação usando Bridge
export class NotificationSystem {
	private templates = new Map<string, string>();

	constructor() {
		this.setupTemplates();
	}

	private setupTemplates(): void {
		this.templates.set(
			"order_confirmed",
			"Seu pedido #{orderId} foi confirmado!",
		);
		this.templates.set(
			"payment_failed",
			"Falha no pagamento do pedido #{orderId}",
		);
		this.templates.set(
			"promotion",
			"Oferta especial: {discount}% de desconto!",
		);
		this.templates.set("security_alert", "Login detectado de novo dispositivo");
	}

	sendNotification(
		senderType: string,
		notificationType: string,
		template: string,
		variables: Record<string, any> = {},
	): void {
		try {
			const notification = NotificationFactory.create(
				senderType,
				notificationType,
			);
			const message = this.renderTemplate(template, variables);

			notification.send(message);
		} catch (error) {
			console.log(`Erro ao enviar notificação: ${error}`);
		}
	}

	private renderTemplate(
		template: string,
		variables: Record<string, any>,
	): string {
		let message = this.templates.get(template) || template;

		for (const [key, value] of Object.entries(variables)) {
			message = message.replace(`{${key}}`, String(value));
		}

		return message;
	}

	//  Envio em lote para múltiplas plataformas
	broadcastNotification(
		notificationType: string,
		template: string,
		variables: Record<string, any> = {},
		platforms: string[] = ["email", "sms", "push"],
	): void {
		console.log(`📡 Broadcast: ${template}`);

		platforms.forEach((platform) => {
			this.sendNotification(platform, notificationType, template, variables);
		});
	}
}

export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Bridge) ===");

	const system = new NotificationSystem();

	console.log(
		" Senders disponíveis:",
		NotificationFactory.getAvailableSenders(),
	);
	console.log(" Tipos disponíveis:", NotificationFactory.getAvailableTypes());

	//  Diferentes combinações sem explosão de classes
	console.log("\n1. Notificações urgentes:");
	system.sendNotification("email", "urgent", "security_alert");
	system.sendNotification("sms", "urgent", "payment_failed", {
		orderId: "ORD-123",
	});

	console.log("\n2. Notificações normais:");
	system.sendNotification("push", "normal", "order_confirmed", {
		orderId: "ORD-456",
	});

	console.log("\n3. Marketing:");
	system.sendNotification("email", "marketing", "promotion", { discount: 25 });

	console.log("\n4. Broadcast:");
	system.broadcastNotification("urgent", "Sistema em manutenção às 2h", {}, [
		"email",
		"sms",
	]);

	console.log("\n Benefícios: 3 abstrações + 3 implementações = 6 classes");
	console.log(" Nova plataforma = +1 classe, novo tipo = +1 classe");
}
