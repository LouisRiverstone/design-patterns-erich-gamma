// Solução: Adapter Pattern para compatibilizar interfaces incompatíveis
// Benefício: Interface única, código reutilizável, fácil adição de novos provedores

//  Interface padrão do sistema
interface PaymentProcessor {
	processPayment(
		amount: number,
		currency: string,
		cardNumber: string,
	): Promise<PaymentResult>;
	validateCard(cardNumber: string): Promise<boolean>;
	refundPayment(transactionId: string): Promise<RefundResult>;
	getProviderName(): string;
}

interface PaymentResult {
	success: boolean;
	transactionId: string;
	message: string;
	timestamp: Date;
	providerResponse?: any;
}

interface RefundResult {
	success: boolean;
	refundId: string;
	message: string;
	timestamp: Date;
	originalTransactionId: string;
}

//  Sistema legado mantido sem modificações
class LegacyPaymentGateway {
	makePayment(value: number, curr: string, cardInfo: string): any {
		console.log(` Legacy: Processando pagamento de ${value} ${curr}`);
		return {
			status: Math.random() > 0.1 ? "approved" : "declined",
			id: `legacy_${Date.now()}`,
			date: new Date().toISOString(),
			message: "Pagamento processado pelo sistema legado",
		};
	}

	checkCard(card: string): string {
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

//  API externa mantida sem modificações
class ExternalPaymentAPI {
	async submitPayment(paymentData: {
		amount: number;
		currency: string;
		card: string;
	}): Promise<any> {
		console.log(` External API: Enviando pagamento`, paymentData);

		// Simula delay de rede
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			result: Math.random() > 0.05 ? "success" : "failure",
			transaction_ref: `ext_${Math.random().toString(36).substring(2)}`,
			processed_at: Date.now(),
			response_message: "Payment processed by external provider",
		};
	}

	async validateCardNumber(cardNum: string): Promise<any> {
		await new Promise((resolve) => setTimeout(resolve, 50));
		return {
			is_valid:
				cardNum.length >= 13 && cardNum.length <= 19 && /^\d+$/.test(cardNum),
			card_type: cardNum.startsWith("4") ? "visa" : "mastercard",
		};
	}

	async processRefund(transactionRef: string): Promise<any> {
		console.log(` External API: Processando estorno ${transactionRef}`);
		await new Promise((resolve) => setTimeout(resolve, 150));

		return {
			result: "refunded",
			refund_reference: `refund_${Math.random().toString(36).substring(2)}`,
			processed_at: Date.now(),
		};
	}
}

//  Adapter para sistema legado
export class LegacyPaymentAdapter implements PaymentProcessor {
	private legacyGateway: LegacyPaymentGateway;

	constructor() {
		this.legacyGateway = new LegacyPaymentGateway();
	}

	async processPayment(
		amount: number,
		currency: string,
		cardNumber: string,
	): Promise<PaymentResult> {
		try {
			//  Converte para formato esperado pelo sistema legado
			const legacyResult = this.legacyGateway.makePayment(
				amount,
				currency,
				cardNumber,
			);

			//  Converte resposta para interface padrão
			return {
				success: legacyResult.status === "approved",
				transactionId: legacyResult.id,
				message: legacyResult.message,
				timestamp: new Date(legacyResult.date),
				providerResponse: legacyResult,
			};
		} catch (error) {
			return {
				success: false,
				transactionId: "",
				message: `Erro no sistema legado: ${error}`,
				timestamp: new Date(),
			};
		}
	}

	async validateCard(cardNumber: string): Promise<boolean> {
		try {
			const result = this.legacyGateway.checkCard(cardNumber);
			return result === "valid";
		} catch (error) {
			console.log("Erro na validação legacy:", error);
			return false;
		}
	}

	async refundPayment(transactionId: string): Promise<RefundResult> {
		try {
			const refundResult = this.legacyGateway.reverseTransaction(transactionId);

			return {
				success: refundResult.status === "refunded",
				refundId: refundResult.refund_ref,
				message: "Estorno processado pelo sistema legado",
				timestamp: new Date(refundResult.date),
				originalTransactionId: transactionId,
			};
		} catch (error) {
			return {
				success: false,
				refundId: "",
				message: `Erro no estorno: ${error}`,
				timestamp: new Date(),
				originalTransactionId: transactionId,
			};
		}
	}

