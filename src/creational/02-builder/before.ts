// Cenário: Sistema de criação de pedidos de pizza
// Problema: Construtor com muitos parâmetros e combinações complexas

interface Pizza {
	size: string;
	crust: string;
	toppings: string[];
	cheese: string;
	sauce: string;
	price: number;
	preparationTime: number;
}

// Abordagem ingênua: construtor com muitos parâmetros
class Pizza {
	constructor(
		public size: string,
		public crust: string,
		public cheese: string,
		public sauce: string,
		public toppings: string[] = [],
		public extraCheese: boolean = false,
		public spicyLevel: number = 0,
		public isGlutenFree: boolean = false,
		public hasOlives: boolean = false,
		public hasMushrooms: boolean = false,
		public hasPepperoni: boolean = false,
		public hasVeggies: boolean = false,
	) {
		this.price = this.calculatePrice();
		this.preparationTime = this.calculatePreparationTime();
	}

	private calculatePrice(): number {
		let price = 0;
		// Lógica de preço espalhada e difícil de manter
		switch (this.size) {
			case "small":
				price = 25;
				break;
			case "medium":
				price = 35;
				break;
			case "large":
				price = 45;
				break;
		}

		price += this.toppings.length * 3;
		if (this.extraCheese) price += 5;
		if (this.isGlutenFree) price += 8;

		return price;
	}

	private calculatePreparationTime(): number {
		let time = 15; // base time
		time += this.toppings.length * 2;
		if (this.isGlutenFree) time += 5;
		return time;
	}
}

// Problemático: chamadas complexas e propensas a erro
class PizzaOrderService {
	createMargherita(): Pizza {
		// Muitos parâmetros, fácil errar a ordem
		return new Pizza(
			"medium", // size
			"thin", // crust
			"mozzarella", // cheese
			"tomato", // sauce
			["basil"], // toppings
			false, // extraCheese
			0, // spicyLevel
			false, // isGlutenFree
			false, // hasOlives
			false, // hasMushrooms
			false, // hasPepperoni
			true, // hasVeggies
		);
	}

	createPepperoni(): Pizza {
		// Repetição de código e difícil leitura
		return new Pizza(
			"large",
			"thick",
			"mozzarella",
			"tomato",
			["pepperoni"],
			true, // extraCheese
			2, // spicyLevel
			false,
			false,
			false,
			true, // hasPepperoni
			false,
		);
	}

	// Impossível lembrar ordem dos parâmetros
	createCustomPizza(
		size: string,
		wantsOlives: boolean,
		extraSpicy: boolean,
		glutenFree: boolean,
	): Pizza {
		return new Pizza(
			size,
			"thin",
			"mozzarella",
			"tomato",
			extraSpicy ? ["jalapeño", "pepperoni"] : ["pepperoni"],
			true,
			extraSpicy ? 3 : 1,
			glutenFree,
			wantsOlives,
			false,
			true,
			false,
		);
	}
}

// Demonstração dos problemas
export function demonstrateProblems() {
	const orderService = new PizzaOrderService();

	console.log("=== ANTES (Problemático) ===");

	// Difícil entender o que cada pizza tem
	const margherita = orderService.createMargherita();
	console.log("🍕 Margherita:", margherita);

	const pepperoni = orderService.createPepperoni();
	console.log("🍕 Pepperoni:", pepperoni);

	// Parâmetros confusos
	const custom = orderService.createCustomPizza("large", true, false, true);
	console.log("🍕 Custom:", custom);

	// Fácil fazer pedidos inválidos ou inconsistentes
	console.log(
		"Problemas: construtor complexo, difícil personalização, propenso a erros",
	);
}
