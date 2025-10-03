import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import { demonstrateSolution } from "./after";

describe("Abstract Factory Pattern", () => {
	// Testa o problema da abordagem sem padrão
	describe("Before: Without Abstract Factory", () => {
		it("should create orders but without guaranteed compatibility", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			// Verifica que problemas são demonstrados
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	// Testa a solução com Abstract Factory
	describe("After: With Abstract Factory", () => {
		it("should create compatible digital products and payments", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			// Verifica que a solução foi demonstrada
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Abstract Factory)"),
			);

			consoleSpy.mockRestore();
		});

		it("should guarantee digital products use PIX payment", async () => {
			const { DigitalECommerceFactory } = await import("./after");

			const factory = new (DigitalECommerceFactory as any)();
			const order = factory.createOrder("Test Product", 100);

			//  Digital products always use PIX (no transaction fee)
			expect(order.payment.getTransactionFee()).toBe(0);
			expect(order.product.category).toBe("digital");
			expect(order.shippingInfo).toContain("Download imediato");
		});

		it("should guarantee physical products use credit card payment", async () => {
			const { PhysicalECommerceFactory } = await import("./after");

			const factory = new (PhysicalECommerceFactory as any)();
			const order = factory.createOrder("Test Product", 100);

			//  Physical products always use credit card (with transaction fee)
			expect(order.payment.getTransactionFee()).toBeGreaterThan(0);
			expect(order.product.category).toBe("physical");
			expect(order.shippingInfo).toContain("Entrega em");
		});

		it("should allow easy switching between factory types", async () => {
			const {
				DigitalECommerceFactory,
				PhysicalECommerceFactory,
				OrderService,
			} = await import("./after");

			const digitalFactory = new (DigitalECommerceFactory as any)();
			const physicalFactory = new (PhysicalECommerceFactory as any)();
			const orderService = new (OrderService as any)(digitalFactory);

			//  Start with digital
			const digitalOrder = orderService.createOrder("Digital Product", 50);
			expect(digitalOrder.product.category).toBe("digital");
			expect(digitalOrder.payment.getTransactionFee()).toBe(0);

			//  Switch to physical
			orderService.setFactory(physicalFactory);
			const physicalOrder = orderService.createOrder("Physical Product", 50);
			expect(physicalOrder.product.category).toBe("physical");
			expect(physicalOrder.payment.getTransactionFee()).toBeGreaterThan(0);
		});

		it("should process payments correctly for both types", async () => {
			const { DigitalECommerceFactory, PhysicalECommerceFactory } =
				await import("./after");

			const digitalFactory = new (DigitalECommerceFactory as any)();
			const physicalFactory = new (PhysicalECommerceFactory as any)();

			const digitalOrder = digitalFactory.createOrder("E-book", 29.9);
			const physicalOrder = physicalFactory.createOrder("Book", 49.9);

			//  Both payment methods should work
			expect(digitalOrder.payment.process(digitalOrder.total)).toBe(true);
			expect(physicalOrder.payment.process(physicalOrder.total)).toBe(true);

			//  Should fail with invalid amounts
			expect(digitalOrder.payment.process(0)).toBe(false);
			expect(physicalOrder.payment.process(-10)).toBe(false);
		});

		it("should calculate total including transaction fees", async () => {
			const { DigitalECommerceFactory, PhysicalECommerceFactory } =
				await import("./after");

			const digitalFactory = new (DigitalECommerceFactory as any)();
			const physicalFactory = new (PhysicalECommerceFactory as any)();

			const productPrice = 100;

			const digitalOrder = digitalFactory.createOrder("Digital", productPrice);
			const physicalOrder = physicalFactory.createOrder(
				"Physical",
				productPrice,
			);

			//  Digital: no transaction fee
			expect(digitalOrder.total).toBe(productPrice + 0);

			//  Physical: includes transaction fee
			expect(physicalOrder.total).toBe(productPrice + 2.99);
		});
	});
});
