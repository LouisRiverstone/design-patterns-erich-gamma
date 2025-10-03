// Solução: Abstract Factory para garantir compatibilidade entre produtos relacionados
// Benefício: Garante que produtos e pagamentos sejam sempre compatíveis

interface Product {
	name: string;
	price: number;
	category: string;
	getShippingInfo(): string;
}

interface PaymentMethod {
	process(amount: number): boolean;
	getTransactionFee(): number;
}

//  Abstract Factory define interface para criar famílias de objetos relacionados
abstract class ECommerceFactory {
	abstract createProduct(name: string, price: number): Product;
	abstract createPaymentMethod(): PaymentMethod;

	//  Método adicional que garante compatibilidade
	createOrder(productName: string, price: number) {
		const product = this.createProduct(productName, price);
		const payment = this.createPaymentMethod();

		return {
			product,
			payment,
			total: price + payment.getTransactionFee(),
			shippingInfo: product.getShippingInfo(),
		};
	}
}

//  Família de produtos digitais
class DigitalProduct implements Product {
	constructor(
		public name: string,
		public price: number,
		public category: string = "digital",
	) {}

	getShippingInfo(): string {
		return "Download imediato após pagamento";
	}
}

class PixPayment implements PaymentMethod {
	process(amount: number): boolean {
		console.log(
			` Processando pagamento PIX de R$${amount} - aprovação instantânea`,
		);
		return amount > 0;
	}

	getTransactionFee(): number {
		return 0; // PIX sem taxa para digitais
	}
}

//  Factory concreta para produtos digitais
export class DigitalECommerceFactory extends ECommerceFactory {
	createProduct(name: string, price: number): Product {
		return new DigitalProduct(name, price);
	}

	createPaymentMethod(): PaymentMethod {
		return new PixPayment();
	}
}

//  Família de produtos físicos
class PhysicalProduct implements Product {
	constructor(
		public name: string,
		public price: number,
		public category: string = "physical",
		public weight: number = 1,
	) {}

	getShippingInfo(): string {
		return `Entrega em 3-7 dias úteis via transportadora (${this.weight}kg)`;
	}
}

class CreditCardPayment implements PaymentMethod {
	process(amount: number): boolean {
		console.log(
			` Processando pagamento cartão R$${amount} - aprovação em 2-3 dias`,
		);
		return amount > 0;
	}

	getTransactionFee(): number {
		return 2.99; // Taxa do cartão
	}
}

//  Factory concreta para produtos físicos
export class PhysicalECommerceFactory extends ECommerceFactory {
	createProduct(name: string, price: number): Product {
		return new PhysicalProduct(name, price);
	}

	createPaymentMethod(): PaymentMethod {
		return new CreditCardPayment();
	}
}

//  Cliente usa apenas a abstract factory, garantindo compatibilidade
export class OrderService {
	constructor(private factory: ECommerceFactory) {}

	createOrder(productName: string, price: number) {
		//  Sempre cria objetos compatíveis
		return this.factory.createOrder(productName, price);
	}

	//  Fácil trocar de família sem quebrar compatibilidade
	setFactory(factory: ECommerceFactory) {
		this.factory = factory;
	}
}

//  Demonstração da solução
export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Abstract Factory) ===");

	//  Criação garantidamente compatível
	const digitalFactory = new DigitalECommerceFactory();
	const physicalFactory = new PhysicalECommerceFactory();

	const orderService = new OrderService(digitalFactory);

	//  Produtos digitais sempre com PIX (instantâneo, sem taxa)
	const digitalOrder = orderService.createOrder("Curso TypeScript", 199.9);
	console.log(" Pedido Digital:", digitalOrder);
	console.log("", digitalOrder.shippingInfo);

	//  Mudança de contexto - agora produtos físicos
	orderService.setFactory(physicalFactory);

	//  Produtos físicos sempre com cartão (rastreável, com segurança)
	const physicalOrder = orderService.createOrder("Livro Clean Code", 89.9);
	console.log("📦 Pedido Físico:", physicalOrder);
	console.log("🚚", physicalOrder.shippingInfo);

	//  Processamento dos pagamentos
	digitalOrder.payment.process(digitalOrder.total);
	physicalOrder.payment.process(physicalOrder.total);
}
