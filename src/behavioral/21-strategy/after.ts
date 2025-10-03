// Strategy interface
export interface PaymentStrategy {
	processPayment(amount: number, paymentData: any): PaymentResult;
	validatePaymentData(paymentData: any): boolean;
	getRequiredFields(): string[];
	getName(): string;
}

// Payment result interface
export interface PaymentResult {
	success: boolean;
	transactionId?: string;
	message?: string;
	redirectUrl?: string;
	errorCode?: string;
}

// Concrete Strategies
export class CreditCardStrategy implements PaymentStrategy {
	processPayment(amount: number, cardData: any): PaymentResult {
		console.log(` Processando ${amount} via cartão de crédito...`);

		if (!this.validatePaymentData(cardData)) {
			return {
				success: false,
				message: "Dados do cartão inválidos",
				errorCode: "INVALID_CARD_DATA",
			};
		}

		// Simulate card processing
		const isValidCard = this.validateCard(cardData);
		if (!isValidCard) {
			return {
				success: false,
				message: "Cartão recusado",
				errorCode: "CARD_DECLINED",
			};
		}

		const transactionId = this.chargeCard(amount, cardData);

		return {
			success: true,
			transactionId,
			message: `Pagamento de ${amount} processado com sucesso`,
		};
	}

	validatePaymentData(cardData: any): boolean {
		return !!(
			cardData &&
			cardData.number &&
			cardData.cvv &&
			cardData.expiryDate &&
			cardData.holderName
		);
	}

	getRequiredFields(): string[] {
		return ["number", "cvv", "expiryDate", "holderName"];
	}

	getName(): string {
		return "Credit Card";
	}

	private validateCard(cardData: any): boolean {
		console.log(`Validando cartão ${cardData.number.slice(-4)}...`);

		// Simulate validation (Luhn algorithm, expiry check, etc.)
		const cardNumber = cardData.number.replace(/\s/g, "");
		return cardNumber.length >= 13 && cardNumber.length <= 19;
	}

	private chargeCard(amount: number, cardData: any): string {
		const transactionId = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		console.log(
			`Cobrando ${amount} do cartão ${cardData.number.slice(-4)} - ID: ${transactionId}`,
		);
		return transactionId;
	}
}

export class PayPalStrategy implements PaymentStrategy {
	processPayment(amount: number, paypalData: any): PaymentResult {
		console.log(` Processando ${amount} via PayPal...`);

		if (!this.validatePaymentData(paypalData)) {
			return {
				success: false,
				message: "Email do PayPal necessário",
				errorCode: "INVALID_PAYPAL_DATA",
			};
		}

		const redirectUrl = this.generatePayPalUrl(amount, paypalData.email);

		return {
			success: true,
			transactionId: `PP-${Date.now()}`,
			message: "Redirecionando para PayPal...",
			redirectUrl,
		};
	}

	validatePaymentData(paypalData: any): boolean {
		return (
			paypalData && paypalData.email && this.isValidEmail(paypalData.email)
		);
	}

	getRequiredFields(): string[] {
		return ["email"];
	}

	getName(): string {
		return "PayPal";
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	private generatePayPalUrl(amount: number, email: string): string {
		const url = `https://paypal.com/checkout?amount=${amount}&email=${encodeURIComponent(email)}`;
		console.log(`URL do PayPal: ${url}`);
		return url;
	}
}

export class BankTransferStrategy implements PaymentStrategy {
	processPayment(amount: number, bankData: any): PaymentResult {
		console.log(` Processando ${amount} via transferência bancária...`);

		if (!this.validatePaymentData(bankData)) {
			return {
				success: false,
				message: "Dados bancários inválidos",
				errorCode: "INVALID_BANK_DATA",
			};
		}

		const transactionId = this.initiateBankTransfer(amount, bankData);

		return {
			success: true,
			transactionId,
			message: `Transferência de ${amount} iniciada. Processamento em até 2 dias úteis.`,
		};
	}

	validatePaymentData(bankData: any): boolean {
		return (
			bankData &&
			bankData.accountNumber &&
			bankData.routingNumber &&
			bankData.accountHolderName
		);
	}

