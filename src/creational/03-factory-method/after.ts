// Solução: Factory Method para delegar criação de objetos
// Benefício: Extensibilidade, encapsulamento e polimorfismo

interface Notification {
	title: string;
	message: string;
	recipient: string;
	send(): boolean;
	getStatus(): string;
	validate(): boolean;
}

//  Implementações concretas com validação específica
class EmailNotification implements Notification {
	constructor(
		public title: string,
		public message: string,
		public recipient: string,
	) {}

	send(): boolean {
		if (!this.validate()) {
			console.log("Email inválido:", this.recipient);
			return false;
		}

		console.log(` Enviando email para ${this.recipient}`);
		console.log(`Assunto: ${this.title}`);
		return Math.random() > 0.1;
	}

	validate(): boolean {
		return this.recipient.includes("@") && this.recipient.includes(".");
	}

	getStatus(): string {
		return "Email enviado via SMTP";
	}
}

class SMSNotification implements Notification {
	constructor(
		public title: string,
		public message: string,
		public recipient: string,
	) {}

	send(): boolean {
		if (!this.validate()) {
			console.log("Número inválido:", this.recipient);
			return false;
		}

		console.log(` Enviando SMS para ${this.recipient}`);
		console.log(`${this.title}: ${this.message}`);
		return Math.random() > 0.2;
	}

	validate(): boolean {
		return /^\d{10,15}$/.test(this.recipient.replace(/\D/g, ""));
	}

	getStatus(): string {
		return "SMS enviado via gateway";
	}
}

class PushNotification implements Notification {
	constructor(
		public title: string,
		public message: string,
		public recipient: string,
	) {}

	send(): boolean {
		if (!this.validate()) {
			console.log("Token inválido:", this.recipient);
			return false;
		}

		console.log(`🔔 Enviando push para dispositivo`);
		console.log(`${this.title}: ${this.message}`);
		return Math.random() > 0.05;
	}

	validate(): boolean {
		return this.recipient.length > 10 && !this.recipient.includes(" ");
	}

	getStatus(): string {
		return "Push enviado via FCM";
	}
}

//  Classe abstrata define o Factory Method
abstract class NotificationCreator {
	//  Factory Method - subclasses implementam
	abstract createNotification(
		title: string,
		message: string,
		recipient: string,
	): Notification;

	//  Lógica comum que usa o Factory Method
	sendNotification(title: string, message: string, recipient: string): boolean {
		const notification = this.createNotification(title, message, recipient);
		return notification.send();
	}

	sendBulkNotifications(
		title: string,
		message: string,
		recipients: string[],
	): { sent: number; failed: number; details: string[] } {
		let sent = 0;
		let failed = 0;
		const details: string[] = [];

		for (const recipient of recipients) {
			const notification = this.createNotification(title, message, recipient);

			if (notification.send()) {
				sent++;
				details.push(` ${recipient}: ${notification.getStatus()}`);
			} else {
				failed++;
				details.push(`${recipient}: Falha no envio`);
			}
		}

		return { sent, failed, details };
	}

	//  Validação delegada para cada tipo específico
	validateRecipient(recipient: string): boolean {
		const testNotification = this.createNotification("test", "test", recipient);
		return testNotification.validate();
	}
}

//  Factory concreto para Email
export class EmailNotificationCreator extends NotificationCreator {
	createNotification(
		title: string,
		message: string,
		recipient: string,
	): Notification {
		return new EmailNotification(title, message, recipient);
	}

	//  Método específico para emails
	sendWithAttachment(
		title: string,
		message: string,
		recipient: string,
		attachments: string[],
	): boolean {
		console.log(`📎 Anexos: ${attachments.join(", ")}`);
		return this.sendNotification(title, message, recipient);
	}
}

//  Factory concreto para SMS
export class SMSNotificationCreator extends NotificationCreator {
	createNotification(
		title: string,
		message: string,
		recipient: string,
	): Notification {
		return new SMSNotification(title, message, recipient);
	}

	//  Método específico para SMS
	sendShortCode(recipient: string, code: string): boolean {
		const message = `Seu código de verificação: ${code}`;
		return this.sendNotification("Código", message, recipient);
	}
}

//  Factory concreto para Push
export class PushNotificationCreator extends NotificationCreator {
	createNotification(
		title: string,
		message: string,
		recipient: string,
	): Notification {
		return new PushNotification(title, message, recipient);
	}

	//  Método específico para push
	sendSilentNotification(
		recipient: string,
		data: Record<string, any>,
	): boolean {
		const message = `Data: ${JSON.stringify(data)}`;
		return this.sendNotification("", message, recipient);
	}
}

//  Cliente usa apenas as interfaces, não conhece implementações
export class NotificationService {
	private creators = new Map<string, NotificationCreator>();

	constructor() {
		//  Registro dos creators disponíveis
		this.registerCreator("email", new EmailNotificationCreator());
		this.registerCreator("sms", new SMSNotificationCreator());
		this.registerCreator("push", new PushNotificationCreator());
	}

	//  Extensibilidade: fácil adicionar novos tipos
	registerCreator(type: string, creator: NotificationCreator): void {
		this.creators.set(type.toLowerCase(), creator);
	}

	getAvailableTypes(): string[] {
		return Array.from(this.creators.keys());
	}

	sendNotification(
		type: string,
		title: string,
		message: string,
		recipient: string,
	): boolean {
		const creator = this.creators.get(type.toLowerCase());

		if (!creator) {
			console.log(`Tipo não suportado: ${type}`);
			console.log(`Tipos disponíveis: ${this.getAvailableTypes().join(", ")}`);
			return false;
		}

		return creator.sendNotification(title, message, recipient);
	}

	//  Envio em lote com relatório detalhado
	sendBulkNotifications(
		type: string,
		title: string,
		message: string,
		recipients: string[],
	) {
		const creator = this.creators.get(type.toLowerCase());

		if (!creator) {
			return {
				sent: 0,
				failed: recipients.length,
				details: [`Tipo ${type} não suportado`],
			};
		}

		return creator.sendBulkNotifications(title, message, recipients);
	}
}

//  Demonstração da solução
export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Factory Method) ===");

	const service = new NotificationService();

	console.log(" Tipos disponíveis:", service.getAvailableTypes());

	//  Uso simples e extensível
	service.sendNotification(
		"email",
		"Bem-vindo!",
		"Conta criada com sucesso!",
		"user@example.com",
	);
	service.sendNotification("sms", "Código", "Seu código: 1234", "11999999999");
	service.sendNotification(
		"push",
		"Oferta",
		"50% de desconto hoje!",
		"fcm-token-device-123",
	);

	//  Tipo inexistente é tratado graciosamente
	service.sendNotification("whatsapp", "Teste", "Mensagem", "11999999999");

	//  Envio em lote com relatório
	const bulkResult = service.sendBulkNotifications(
		"email",
		"Newsletter",
		"Novidades desta semana!",
		["user1@test.com", "invalid-email", "user2@test.com"],
	);

	console.log(
		` Relatório: ${bulkResult.sent} enviados, ${bulkResult.failed} falharam`,
	);
	bulkResult.details.forEach((detail) => console.log(detail));

	//  Uso direto dos creators específicos
	const emailCreator = new EmailNotificationCreator();
	emailCreator.sendWithAttachment(
		"Contrato",
		"Segue contrato em anexo",
		"client@company.com",
		["contrato.pdf", "termos.pdf"],
	);

	const smsCreator = new SMSNotificationCreator();
	smsCreator.sendShortCode("11999999999", "7890");
}
