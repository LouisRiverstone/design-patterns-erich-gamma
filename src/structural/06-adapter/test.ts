import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	LegacyPaymentAdapter,
	ExternalPaymentAdapter,
	PaymentAdapterFactory,
	UnifiedPaymentService,
	ModernECommerceSystem,
} from "./after";

describe("Adapter Pattern", () => {
	describe("Before: Without Adapter", () => {
		it("should demonstrate problems with incompatible interfaces", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Adapter Pattern", () => {
		describe("LegacyPaymentAdapter", () => {
			it("should adapt legacy payment gateway correctly", async () => {
				const adapter = new LegacyPaymentAdapter();

				const result = await adapter.processPayment(
					100,
					"USD",
					"4111111111111111",
				);

				expect(result.success).toBeDefined();
				expect(result.transactionId).toContain("legacy_");
				expect(result.message).toContain("legado");
				expect(result.timestamp).toBeInstanceOf(Date);
				expect(result.providerResponse).toBeDefined();
			});

			it("should validate cards using legacy format", async () => {
				const adapter = new LegacyPaymentAdapter();

				const validCard = await adapter.validateCard("4111111111111111");
				const invalidCard = await adapter.validateCard("123");

				expect(validCard).toBe(true);
				expect(invalidCard).toBe(false);
			});

			it("should process refunds correctly", async () => {
				const adapter = new LegacyPaymentAdapter();

				const refund = await adapter.refundPayment("legacy_123456");

				expect(refund.success).toBeDefined();
				expect(refund.refundId).toContain("ref_");
				expect(refund.originalTransactionId).toBe("legacy_123456");
				expect(refund.timestamp).toBeInstanceOf(Date);
			});

			it("should return correct provider name", () => {
				const adapter = new LegacyPaymentAdapter();

				expect(adapter.getProviderName()).toBe("Legacy Payment Gateway");
			});
		});

		describe("ExternalPaymentAdapter", () => {
			it("should adapt external API correctly", async () => {
				const adapter = new ExternalPaymentAdapter();

				const result = await adapter.processPayment(
					200,
					"EUR",
					"5555555555554444",
				);

				expect(result.success).toBeDefined();
				expect(result.transactionId).toContain("ext_");
				expect(result.message).toContain("external");
				expect(result.timestamp).toBeInstanceOf(Date);
				expect(result.providerResponse).toBeDefined();
			});

			it("should validate cards using external API format", async () => {
				const adapter = new ExternalPaymentAdapter();

				const validCard = await adapter.validateCard("4111111111111111");
				const invalidCard = await adapter.validateCard("abc");

				expect(validCard).toBe(true);
				expect(invalidCard).toBe(false);
			});

			it("should process refunds with external API", async () => {
				const adapter = new ExternalPaymentAdapter();

				const refund = await adapter.refundPayment("ext_abc123");

				expect(refund.success).toBeDefined();
				expect(refund.refundId).toContain("refund_");
				expect(refund.originalTransactionId).toBe("ext_abc123");
			});

			it("should return correct provider name", () => {
				const adapter = new ExternalPaymentAdapter();

				expect(adapter.getProviderName()).toBe("External Payment API");
			});
		});

		describe("PaymentAdapterFactory", () => {
			it("should create legacy adapter", () => {
				const adapter = PaymentAdapterFactory.createAdapter("legacy");

				expect(adapter).toBeInstanceOf(LegacyPaymentAdapter);
			});

			it("should create external adapter", () => {
				const adapter = PaymentAdapterFactory.createAdapter("external");

				expect(adapter).toBeInstanceOf(ExternalPaymentAdapter);
			});

			it("should return null for unknown adapter type", () => {
				const adapter = PaymentAdapterFactory.createAdapter("unknown");

				expect(adapter).toBeNull();
			});

			it("should list available adapter types", () => {
				const types = PaymentAdapterFactory.getAvailableTypes();

				expect(types).toContain("legacy");
				expect(types).toContain("external");
				expect(types.length).toBeGreaterThanOrEqual(2);
			});

			it("should allow registering new adapters", () => {
				const mockAdapter = {
					processPayment: vi.fn(),
					validateCard: vi.fn(),
					refundPayment: vi.fn(),
					getProviderName: () => "Mock Provider",
				};

				PaymentAdapterFactory.registerAdapter("mock", () => mockAdapter);

				const adapter = PaymentAdapterFactory.createAdapter("mock");
				expect(adapter).toBe(mockAdapter);

				const types = PaymentAdapterFactory.getAvailableTypes();
				expect(types).toContain("mock");
			});
		});

		describe("UnifiedPaymentService", () => {
			it("should process payments through unified interface", async () => {
				const service = new UnifiedPaymentService();

				const result = await service.processPayment(
					"legacy",
					150,
					"BRL",
					"4111111111111111",
				);

				expect(result.success).toBeDefined();
				expect(typeof result.success).toBe("boolean");
				expect(result.transactionId).toBeDefined();
				expect(result.message).toBeDefined();
				expect(result.timestamp).toBeInstanceOf(Date);
			});

			it("should handle invalid provider gracefully", async () => {
				const service = new UnifiedPaymentService();

				const result = await service.processPayment(
					"invalid",
					100,
					"USD",
					"4111111111111111",
				);

				expect(result.success).toBe(false);
				expect(result.message).toContain("não suportado");
			});

			it("should validate cards before processing", async () => {
				const service = new UnifiedPaymentService();

				const result = await service.processPayment(
					"legacy",
					100,
					"USD",
					"123",
				);

				expect(result.success).toBe(false);
				expect(result.message).toContain("inválido");
			});

			it("should process refunds through unified interface", async () => {
				const service = new UnifiedPaymentService();

				const refund = await service.refundPayment("external", "ext_123456");

				expect(refund.success).toBeDefined();
				expect(refund.refundId).toBeDefined();
				expect(refund.originalTransactionId).toBe("ext_123456");
			});

			it("should list available providers", () => {
				const service = new UnifiedPaymentService();

				const providers = service.getAvailableProviders();

				expect(providers).toContain("legacy");
				expect(providers).toContain("external");
			});
		});

		describe("ModernECommerceSystem", () => {
			it("should process orders with preferred provider", async () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const ecommerce = new ModernECommerceSystem();

				await ecommerce.processOrder(
					"ORDER-001",
					299.9,
					"4111111111111111",
					"legacy",
				);

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("Processando pedido ORDER-001"),
				);

				consoleSpy.mockRestore();
			});

			it("should handle invalid cards gracefully", async () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const ecommerce = new ModernECommerceSystem();

				await ecommerce.processOrder("ORDER-002", 150.0, "123");

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("inválido"),
				);

				consoleSpy.mockRestore();
			});

			it("should process refunds correctly", async () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const ecommerce = new ModernECommerceSystem();

				await ecommerce.processRefund("ORDER-001", "legacy_123456", "legacy");

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("Processando estorno"),
				);

				consoleSpy.mockRestore();
			});

			it("should use fallback provider when preferred is not available", async () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const ecommerce = new ModernECommerceSystem();

				// Should fallback to first available provider
				await ecommerce.processOrder(
					"ORDER-003",
					99.9,
					"4111111111111111",
					"nonexistent",
				);

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("Processando pedido ORDER-003"),
				);

				consoleSpy.mockRestore();
			});
		});

		it("should demonstrate different providers working uniformly", async () => {
			const service = new UnifiedPaymentService();

			const legacyResult = await service.processPayment(
				"legacy",
				100,
				"USD",
				"4111111111111111",
			);
			const externalResult = await service.processPayment(
				"external",
				100,
				"USD",
				"4111111111111111",
			);

			// Both should have the same interface structure
			expect(legacyResult).toHaveProperty("success");
			expect(legacyResult).toHaveProperty("transactionId");
			expect(legacyResult).toHaveProperty("message");
			expect(legacyResult).toHaveProperty("timestamp");

			expect(externalResult).toHaveProperty("success");
			expect(externalResult).toHaveProperty("transactionId");
			expect(externalResult).toHaveProperty("message");
			expect(externalResult).toHaveProperty("timestamp");

			// But transaction IDs should be from different systems
			if (legacyResult.success) {
				expect(legacyResult.transactionId).toContain("legacy_");
			}
			if (externalResult.success) {
				expect(externalResult.transactionId).toContain("ext_");
			}
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Adapter)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
