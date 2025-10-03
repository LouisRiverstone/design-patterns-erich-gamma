// Solução: Builder Pattern para construção passo a passo
// Benefício: Interface fluente, validação e construção controlada

interface Pizza {
	size: string;
	crust: string;
	toppings: string[];
	cheese: string;
	sauce: string;
	price: number;
	preparationTime: number;
	specialRequests: string[];
}

//  Produto final simples e bem estruturado
class Pizza implements Pizza {
	constructor(
		public size: string,
		public crust: string,
		public cheese: string,
		public sauce: string,
		public toppings: string[],
		public price: number,
		public preparationTime: number,
		public specialRequests: string[] = [],
	) {}

	getDescription(): string {
		return `Pizza ${this.size} com massa ${this.crust}, molho ${this.sauce}, queijo ${this.cheese} e ingredientes: ${this.toppings.join(", ")}`;
	}
}

//  Builder abstrato define interface de construção
abstract class PizzaBuilder {
	protected pizza: Partial<Pizza> = {};

	//  Métodos fluentes para cada aspecto da pizza
	abstract setSize(size: "small" | "medium" | "large"): this;
	abstract setCrust(crust: "thin" | "thick" | "stuffed"): this;
	abstract setSauce(sauce: "tomato" | "white" | "pesto" | "bbq"): this;
	abstract setCheese(cheese: "mozzarella" | "cheddar" | "goat" | "vegan"): this;
	abstract addTopping(topping: string): this;
	abstract addSpecialRequest(request: string): this;

	//  Validação e cálculo final
	build(): Pizza {
		this.validatePizza();
		this.calculatePricing();

		return new Pizza(
			this.pizza.size!,
			this.pizza.crust!,
			this.pizza.cheese!,
			this.pizza.sauce!,
			this.pizza.toppings!,
			this.pizza.price!,
			this.pizza.preparationTime!,
			this.pizza.specialRequests,
		);
	}

	private validatePizza(): void {
		if (!this.pizza.size) throw new Error("Tamanho da pizza é obrigatório");
		if (!this.pizza.crust) throw new Error("Tipo de massa é obrigatório");
		if (!this.pizza.sauce) throw new Error("Molho é obrigatório");
		if (!this.pizza.cheese) throw new Error("Queijo é obrigatório");
	}

	private calculatePricing(): void {
		let price = 0;
		let time = 15;

		//  Lógica de preço centralizada e clara
		const sizePrices = { small: 25, medium: 35, large: 45 };
		price += sizePrices[this.pizza.size as keyof typeof sizePrices];

		const crustPrices = { thin: 0, thick: 3, stuffed: 8 };
		price += crustPrices[this.pizza.crust as keyof typeof crustPrices];

		// Toppings
		price += (this.pizza.toppings?.length || 0) * 3;
		time += (this.pizza.toppings?.length || 0) * 2;

		// Special cheese
		if (this.pizza.cheese === "goat" || this.pizza.cheese === "vegan") {
			price += 5;
		}

		this.pizza.price = price;
		this.pizza.preparationTime = time;
	}
}

//  Builder concreto para pizzas tradicionais
export class TraditionalPizzaBuilder extends PizzaBuilder {
	constructor() {
		super();
		this.pizza.toppings = [];
		this.pizza.specialRequests = [];
	}

	setSize(size: "small" | "medium" | "large"): this {
		this.pizza.size = size;
		return this;
	}

	setCrust(crust: "thin" | "thick" | "stuffed"): this {
		this.pizza.crust = crust;
		return this;
	}

	setSauce(sauce: "tomato" | "white" | "pesto" | "bbq"): this {
		this.pizza.sauce = sauce;
		return this;
	}

	setCheese(cheese: "mozzarella" | "cheddar" | "goat" | "vegan"): this {
		this.pizza.cheese = cheese;
		return this;
	}

	addTopping(topping: string): this {
		this.pizza.toppings?.push(topping);
		return this;
	}

	addSpecialRequest(request: string): this {
		this.pizza.specialRequests?.push(request);
		return this;
	}

