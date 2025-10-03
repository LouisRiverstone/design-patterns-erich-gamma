export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Algoritmos fixos em condicionais");

	class PaymentProcessor {
		processPayment(amount: number, method: string, cardData?: any): void {
			if (method === "credit_card") {
				console.log(`Processando ${amount} via cartão de crédito...`);
				if (!cardData?.number || !cardData?.cvv) {
					throw new Error("Dados do cartão inválidos");
				}
				// Lógica específica do cartão
				this.validateCard(cardData);
				this.chargeCard(amount, cardData);
			} else if (method === "paypal") {
				console.log(`Processando ${amount} via PayPal...`);
				if (!cardData?.email) {
					throw new Error("Email do PayPal necessário");
				}
				// Lógica específica do PayPal
				this.redirectToPayPal(amount, cardData.email);
			} else if (method === "bank_transfer") {
				console.log(`Processando ${amount} via transferência bancária...`);
				if (!cardData?.bankAccount) {
					throw new Error("Conta bancária necessária");
				}
				// Lógica específica da transferência
				this.initiateBankTransfer(amount, cardData.bankAccount);
			} else {
				throw new Error("Método de pagamento não suportado");
			}
		}

		private validateCard(cardData: any): void {
			console.log("Validando cartão...");
		}

		private chargeCard(amount: number, cardData: any): void {
			console.log(`Cobrando ${amount} do cartão ${cardData.number.slice(-4)}`);
		}

		private redirectToPayPal(amount: number, email: string): void {
			console.log(`Redirecionando para PayPal: ${email}`);
		}

		private initiateBankTransfer(amount: number, account: string): void {
			console.log(`Transferência bancária: ${amount} para ${account}`);
		}
	}

	const processor = new PaymentProcessor();

	try {
		processor.processPayment(100, "credit_card", {
			number: "1234567812345678",
			cvv: "123",
		});

		processor.processPayment(200, "paypal", {
			email: "user@paypal.com",
		});
	} catch (error) {
		console.error("Erro:", error);
	}

	console.log("Problemas: métodos longos, difícil extensão, violação SRP");
}
