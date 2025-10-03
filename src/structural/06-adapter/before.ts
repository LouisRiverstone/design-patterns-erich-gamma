// Cenário: Sistema de pagamentos que precisa integrar diferentes provedores
// Problema: Interfaces incompatíveis entre sistemas de pagamento

// Interface esperada pelo nosso sistema
interface PaymentProcessor {
	processPayment(amount: number, currency: string): PaymentResult;
	validateCard(cardNumber: string): boolean;
	refundPayment(transactionId: string): RefundResult;
}

interface PaymentResult {
	success: boolean;
	transactionId: string;
	message: string;
	timestamp: Date;
}

interface RefundResult {
	success: boolean;
	refundId: string;
	message: string;
	timestamp: Date;
}

// Sistema legado com interface incompatível
class LegacyPaymentGateway {
	// Métodos com nomes e parâmetros diferentes
	makePayment(value: number, curr: string, cardInfo: string): any {
		console.log(` Legacy: Processando pagamento de ${value} ${curr}`);
		return {
			status: "approved",
			id: `legacy_${Date.now()}`,
			date: new Date().toISOString(),
			message: "Pagamento aprovado pelo sistema legado",
		};
	}

	checkCard(card: string): string {
		// Retorna string ao invés de boolean
		return card.length >= 13 ? "valid" : "invalid";
	}

	reverseTransaction(txId: string): any {
		console.log(` Legacy: Estornando transação ${txId}`);
		return {
			status: "refunded",
			refund_ref: `ref_${Date.now()}`,
			date: new Date().toISOString(),
		};
	}
}

// API externa com estrutura diferente
class ExternalPaymentAPI {
	// Interface completamente diferente
	async submitPayment(paymentData: {
		amount: number;
		currency: string;
		card: string;
	}): Promise<any> {
		console.log(` External API: Enviando pagamento`, paymentData);
		return {
			result: "success",
			transaction_ref: `ext_${Math.random().toString(36)}`,
			processed_at: Date.now(),
			response_message: "Payment processed successfully",
		};
	}

	async validateCardNumber(cardNum: string): Promise<any> {
		return {
			is_valid: cardNum.length >= 13 && cardNum.length <= 19,
			card_type: "credit",
		};
	}

	async processRefund(transactionRef: string): Promise<any> {
		console.log(` External API: Processando estorno ${transactionRef}`);
		return {
			result: "refunded",
			refund_reference: `refund_${Math.random().toString(36)}`,
			processed_at: Date.now(),
		};
	}
}

// Cliente forçado a conhecer diferentes interfaces
class PaymentService {
	processLegacyPayment(
		amount: number,
		currency: string,
		cardNumber: string,
	): any {
		const legacyGateway = new LegacyPaymentGateway();

		// Precisa adaptar manualmente
		const result = legacyGateway.makePayment(amount, currency, cardNumber);

		// Conversão manual da resposta
		return {
			success: result.status === "approved",
			transactionId: result.id,
			message: result.message,
			timestamp: new Date(result.date),
		};
	}

	async processExternalPayment(
		amount: number,
		currency: string,
		cardNumber: string,
	): Promise<any> {
		const externalAPI = new ExternalPaymentAPI();

		// Validação manual da estrutura
		const cardValidation = await externalAPI.validateCardNumber(cardNumber);
		if (!cardValidation.is_valid) {
			return {
				success: false,
				transactionId: "",
				message: "Cartão inválido",
				timestamp: new Date(),
			};
		}

		// Conversão manual dos parâmetros
		const result = await externalAPI.submitPayment({
			amount,
			currency,
			card: cardNumber,
		});

		// Conversão manual da resposta
		return {
			success: result.result === "success",
			transactionId: result.transaction_ref,
			message: result.response_message,
			timestamp: new Date(result.processed_at),
		};
	}

	// Diferentes métodos para diferentes sistemas
	validateLegacyCard(cardNumber: string): boolean {
		const legacyGateway = new LegacyPaymentGateway();
		return legacyGateway.checkCard(cardNumber) === "valid";
	}

	async validateExternalCard(cardNumber: string): Promise<boolean> {
		const externalAPI = new ExternalPaymentAPI();
		const result = await externalAPI.validateCardNumber(cardNumber);
		return result.is_valid;
	}
}

// Uso complexo e inconsistente
class ECommerceSystem {
	private paymentService = new PaymentService();

	async processOrder(
		orderId: string,
		amount: number,
		cardNumber: string,
		paymentMethod: string,
	): Promise<void> {
		console.log(`🛒 Processando pedido ${orderId} - R$${amount}`);

		try {
			let result: any;

			// Switch complexo para diferentes sistemas
			switch (paymentMethod) {
				case "legacy":
					// Diferente para cada sistema
					if (!this.paymentService.validateLegacyCard(cardNumber)) {
						console.log("Cartão inválido (sistema legado)");
						return;
					}
					result = this.paymentService.processLegacyPayment(
						amount,
						"BRL",
						cardNumber,
					);
					break;

				case "external":
					if (!(await this.paymentService.validateExternalCard(cardNumber))) {
						console.log("Cartão inválido (API externa)");
						return;
					}
					result = await this.paymentService.processExternalPayment(
						amount,
						"BRL",
						cardNumber,
					);
					break;

				default:
					console.log("Método de pagamento não suportado");
					return;
			}

			if (result.success) {
				console.log(` Pagamento aprovado: ${result.transactionId}`);
			} else {
				console.log(`Pagamento falhou: ${result.message}`);
			}
		} catch (error) {
			console.log("Erro no processamento:", error);
		}
	}
}

// Demonstração dos problemas
export function demonstrateProblems() {
	console.log("=== ANTES (Problemático) ===");

	const ecommerce = new ECommerceSystem();

	// Diferentes interfaces para diferentes sistemas
	console.log("\n1. Pagamento via sistema legado:");
	ecommerce.processOrder("ORDER-001", 299.9, "4111111111111111", "legacy");

	console.log("\n2. Pagamento via API externa:");
	ecommerce.processOrder("ORDER-002", 199.5, "5555555555554444", "external");

	console.log("\n3. Tentativa com método não suportado:");
	ecommerce.processOrder("ORDER-003", 99.9, "4111111111111111", "paypal");

	console.log(
		"\nProblemas: código duplicado, interfaces inconsistentes, difícil manutenção",
	);
}
