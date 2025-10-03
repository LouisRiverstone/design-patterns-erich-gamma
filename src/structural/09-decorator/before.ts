// ANTES: Sem o padrão Decorator
// Extensão por herança leva à explosão de classes

// Sistema de notificações sem Decorator
class BasicNotification {
	protected message: string;

	constructor(message: string) {
		this.message = message;
	}

	send(): string {
		return ` ${this.message}`;
	}
}

// Extensões por herança - PROBLEMÁTICO!
class EmailWithSMSNotification extends BasicNotification {
	send(): string {
		return ` ${super.send()}\n SMS: ${this.message}`;
	}
}

class EmailWithSlackNotification extends BasicNotification {
	send(): string {
		return ` ${super.send()}\n Slack: ${this.message}`;
	}
}

class EmailWithSMSAndSlackNotification extends BasicNotification {
	send(): string {
		return ` ${super.send()}\n SMS: ${this.message}\n Slack: ${this.message}`;
	}
}

// E se quisermos mais combinações? Discord, Teams, WhatsApp?
// Precisaríamos de 2^n classes para n tipos de notificação!

export function demonstrateProblems() {
	console.log("🚨 ANTES (Problemático): Sem padrão Decorator");
	console.log("");

	// Cada combinação precisa de uma classe específica
	const basic = new BasicNotification("Nova mensagem!");
	const emailSms = new EmailWithSMSNotification("Nova mensagem!");
	const emailSlack = new EmailWithSlackNotification("Nova mensagem!");
	const all = new EmailWithSMSAndSlackNotification("Nova mensagem!");

	console.log("Básica:", basic.send());
	console.log("Email + SMS:", emailSms.send());
	console.log("Email + Slack:", emailSlack.send());
	console.log("Todas:", all.send());

	console.log("");
	console.log("Problemas:");
	console.log("- Explosão de classes (2^n combinações)");
	console.log("- Código duplicado");
	console.log("- Difícil manutenção");
	console.log("- Violação do princípio DRY");
	console.log("- Não flexível em runtime");
}
