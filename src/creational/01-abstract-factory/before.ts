// Cenário: Sistema de e-commerce com diferentes tipos de produtos
// Problema: Criação manual de objetos relacionados sem garantir compatibilidade

interface Product {
	name: string;
	price: number;
	category: string;
}

interface PaymentMethod {
	process(amount: number): boolean;
}

// Abordagem ingênua: criação manual sem garantias de compatibilidade
class DigitalProduct implements Product {
	constructor(
		public name: string,
		public price: number,
		public category: string = "digital",
	) {}
}

class PhysicalProduct implements Product {
	constructor(
		public name: string,
		public price: number,
		public category: string = "physical",
		public weight: number = 0,
	) {}
}

class CreditCardPayment implements PaymentMethod {
	process(amount: number): boolean {
		console.log(`Processando pagamento de R$${amount} no cartão de crédito`);
		return amount > 0;
	}
}

class PixPayment implements PaymentMethod {
	process(amount: number): boolean {
		console.log(`Processando pagamento de R$${amount} via PIX`);
		return amount > 0;
	}
}

// Problemático: cliente precisa conhecer todas as classes e criar manualmente
class OrderService {
	createOrder(
		productType: string,
		paymentType: string,
		productName: string,
		price: number,
	) {
		let product: Product;
		let payment: PaymentMethod;

		// Problema: acoplamento forte, sem garantia de compatibilidade
		if (productType === "digital") {
			product = new DigitalProduct(productName, price);
			// Pode criar combinações inválidas facilmente
			payment = new PixPayment(); // PIX pode não ser adequado para digitais
		} else {
			product = new PhysicalProduct(productName, price);
			payment = new CreditCardPayment();
		}

		// Sem garantia de que produto e pagamento são compatíveis
		return {
			product,
			payment,
			total: price,
		};
	}
}

// Demonstração do problema
export function demonstrateProblems() {
	const orderService = new OrderService();

	// Criação inconsistente - pode gerar combinações problemáticas
	const order1 = orderService.createOrder(
		"digital",
		"pix",
		"E-book TypeScript",
		49.9,
	);
	const order2 = orderService.createOrder(
		"physical",
		"credit",
		"Livro Físico",
		89.9,
	);

	console.log("=== ANTES (Problemático) ===");
	console.log("Pedido 1:", order1);
	console.log("Pedido 2:", order2);

	// Fácil criar combinações inválidas ou subótimas
	// Exemplo: produto físico com PIX pode ter problemas de rastreamento
	const problematicOrder = orderService.createOrder(
		"physical",
		"pix",
		"Smartphone",
		1200,
	);
	console.log("Pedido problemático:", problematicOrder);
}