	getProviderName(): string {
		return "Legacy Payment Gateway";
	}
}

//  Adapter para API externa
export class ExternalPaymentAdapter implements PaymentProcessor {
	private externalAPI: ExternalPaymentAPI;

	constructor() {
		this.externalAPI = new ExternalPaymentAPI();
	}

	async processPayment(
		amount: number,
		currency: string,
		cardNumber: string,
	): Promise<PaymentResult> {
		try {
			//  Converte para formato da API externa
			const paymentData = {
				amount,
				currency,
				card: cardNumber,
			};

			const externalResult = await this.externalAPI.submitPayment(paymentData);

			//  Converte resposta para interface padrão
			return {
				success: externalResult.result === "success",
				transactionId: externalResult.transaction_ref,
				message: externalResult.response_message,
				timestamp: new Date(externalResult.processed_at),
				providerResponse: externalResult,
			};
		} catch (error) {
			return {
				success: false,
				transactionId: "",
				message: `Erro na API externa: ${error}`,
				timestamp: new Date(),
			};
		}
	}

	async validateCard(cardNumber: string): Promise<boolean> {
		try {
			const validationResult =
				await this.externalAPI.validateCardNumber(cardNumber);
			return validationResult.is_valid;
		} catch (error) {
			console.log("Erro na validação externa:", error);
			return false;
		}
	}

	async refundPayment(transactionId: string): Promise<RefundResult> {
		try {
			const refundResult = await this.externalAPI.processRefund(transactionId);

			return {
				success: refundResult.result === "refunded",
				refundId: refundResult.refund_reference,
				message: "Estorno processado pela API externa",
				timestamp: new Date(refundResult.processed_at),
				originalTransactionId: transactionId,
			};
		} catch (error) {
			return {
				success: false,
				refundId: "",
				message: `Erro no estorno: ${error}`,
				timestamp: new Date(),
				originalTransactionId: transactionId,
			};
		}
	}

	getProviderName(): string {
		return "External Payment API";
	}
}

//  Factory para diferentes adapters
export class PaymentAdapterFactory {
	private static adapters = new Map<string, () => PaymentProcessor>();

	static {
		//  Registro dos adapters disponíveis
		PaymentAdapterFactory.registerAdapter(
			"legacy",
			() => new LegacyPaymentAdapter(),
		);
		PaymentAdapterFactory.registerAdapter(
			"external",
			() => new ExternalPaymentAdapter(),
		);
	}

	static registerAdapter(type: string, factory: () => PaymentProcessor): void {
		PaymentAdapterFactory.adapters.set(type, factory);
	}

	static createAdapter(type: string): PaymentProcessor | null {
		const factory = PaymentAdapterFactory.adapters.get(type);
		return factory ? factory() : null;
	}

	static getAvailableTypes(): string[] {
		return Array.from(PaymentAdapterFactory.adapters.keys());
	}
}

//  Serviço unificado usando adapters
export class UnifiedPaymentService {
	async processPayment(
		providerType: string,
		amount: number,
		currency: string,
		cardNumber: string,
	): Promise<PaymentResult> {
		const adapter = PaymentAdapterFactory.createAdapter(providerType);

		if (!adapter) {
			return {
				success: false,
				transactionId: "",
				message: `Provedor '${providerType}' não suportado`,
				timestamp: new Date(),
			};
		}

		//  Validação antes do processamento
		const isValidCard = await adapter.validateCard(cardNumber);
		if (!isValidCard) {
			return {
				success: false,
				transactionId: "",
				message: "Cartão inválido",
				timestamp: new Date(),
			};
		}

		console.log(` Processando via ${adapter.getProviderName()}`);
		return await adapter.processPayment(amount, currency, cardNumber);
	}

	async refundPayment(
		providerType: string,
		transactionId: string,
	): Promise<RefundResult> {
		const adapter = PaymentAdapterFactory.createAdapter(providerType);

		if (!adapter) {
			return {
				success: false,
				refundId: "",
				message: `Provedor '${providerType}' não suportado`,
				timestamp: new Date(),
				originalTransactionId: transactionId,
			};
		}

		console.log(` Estornando via ${adapter.getProviderName()}`);
		return await adapter.refundPayment(transactionId);
	}

	getAvailableProviders(): string[] {
		return PaymentAdapterFactory.getAvailableTypes();
	}
}

//  Sistema simplificado usando interface única
export class ModernECommerceSystem {
	private paymentService = new UnifiedPaymentService();