	getRequiredFields(): string[] {
		return ["accountNumber", "routingNumber", "accountHolderName"];
	}

	getName(): string {
		return "Bank Transfer";
	}

	private initiateBankTransfer(amount: number, bankData: any): string {
		const transactionId = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		console.log(
			`Transferência de ${amount} para conta ${bankData.accountNumber.slice(-4)} - ID: ${transactionId}`,
		);
		return transactionId;
	}
}

export class CryptocurrencyStrategy implements PaymentStrategy {
	constructor(
		private cryptocurrencyType: "bitcoin" | "ethereum" | "litecoin" = "bitcoin",
	) {}

	processPayment(amount: number, cryptoData: any): PaymentResult {
		console.log(`₿ Processando ${amount} via ${this.cryptocurrencyType}...`);

		if (!this.validatePaymentData(cryptoData)) {
			return {
				success: false,
				message: "Endereço de carteira inválido",
				errorCode: "INVALID_WALLET_ADDRESS",
			};
		}

		const convertedAmount = this.convertToCrypto(amount);
		const transactionId = this.sendCrypto(
			convertedAmount,
			cryptoData.walletAddress,
		);

		return {
			success: true,
			transactionId,
			message: `Enviado ${convertedAmount} ${this.cryptocurrencyType.toUpperCase()}`,
		};
	}

	validatePaymentData(cryptoData: any): boolean {
		return (
			cryptoData &&
			cryptoData.walletAddress &&
			this.isValidWalletAddress(cryptoData.walletAddress)
		);
	}

	getRequiredFields(): string[] {
		return ["walletAddress"];
	}

	getName(): string {
		return `${this.cryptocurrencyType.charAt(0).toUpperCase() + this.cryptocurrencyType.slice(1)}`;
	}

	private isValidWalletAddress(address: string): boolean {
		// Simplified validation - real implementations would be more complex
		const patterns = {
			bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
			ethereum: /^0x[a-fA-F0-9]{40}$/,
			litecoin: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
		};

		return patterns[this.cryptocurrencyType]?.test(address) || false;
	}

	private convertToCrypto(usdAmount: number): number {
		// Mock conversion rates
		const rates = {
			bitcoin: 0.000023, // 1 USD = 0.000023 BTC
			ethereum: 0.00041, // 1 USD = 0.00041 ETH
			litecoin: 0.0089, // 1 USD = 0.0089 LTC
		};

		return usdAmount * rates[this.cryptocurrencyType];
	}

