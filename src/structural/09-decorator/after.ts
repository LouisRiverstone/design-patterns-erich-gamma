//  DEPOIS: Com o padrão Decorator
// Composição dinâmica de funcionalidades

// Interface base do componente
interface NotificationComponent {
	send(): string;
	getCost(): number;
	getChannels(): string[];
}

// Componente concreto (implementação base)
class EmailNotification implements NotificationComponent {
	constructor(private message: string) {}

	send(): string {
		return ` Email: ${this.message}`;
	}

	getCost(): number {
		return 0.01; // $0.01 por email
	}

	getChannels(): string[] {
		return ["email"];
	}
}

// Base Decorator
abstract class NotificationDecorator implements NotificationComponent {
	constructor(protected component: NotificationComponent) {}

	send(): string {
		return this.component.send();
	}

	getCost(): number {
		return this.component.getCost();
	}

	getChannels(): string[] {
		return this.component.getChannels();
	}
}

// Decorators concretos
class SMSDecorator extends NotificationDecorator {
	private phoneNumber: string;

	constructor(
		component: NotificationComponent,
		phoneNumber: string = "+55-11-99999-9999",
	) {
		super(component);
		this.phoneNumber = phoneNumber;
	}

	send(): string {
		return `${this.component.send()}\n SMS para ${this.phoneNumber}: ${this.extractMessage()}`;
	}

	getCost(): number {
		return this.component.getCost() + 0.1; // +$0.10 por SMS
	}

	getChannels(): string[] {
		return [...this.component.getChannels(), "sms"];
	}

	private extractMessage(): string {
		// Extrai mensagem da notificação base
		const baseMessage = this.component.send();
		const match = baseMessage.match(/Email: (.+)/);
		return match ? match[1] : "Nova notificação";
	}
}

class SlackDecorator extends NotificationDecorator {
	private channel: string;

	constructor(component: NotificationComponent, channel: string = "#general") {
		super(component);
		this.channel = channel;
	}

	send(): string {
		return `${this.component.send()}\n Slack ${this.channel}: ${this.extractMessage()}`;
	}

	getCost(): number {
		return this.component.getCost() + 0.05; // +$0.05 por Slack
	}

	getChannels(): string[] {
		return [...this.component.getChannels(), "slack"];
	}

	private extractMessage(): string {
		const baseMessage = this.component.send();
		const match = baseMessage.match(/Email: (.+)/);
		return match ? match[1] : "Nova notificação";
	}
}

class DiscordDecorator extends NotificationDecorator {
	private server: string;

	constructor(
		component: NotificationComponent,
		server: string = "General Server",
	) {
		super(component);
		this.server = server;
	}

	send(): string {
		return `${this.component.send()}\n Discord [${this.server}]: ${this.extractMessage()}`;
	}

	getCost(): number {
		return this.component.getCost() + 0.03; // +$0.03 por Discord
	}

	getChannels(): string[] {
		return [...this.component.getChannels(), "discord"];
	}

	private extractMessage(): string {
		const baseMessage = this.component.send();
		const match = baseMessage.match(/Email: (.+)/);
		return match ? match[1] : "Nova notificação";
	}
}

class WhatsAppDecorator extends NotificationDecorator {
	private number: string;

	constructor(
		component: NotificationComponent,
		number: string = "+55-11-88888-8888",
	) {
		super(component);
		this.number = number;
	}

	send(): string {
		return `${this.component.send()}\n💚 WhatsApp para ${this.number}: ${this.extractMessage()}`;
	}

	getCost(): number {
		return this.component.getCost() + 0.02; // +$0.02 por WhatsApp
	}

	getChannels(): string[] {
		return [...this.component.getChannels(), "whatsapp"];
	}

	private extractMessage(): string {
		const baseMessage = this.component.send();
		const match = baseMessage.match(/Email: (.+)/);
		return match ? match[1] : "Nova notificação";
	}
}

// Decorator para adicionar prioridade
class PriorityDecorator extends NotificationDecorator {
	constructor(
		component: NotificationComponent,
		private priority: "baixa" | "normal" | "alta" | "urgente" = "normal",
	) {
		super(component);
	}

	send(): string {
		const priorityIcon = this.getPriorityIcon();
		return `${priorityIcon} [${this.priority.toUpperCase()}] ${this.component.send()}`;
	}

	getCost(): number {
		const multiplier =
			this.priority === "urgente" ? 2 : this.priority === "alta" ? 1.5 : 1;
		return this.component.getCost() * multiplier;
	}

	getChannels(): string[] {
		return this.component.getChannels();
	}

	private getPriorityIcon(): string {
		switch (this.priority) {
			case "baixa":
				return "🟢";
			case "normal":
				return "🟡";
			case "alta":
				return "🟠";
			case "urgente":
				return "🔴";
			default:
				return "⚪";
		}
	}
}

// Decorator para criptografia
class EncryptionDecorator extends NotificationDecorator {
	constructor(
		component: NotificationComponent,
		private algorithm: "base64" | "aes" = "base64",
	) {
		super(component);
	}

	send(): string {
		const originalMessage = this.component.send();
		const encryptedMessage = this.encrypt(originalMessage);
		return ` [CRIPTOGRAFADO-${this.algorithm.toUpperCase()}] ${encryptedMessage}`;
	}

	getCost(): number {
		return this.component.getCost() + 0.01; // +$0.01 por criptografia
	}

	getChannels(): string[] {
		return this.component.getChannels();
	}

	private encrypt(message: string): string {
		if (this.algorithm === "base64") {
			return Buffer.from(message).toString("base64").substring(0, 20) + "...";
		}
		// Simulação de AES
		return (
			"aes-" + message.length + "-" + Math.random().toString(36).substring(2, 8)
		);
	}
}

