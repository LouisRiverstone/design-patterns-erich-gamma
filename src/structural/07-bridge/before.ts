// Cenário: Sistema de notificações multiplataforma
// Problema: Hierarquia de classes crescendo exponencialmente

// Abordagem ingênua: hierarquia explosiva

// Base notification types
abstract class Notification {
	abstract send(message: string): void;
}

// Para cada combinação de tipo + plataforma = nova classe
class EmailUrgentNotification extends Notification {
	send(message: string): void {
		console.log(`🚨 EMAIL URGENTE: ${message}`);
		console.log("   - Enviado com alta prioridade");
		console.log("   - Subject: [URGENTE]");
	}
}

class EmailNormalNotification extends Notification {
	send(message: string): void {
		console.log(` Email normal: ${message}`);
	}
}

class SMSUrgentNotification extends Notification {
	send(message: string): void {
		console.log(`🚨 SMS URGENTE: ${message}`);
		console.log("   - Enviado imediatamente");
	}
}

class SMSNormalNotification extends Notification {
	send(message: string): void {
		console.log(` SMS: ${message}`);
	}
}

class PushUrgentNotification extends Notification {
	send(message: string): void {
		console.log(`🔔🚨 PUSH URGENTE: ${message}`);
		console.log("   - Som de alerta");
		console.log("   - Vibração intensa");
	}
}

class PushNormalNotification extends Notification {
	send(message: string): void {
		console.log(`🔔 Push: ${message}`);
	}
}

// Problema: para N tipos × M plataformas = N×M classes!
class NotificationFactory {
	static create(platform: string, type: string): Notification {
		if (platform === "email" && type === "urgent")
			return new EmailUrgentNotification();
		if (platform === "email" && type === "normal")
			return new EmailNormalNotification();
		if (platform === "sms" && type === "urgent")
			return new SMSUrgentNotification();
		if (platform === "sms" && type === "normal")
			return new SMSNormalNotification();
		if (platform === "push" && type === "urgent")
			return new PushUrgentNotification();
		if (platform === "push" && type === "normal")
			return new PushNormalNotification();

		throw new Error(`Combinação não suportada: ${platform}/${type}`);
	}
}

export function demonstrateProblems() {
	console.log("=== ANTES (Problemático) ===");

	// Muitas classes para manter
	const emailUrgent = NotificationFactory.create("email", "urgent");
	const smsNormal = NotificationFactory.create("sms", "normal");
	const pushUrgent = NotificationFactory.create("push", "urgent");

	emailUrgent.send("Sistema fora do ar!");
	smsNormal.send("Sua compra foi aprovada");
	pushUrgent.send("Segurança: login suspeito");

	console.log("Problema: 6 classes para 3 plataformas × 2 tipos");
	console.log("Adicionar nova plataforma = criar N novas classes");
	console.log("Adicionar novo tipo = criar M novas classes");
}