	async processOrder(
		orderId: string,
		amount: number,
		cardNumber: string,
		preferredProvider?: string,
	): Promise<void> {
		console.log(`🛒 Processando pedido ${orderId} - R$${amount.toFixed(2)}`);

		const providers = this.paymentService.getAvailableProviders();
		const provider =
			preferredProvider && providers.includes(preferredProvider)
				? preferredProvider
				: providers[0]; // Fallback para primeiro disponível

		try {
			//  Interface única para todos os provedores
			const result = await this.paymentService.processPayment(
				provider,
				amount,
				"BRL",
				cardNumber,
			);

			if (result.success) {
				console.log(` Pagamento aprovado!`);
				console.log(`   ID da transação: ${result.transactionId}`);
				console.log(`   Processado em: ${result.timestamp.toLocaleString()}`);
			} else {
				console.log(`Pagamento falhou: ${result.message}`);

				//  Fallback automático para outro provedor
				if (providers.length > 1) {
					const fallbackProvider = providers.find((p) => p !== provider);
					if (fallbackProvider) {
						console.log(
							` Tentando com provedor alternativo: ${fallbackProvider}`,
						);
						const fallbackResult = await this.paymentService.processPayment(
							fallbackProvider,
							amount,
							"BRL",
							cardNumber,
						);

						if (fallbackResult.success) {
							console.log(
								` Pagamento aprovado no fallback: ${fallbackResult.transactionId}`,
							);
						}
					}
				}
			}
		} catch (error) {
			console.log("Erro no processamento:", error);
		}
	}

	async processRefund(
		orderId: string,
		transactionId: string,
		provider: string,
	): Promise<void> {
		console.log(` Processando estorno do pedido ${orderId}`);

		try {
			const result = await this.paymentService.refundPayment(
				provider,
				transactionId,
			);

			if (result.success) {
				console.log(` Estorno aprovado: ${result.refundId}`);
			} else {
				console.log(`Estorno falhou: ${result.message}`);
			}
		} catch (error) {
			console.log("Erro no estorno:", error);
		}
	}
}

//  Demonstração da solução
export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Adapter) ===");

	const ecommerce = new ModernECommerceSystem();
	const paymentService = new UnifiedPaymentService();

	console.log(
		" Provedores disponíveis:",
		paymentService.getAvailableProviders(),
	);

	//  Interface única para diferentes provedores
	console.log("\n1. Pagamento via sistema legado:");
	ecommerce.processOrder("ORDER-001", 299.9, "4111111111111111", "legacy");

	console.log("\n2. Pagamento via API externa:");
	ecommerce.processOrder("ORDER-002", 199.5, "5555555555554444", "external");

	console.log("\n3. Pagamento com fallback automático:");
	ecommerce.processOrder("ORDER-003", 99.9, "4111111111111111");

	console.log("\n4. Tentativa com cartão inválido:");
	ecommerce.processOrder("ORDER-004", 150.0, "123", "legacy");

	//  Demonstra que novos adapters podem ser facilmente adicionados
	console.log("\n5. Adicionando novo provedor:");
	PaymentAdapterFactory.registerAdapter("mock", () => new MockPaymentAdapter());
	console.log("Novos provedores:", paymentService.getAvailableProviders());

	console.log(
		"\n Benefícios: interface única, fácil extensão, código reutilizável",
	);
}

//  Exemplo de novo adapter facilmente adicionável
class MockPaymentAdapter implements PaymentProcessor {
	async processPayment(
		amount: number,
		currency: string,
		cardNumber: string,
	): Promise<PaymentResult> {
		console.log(` Mock: Simulando pagamento de ${amount} ${currency}`);
		return {
			success: true,
			transactionId: `mock_${Date.now()}`,
			message: "Pagamento simulado com sucesso",
			timestamp: new Date(),
		};
	}

	async validateCard(cardNumber: string): Promise<boolean> {
		return cardNumber.length >= 13;
	}

	async refundPayment(transactionId: string): Promise<RefundResult> {
		return {
			success: true,
			refundId: `mock_refund_${Date.now()}`,
			message: "Estorno simulado",
			timestamp: new Date(),
			originalTransactionId: transactionId,
		};
	}

	getProviderName(): string {
		return "Mock Payment Provider";
	}
}