// Factory para criar notificações decoradas
export class NotificationFactory {
	static createBasic(message: string): NotificationComponent {
		return new EmailNotification(message);
	}

	static createMultiChannel(
		message: string,
		channels: ("sms" | "slack" | "discord" | "whatsapp")[],
		options: {
			priority?: "baixa" | "normal" | "alta" | "urgente";
			encrypt?: boolean;
			phoneNumber?: string;
			slackChannel?: string;
			discordServer?: string;
			whatsappNumber?: string;
		} = {},
	): NotificationComponent {
		let notification: NotificationComponent = new EmailNotification(message);

		// Adiciona decorators de canal
		channels.forEach((channel) => {
			switch (channel) {
				case "sms":
					notification = new SMSDecorator(notification, options.phoneNumber);
					break;
				case "slack":
					notification = new SlackDecorator(notification, options.slackChannel);
					break;
				case "discord":
					notification = new DiscordDecorator(
						notification,
						options.discordServer,
					);
					break;
				case "whatsapp":
					notification = new WhatsAppDecorator(
						notification,
						options.whatsappNumber,
					);
					break;
			}
		});

		// Adiciona prioridade se especificada
		if (options.priority && options.priority !== "normal") {
			notification = new PriorityDecorator(notification, options.priority);
		}

		// Adiciona criptografia se solicitada
		if (options.encrypt) {
			notification = new EncryptionDecorator(notification);
		}

		return notification;
	}
}

// Sistema de gerenciamento de notificações
export class NotificationManager {
	private notifications: Map<string, NotificationComponent> = new Map();

	addNotification(id: string, notification: NotificationComponent): void {
		this.notifications.set(id, notification);
	}

	sendNotification(id: string): string | null {
		const notification = this.notifications.get(id);
		if (!notification) {
			return null;
		}

		const result = notification.send();
		console.log(` Custo total: $${notification.getCost().toFixed(3)}`);
		console.log(`📡 Canais: ${notification.getChannels().join(", ")}`);

		return result;
	}

	sendAll(): void {
		console.log("📨 Enviando todas as notificações:");
		let totalCost = 0;
		const allChannels = new Set<string>();

		this.notifications.forEach((notification, id) => {
			console.log(`\n--- ${id} ---`);
			console.log(notification.send());
			totalCost += notification.getCost();
			notification.getChannels().forEach((channel) => allChannels.add(channel));
		});

		console.log(`\n Custo total: $${totalCost.toFixed(3)}`);
		console.log(` Canais utilizados: ${Array.from(allChannels).join(", ")}`);
	}

	getStatistics(): {
		total: number;
		totalCost: number;
		channelUsage: Record<string, number>;
	} {
		let totalCost = 0;
		const channelUsage: Record<string, number> = {};

		this.notifications.forEach((notification) => {
			totalCost += notification.getCost();
			notification.getChannels().forEach((channel) => {
				channelUsage[channel] = (channelUsage[channel] || 0) + 1;
			});
		});

		return {
			total: this.notifications.size,
			totalCost,
			channelUsage,
		};
	}

	clear(): void {
		this.notifications.clear();
	}
}

export function demonstrateSolution() {
	console.log(" DEPOIS (Solução Decorator): Composição flexível");
	console.log("");

	const manager = new NotificationManager();

	// 1. Notificação básica
	const basic = NotificationFactory.createBasic("Bem-vindo ao sistema!");
	manager.addNotification("welcome", basic);

	// 2. Notificação multi-canal
	const multiChannel = NotificationFactory.createMultiChannel(
		"Seu pedido foi confirmado!",
		["sms", "slack"],
		{ phoneNumber: "+55-11-99999-1234", slackChannel: "#orders" },
	);
	manager.addNotification("order-confirmed", multiChannel);

	// 3. Notificação prioritária e criptografada
	const secure = NotificationFactory.createMultiChannel(
		"Acesso suspeito detectado!",
		["sms", "discord", "whatsapp"],
		{
			priority: "urgente",
			encrypt: true,
			discordServer: "Security Team",
			whatsappNumber: "+55-11-88888-5678",
		},
	);
	manager.addNotification("security-alert", secure);

	// 4. Composição manual (máxima flexibilidade)
	let customNotification: NotificationComponent = new EmailNotification(
		"Deploy realizado com sucesso!",
	);
	customNotification = new SlackDecorator(customNotification, "#devops");
	customNotification = new DiscordDecorator(
		customNotification,
		"Development Team",
	);
	customNotification = new PriorityDecorator(customNotification, "alta");
	manager.addNotification("deploy-success", customNotification);

	// Enviar todas
	manager.sendAll();

	// Estatísticas
	console.log("\n Estatísticas:");
	const stats = manager.getStatistics();
	console.log(`Total de notificações: ${stats.total}`);
	console.log(`Custo total: $${stats.totalCost.toFixed(3)}`);
	console.log("Uso por canal:", stats.channelUsage);

	console.log("\n Vantagens do Decorator:");
	console.log("- Composição dinâmica em runtime");
	console.log("- Não há explosão de classes");
	console.log("- Flexibilidade total de combinações");
	console.log("- Fácil adição de novos decorators");
	console.log("- Respeita o princípio Aberto/Fechado");
}

export {
	type NotificationComponent,
	EmailNotification,
	NotificationDecorator,
	SMSDecorator,
	SlackDecorator,
	DiscordDecorator,
	WhatsAppDecorator,
	PriorityDecorator,
	EncryptionDecorator,
};