	//  Métodos específicos para facilitar uso
	addVeggieToppings(): this {
		return this.addTopping("mushrooms")
			.addTopping("bell peppers")
			.addTopping("onions")
			.addTopping("olives");
	}

	makePepperoni(): this {
		return this.addTopping("pepperoni").addTopping("extra cheese");
	}
}

//  Builder especializado para pizzas veganas
export class VeganPizzaBuilder extends PizzaBuilder {
	constructor() {
		super();
		this.pizza.toppings = [];
		this.pizza.specialRequests = [];
		//  Configurações padrão veganas
		this.pizza.cheese = "vegan";
	}

	setSize(size: "small" | "medium" | "large"): this {
		this.pizza.size = size;
		return this;
	}

	setCrust(crust: "thin" | "thick" | "stuffed"): this {
		this.pizza.crust = crust;
		return this;
	}

	setSauce(sauce: "tomato" | "white" | "pesto" | "bbq"): this {
		this.pizza.sauce = sauce;
		return this;
	}

	setCheese(cheese: "vegan"): this {
		this.pizza.cheese = cheese; // Só aceita vegano
		return this;
	}

	addTopping(topping: string): this {
		//  Validação específica para vegano
		const veganToppings = [
			"mushrooms",
			"bell peppers",
			"onions",
			"olives",
			"spinach",
			"tomatoes",
			"basil",
		];
		if (!veganToppings.includes(topping)) {
			throw new Error(`${topping} não é um ingrediente vegano válido`);
		}
		this.pizza.toppings?.push(topping);
		return this;
	}

	addSpecialRequest(request: string): this {
		this.pizza.specialRequests?.push(request);
		return this;
	}
}

//  Director para receitas predefinidas
export class PizzaDirector {
	static createMargherita(builder: PizzaBuilder): Pizza {
		return builder
			.setSize("medium")
			.setCrust("thin")
			.setSauce("tomato")
			.setCheese("mozzarella")
			.addTopping("basil")
			.addTopping("fresh tomatoes")
			.build();
	}

	static createPepperoni(builder: PizzaBuilder): Pizza {
		return builder
			.setSize("large")
			.setCrust("thick")
			.setSauce("tomato")
			.setCheese("mozzarella")
			.addTopping("pepperoni")
			.addTopping("extra cheese")
			.build();
	}

	static createVeggiePizza(builder: VeganPizzaBuilder): Pizza {
		return builder
			.setSize("medium")
			.setCrust("thin")
			.setSauce("pesto")
			.addTopping("mushrooms")
			.addTopping("bell peppers")
			.addTopping("spinach")
			.addSpecialRequest("Extra bem passada")
			.build();
	}
}

//  Demonstração da solução
export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Builder) ===");

	//  Criação fluente e clara
	const margherita = new TraditionalPizzaBuilder()
		.setSize("medium")
		.setCrust("thin")
		.setSauce("tomato")
		.setCheese("mozzarella")
		.addTopping("basil")
		.addSpecialRequest("Pouco sal")
		.build();

	console.log("🍕 Margherita:", margherita.getDescription());
	console.log(" Preço: R$", margherita.price);

	//  Uso do Director para receitas predefinidas
	const pepperoni = PizzaDirector.createPepperoni(
		new TraditionalPizzaBuilder(),
	);
	console.log("🍕 Pepperoni:", pepperoni.getDescription());

	//  Builder especializado vegano
	const veganPizza = new VeganPizzaBuilder()
		.setSize("large")
		.setCrust("stuffed")
		.setSauce("pesto")
		.addTopping("mushrooms")
		.addTopping("spinach")
		.addSpecialRequest("Sem glúten")
		.build();

	console.log("🌱 Vegana:", veganPizza.getDescription());

	//  Construção flexível e personalizada
	const customPizza = new TraditionalPizzaBuilder()
		.setSize("large")
		.setCrust("thick")
		.setSauce("bbq")
		.setCheese("cheddar")
		.addVeggieToppings()
		.makePepperoni()
		.addSpecialRequest("Cortar em 8 pedaços")
		.build();

	console.log(" Personalizada:", customPizza.getDescription());
	console.log(" Tempo preparo:", customPizza.preparationTime, "min");
}