	private sendCrypto(amount: number, walletAddress: string): string {
		const transactionId = `${this.cryptocurrencyType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		console.log(
			`Enviando ${amount} ${this.cryptocurrencyType.toUpperCase()} para ${walletAddress.slice(0, 8)}...`,
		);
		return transactionId;
	}
}

// Context
export class PaymentProcessor {
	private strategy?: PaymentStrategy;
	private supportedStrategies: Map<string, PaymentStrategy> = new Map();

	constructor() {
		// Register default strategies
		this.registerStrategy("credit_card", new CreditCardStrategy());
		this.registerStrategy("paypal", new PayPalStrategy());
		this.registerStrategy("bank_transfer", new BankTransferStrategy());
		this.registerStrategy("bitcoin", new CryptocurrencyStrategy("bitcoin"));
		this.registerStrategy("ethereum", new CryptocurrencyStrategy("ethereum"));
	}

	registerStrategy(name: string, strategy: PaymentStrategy): void {
		this.supportedStrategies.set(name, strategy);
	}

	setStrategy(strategyName: string): boolean {
		const strategy = this.supportedStrategies.get(strategyName);
		if (strategy) {
			this.strategy = strategy;
			return true;
		}
		return false;
	}

	processPayment(amount: number, paymentData: any): PaymentResult {
		if (!this.strategy) {
			return {
				success: false,
				message: "Nenhuma estratégia de pagamento definida",
				errorCode: "NO_STRATEGY",
			};
		}

		console.log(
			`Processando pagamento com estratégia: ${this.strategy.getName()}`,
		);
		return this.strategy.processPayment(amount, paymentData);
	}

	getRequiredFields(): string[] {
		return this.strategy ? this.strategy.getRequiredFields() : [];
	}

	getSupportedMethods(): string[] {
		return Array.from(this.supportedStrategies.keys());
	}

	getCurrentStrategy(): string | null {
		return this.strategy ? this.strategy.getName() : null;
	}

	validatePaymentData(paymentData: any): boolean {
		return this.strategy
			? this.strategy.validatePaymentData(paymentData)
			: false;
	}
}

// Advanced factory for creating payment processors with specific strategies
export class PaymentProcessorFactory {
	static createProcessor(defaultStrategy?: string): PaymentProcessor {
		const processor = new PaymentProcessor();

		if (defaultStrategy) {
			processor.setStrategy(defaultStrategy);
		}

		return processor;
	}

	static createECommerceProcessor(): PaymentProcessor {
		const processor = new PaymentProcessor();

		// Add specific strategies for e-commerce
		processor.registerStrategy("apple_pay", new ApplePayStrategy());
		processor.registerStrategy("google_pay", new GooglePayStrategy());

		return processor;
	}
}

// Additional strategies for demonstration
class ApplePayStrategy implements PaymentStrategy {
	processPayment(amount: number, applePayData: any): PaymentResult {
		console.log(`🍎 Processando ${amount} via Apple Pay...`);

		return {
			success: true,
			transactionId: `AP-${Date.now()}`,
			message: "Pagamento processado via Apple Pay",
		};
	}

	validatePaymentData(applePayData: any): boolean {
		return applePayData && applePayData.deviceId && applePayData.touchId;
	}

	getRequiredFields(): string[] {
		return ["deviceId", "touchId"];
	}

	getName(): string {
		return "Apple Pay";
	}
}

class GooglePayStrategy implements PaymentStrategy {
	processPayment(amount: number, googlePayData: any): PaymentResult {
		console.log(` Processando ${amount} via Google Pay...`);

		return {
			success: true,
			transactionId: `GP-${Date.now()}`,
			message: "Pagamento processado via Google Pay",
		};
	}

	validatePaymentData(googlePayData: any): boolean {
		return googlePayData && googlePayData.googleAccount;
	}

	getRequiredFields(): string[] {
		return ["googleAccount"];
	}

	getName(): string {
		return "Google Pay";
	}
}

export function demonstrateSolution() {
	console.log(
		"DEPOIS (Solução Strategy) - Algoritmos intercambiáveis e extensíveis",
	);

	console.log("\n=== Processador Básico ===");
	const processor = new PaymentProcessor();

	console.log("Métodos suportados:", processor.getSupportedMethods());

	// Credit Card Payment
	processor.setStrategy("credit_card");
	console.log(`\nEstrategia atual: ${processor.getCurrentStrategy()}`);
	console.log("Campos obrigatórios:", processor.getRequiredFields());

	let result = processor.processPayment(150, {
		number: "4532 1234 5678 9012",
		cvv: "123",
		expiryDate: "12/25",
		holderName: "João Silva",
	});
	console.log("Resultado:", result);

	// PayPal Payment
	processor.setStrategy("paypal");
	result = processor.processPayment(75, {
		email: "joao@email.com",
	});
	console.log("Resultado:", result);

	// Bitcoin Payment
	processor.setStrategy("bitcoin");
	result = processor.processPayment(200, {
		walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
	});
	console.log("Resultado:", result);

	console.log("\n=== Processador E-commerce ===");
	const ecommerceProcessor = PaymentProcessorFactory.createECommerceProcessor();
	console.log("Métodos E-commerce:", ecommerceProcessor.getSupportedMethods());

	// Apple Pay
	ecommerceProcessor.setStrategy("apple_pay");
	result = ecommerceProcessor.processPayment(99.99, {
		deviceId: "iPhone-12-Pro",
		touchId: true,
	});
	console.log("Resultado Apple Pay:", result);

	console.log("\n=== Tratamento de Erros ===");
	processor.setStrategy("credit_card");
	result = processor.processPayment(100, {
		number: "1234", // Dados inválidos
		cvv: "12",
	});
	console.log("Erro esperado:", result);
}
