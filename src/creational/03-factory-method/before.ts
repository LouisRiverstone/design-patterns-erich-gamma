// Cenário: Sistema de notificações multicanal
// Problema: Criação manual de diferentes tipos de notificação

interface Notification {
	title: string;
	message: string;
	recipient: string;
	send(): boolean;
	getStatus(): string;
}

// Abordagem ingênua: cliente cria instâncias diretamente
class EmailNotification implements Notification {
	constructor(
		public title: string,
		public message: string,
		public recipient: string,
	) {}

	send(): boolean {
		console.log(` Enviando email para ${this.recipient}`);
		console.log(`Assunto: ${this.title}`);
		console.log(`Corpo: ${this.message}`);
		// Simula envio de email
		return Math.random() > 0.1; // 90% sucesso
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
		console.log(` Enviando SMS para ${this.recipient}`);
		console.log(`${this.title}: ${this.message}`);
		// Simula envio de SMS
		return Math.random() > 0.2; // 80% sucesso
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
		console.log(`🔔 Enviando push para ${this.recipient}`);
		console.log(`${this.title}: ${this.message}`);
		// Simula envio de push
		return Math.random() > 0.05; // 95% sucesso
	}

	getStatus(): string {
		return "Push enviado via FCM";
	}
}

// Problemático: cliente conhece todas as classes concretas
class NotificationService {
	sendNotification(
		type: string,
		title: string,
		message: string,
		recipient: string,
	): boolean {
		let notification: Notification;

		// Switch/if extenso, viola princípio aberto/fechado
		switch (type.toLowerCase()) {
			case "email":
				notification = new EmailNotification(title, message, recipient);
				break;
			case "sms":
				notification = new SMSNotification(title, message, recipient);
				break;
			case "push":
				notification = new PushNotification(title, message, recipient);
				break;
			default:
				throw new Error(`Tipo de notificação não suportado: ${type}`);
		}

		return notification.send();
	}

	// Cada novo tipo de notificação requer modificação aqui
	sendBulkNotifications(
		type: string,
		title: string,
		message: string,
		recipients: string[],
	): number {
		let successCount = 0;

		for (const recipient of recipients) {
			// Repetição da lógica de criação
			if (this.sendNotification(type, title, message, recipient)) {
				successCount++;
			}
		}

		return successCount;
	}

	// Lógica de validação espalhada
	validateRecipient(type: string, recipient: string): boolean {
		switch (type.toLowerCase()) {
			case "email":
				return recipient.includes("@");
			case "sms":
				return /^\d{10,}$/.test(recipient);
			case "push":
				return recipient.length > 10; // Device token
			default:
				return false;
		}
	}
}

// Demonstração dos problemas
export function demonstrateProblems() {
	const service = new NotificationService();

	console.log("=== ANTES (Problemático) ===");

	// Cliente precisa saber strings exatas dos tipos
	service.sendNotification(
		"email",
		"Bem-vindo!",
		"Olá, seja bem-vindo!",
		"user@example.com",
	);
	service.sendNotification("sms", "Código", "Seu código: 1234", "11999999999");
	service.sendNotification(
		"push",
		"Oferta",
		"50% de desconto!",
		"device-token-123",
	);

	// Fácil errar o tipo
	try {
		service.sendNotification("whatsapp", "Teste", "Mensagem", "11999999999");
	} catch (error) {
		console.log("Erro:", (error as Error).message);
	}

	// Validação desacoplada da criação
	console.log(
		" Email válido:",
		service.validateRecipient("email", "test@test.com"),
	);
	console.log("SMS inválido:", service.validateRecipient("sms", "abc"));

	console.log(
		"Problemas: acoplamento forte, difícil extensão, repetição de código",
	);
}
