import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	TraditionalPizzaBuilder,
	VeganPizzaBuilder,
	PizzaDirector,
} from "./after";

describe("Builder Pattern", () => {
	describe("Before: Without Builder", () => {
		it("should demonstrate problems with complex constructor", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Builder Pattern", () => {
		it("should build pizza step by step with fluent interface", () => {
			const pizza = new TraditionalPizzaBuilder()
				.setSize("medium")
				.setCrust("thin")
				.setSauce("tomato")
				.setCheese("mozzarella")
				.addTopping("basil")
				.addTopping("tomatoes")
				.build();

			expect(pizza.size).toBe("medium");
			expect(pizza.crust).toBe("thin");
			expect(pizza.sauce).toBe("tomato");
			expect(pizza.cheese).toBe("mozzarella");
			expect(pizza.toppings).toContain("basil");
			expect(pizza.toppings).toContain("tomatoes");
			expect(pizza.price).toBeGreaterThan(0);
			expect(pizza.preparationTime).toBeGreaterThan(0);
		});

		it("should validate required fields", () => {
			const builder = new TraditionalPizzaBuilder();

			expect(() => {
				builder.build(); // Missing required fields
			}).toThrow("Tamanho da pizza é obrigatório");
		});

		it("should calculate price based on size, crust, and toppings", () => {
			const smallPizza = new TraditionalPizzaBuilder()
				.setSize("small")
				.setCrust("thin")
				.setSauce("tomato")
				.setCheese("mozzarella")
				.build();

			const largePizza = new TraditionalPizzaBuilder()
				.setSize("large")
				.setCrust("stuffed")
				.setSauce("tomato")
				.setCheese("goat")
				.addTopping("pepperoni")
				.addTopping("mushrooms")
				.build();

			//  Large pizza with premium options should cost more
			expect(largePizza.price).toBeGreaterThan(smallPizza.price);

			//  Verify specific pricing
			expect(smallPizza.price).toBe(25); // small + thin crust + mozzarella
			expect(largePizza.price).toBe(45 + 8 + 5 + 6); // large + stuffed + goat cheese + 2 toppings
		});

		it("should work with vegan builder and validate vegan toppings", () => {
			const veganPizza = new VeganPizzaBuilder()
				.setSize("medium")
				.setCrust("thin")
				.setSauce("pesto")
				.addTopping("mushrooms")
				.addTopping("spinach")
				.build();

			expect(veganPizza.cheese).toBe("vegan");
			expect(veganPizza.toppings).toContain("mushrooms");
			expect(veganPizza.toppings).toContain("spinach");
		});

		it("should throw error for non-vegan toppings in vegan builder", () => {
			const veganBuilder = new VeganPizzaBuilder()
				.setSize("medium")
				.setCrust("thin")
				.setSauce("tomato");

			expect(() => {
				veganBuilder.addTopping("pepperoni"); // Not vegan
			}).toThrow("pepperoni não é um ingrediente vegano válido");
		});

		it("should create predefined pizzas using Director", () => {
			const margherita = PizzaDirector.createMargherita(
				new TraditionalPizzaBuilder(),
			);
			const pepperoni = PizzaDirector.createPepperoni(
				new TraditionalPizzaBuilder(),
			);
			const veggiePizza = PizzaDirector.createVeggiePizza(
				new VeganPizzaBuilder(),
			);

			//  Margherita specifications
			expect(margherita.size).toBe("medium");
			expect(margherita.crust).toBe("thin");
			expect(margherita.sauce).toBe("tomato");
			expect(margherita.toppings).toContain("basil");

			//  Pepperoni specifications
			expect(pepperoni.size).toBe("large");
			expect(pepperoni.toppings).toContain("pepperoni");

			//  Vegan pizza specifications
			expect(veggiePizza.cheese).toBe("vegan");
			expect(veggiePizza.sauce).toBe("pesto");
			expect(veggiePizza.specialRequests).toContain("Extra bem passada");
		});

		it("should use convenience methods from traditional builder", () => {
			const pizza = new TraditionalPizzaBuilder()
				.setSize("large")
				.setCrust("thick")
				.setSauce("bbq")
				.setCheese("cheddar")
				.addVeggieToppings() // Convenience method
				.makePepperoni() // Convenience method
				.build();

			//  Should have veggie toppings
			expect(pizza.toppings).toContain("mushrooms");
			expect(pizza.toppings).toContain("bell peppers");
			expect(pizza.toppings).toContain("onions");
			expect(pizza.toppings).toContain("olives");

			//  Should have pepperoni additions
			expect(pizza.toppings).toContain("pepperoni");
			expect(pizza.toppings).toContain("extra cheese");
		});

		it("should calculate preparation time based on complexity", () => {
			const simplePizza = new TraditionalPizzaBuilder()
				.setSize("small")
				.setCrust("thin")
				.setSauce("tomato")
				.setCheese("mozzarella")
				.build();

			const complexPizza = new TraditionalPizzaBuilder()
				.setSize("large")
				.setCrust("stuffed")
				.setSauce("tomato")
				.setCheese("mozzarella")
				.addTopping("pepperoni")
				.addTopping("mushrooms")
				.addTopping("olives")
				.addTopping("bell peppers")
				.build();

			//  Complex pizza should take longer
			expect(complexPizza.preparationTime).toBeGreaterThan(
				simplePizza.preparationTime,
			);

			//  Base time is 15 minutes + 2 minutes per topping
			expect(simplePizza.preparationTime).toBe(15);
			expect(complexPizza.preparationTime).toBe(15 + 4 * 2); // 4 toppings
		});

		it("should handle special requests", () => {
			const pizza = new TraditionalPizzaBuilder()
				.setSize("medium")
				.setCrust("thin")
				.setSauce("tomato")
				.setCheese("mozzarella")
				.addSpecialRequest("Cortar em 8 pedaços")
				.addSpecialRequest("Pouco sal")
				.build();

			expect(pizza.specialRequests).toContain("Cortar em 8 pedaços");
			expect(pizza.specialRequests).toContain("Pouco sal");
			expect(pizza.specialRequests).toHaveLength(2);
		});

		it("should provide readable pizza description", () => {
			const pizza = new TraditionalPizzaBuilder()
				.setSize("large")
				.setCrust("thick")
				.setSauce("bbq")
				.setCheese("cheddar")
				.addTopping("pepperoni")
				.addTopping("mushrooms")
				.build();

			const description = pizza.getDescription();

			expect(description).toContain("Pizza large");
			expect(description).toContain("massa thick");
			expect(description).toContain("molho bbq");
			expect(description).toContain("queijo cheddar");
			expect(description).toContain("pepperoni, mushrooms");
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Builder)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
