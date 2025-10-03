import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	PaymentProcessor,
	PaymentProcessorFactory,
	CreditCardStrategy,
	PayPalStrategy,
	BankTransferStrategy,
	CryptocurrencyStrategy,
} from "./after";

describe("Strategy Pattern", () => {
	describe("Before: Without Strategy Pattern", () => {
		it("should demonstrate problems with fixed algorithms", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Strategy Pattern", () => {
		describe("PaymentProcessor (Context)", () => {
			let processor: PaymentProcessor;

			beforeEach(() => {
				processor = new PaymentProcessor();
			});

			it("should provide supported payment methods", () => {
				const methods = processor.getSupportedMethods();
				expect(methods).toContain("credit_card");
				expect(methods).toContain("paypal");
				expect(methods).toContain("bank_transfer");
				expect(methods).toContain("bitcoin");
				expect(methods).toContain("ethereum");
			});

			it("should set and get current strategy", () => {
				expect(processor.getCurrentStrategy()).toBeNull();

				const success = processor.setStrategy("credit_card");
				expect(success).toBe(true);
				expect(processor.getCurrentStrategy()).toBe("Credit Card");

				const failedSet = processor.setStrategy("nonexistent");
				expect(failedSet).toBe(false);
			});

			it("should require strategy to be set before processing", () => {
				const result = processor.processPayment(100, {});

				expect(result.success).toBe(false);
				expect(result.errorCode).toBe("NO_STRATEGY");
				expect(result.message).toBe("Nenhuma estratégia de pagamento definida");
			});

			it("should provide required fields for current strategy", () => {
				processor.setStrategy("credit_card");
				const fields = processor.getRequiredFields();
				expect(fields).toEqual(["number", "cvv", "expiryDate", "holderName"]);

				processor.setStrategy("paypal");
				const paypalFields = processor.getRequiredFields();
				expect(paypalFields).toEqual(["email"]);
			});

			it("should validate payment data using current strategy", () => {
				processor.setStrategy("credit_card");

				const validData = {
					number: "4532123456789012",
					cvv: "123",
					expiryDate: "12/25",
					holderName: "John Doe",
				};

				const invalidData = {
					number: "1234",
					cvv: "12",
				};

				expect(processor.validatePaymentData(validData)).toBe(true);
				expect(processor.validatePaymentData(invalidData)).toBe(false);
			});

			it("should register new strategies", () => {
				const customStrategy = new CryptocurrencyStrategy("litecoin");
				processor.registerStrategy("litecoin", customStrategy);

				expect(processor.getSupportedMethods()).toContain("litecoin");

				processor.setStrategy("litecoin");
				expect(processor.getCurrentStrategy()).toBe("Litecoin");
			});
		});

		describe("CreditCardStrategy", () => {
			let strategy: CreditCardStrategy;

			beforeEach(() => {
				strategy = new CreditCardStrategy();
			});

			it("should process valid credit card payments", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const validCardData = {
					number: "4532123456789012",
					cvv: "123",
					expiryDate: "12/25",
					holderName: "John Doe",
				};

				const result = strategy.processPayment(100, validCardData);

				expect(result.success).toBe(true);
				expect(result.transactionId).toMatch(/^CC-/);
				expect(result.message).toContain("processado com sucesso");

				spy.mockRestore();
			});

			it("should reject invalid credit card data", () => {
				const invalidCardData = {
					number: "1234",
					cvv: "12",
				};

				const result = strategy.processPayment(100, invalidCardData);

				expect(result.success).toBe(false);
				expect(result.errorCode).toBe("INVALID_CARD_DATA");
			});

			it("should validate card data correctly", () => {
				const validData = {
					number: "4532123456789012",
					cvv: "123",
					expiryDate: "12/25",
					holderName: "John Doe",
				};

				const invalidData = {
					number: "1234",
				};

				expect(strategy.validatePaymentData(validData)).toBe(true);
				expect(strategy.validatePaymentData(invalidData)).toBe(false);
			});

			it("should provide correct metadata", () => {
				expect(strategy.getName()).toBe("Credit Card");
				expect(strategy.getRequiredFields()).toEqual([
					"number",
					"cvv",
					"expiryDate",
					"holderName",
				]);
			});
		});

		describe("PayPalStrategy", () => {
			let strategy: PayPalStrategy;

			beforeEach(() => {
				strategy = new PayPalStrategy();
			});

			it("should process valid PayPal payments", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const validPayPalData = {
					email: "user@email.com",
				};

				const result = strategy.processPayment(75, validPayPalData);

				expect(result.success).toBe(true);
				expect(result.transactionId).toMatch(/^PP-/);
				expect(result.redirectUrl).toContain("paypal.com");

				spy.mockRestore();
			});

			it("should reject invalid email", () => {
				const invalidData = {
					email: "invalid-email",
				};

				const result = strategy.processPayment(75, invalidData);

				expect(result.success).toBe(false);
				expect(result.errorCode).toBe("INVALID_PAYPAL_DATA");
			});

			it("should validate email format", () => {
				const validData = { email: "user@email.com" };
				const invalidData = { email: "invalid" };

				expect(strategy.validatePaymentData(validData)).toBe(true);
				expect(strategy.validatePaymentData(invalidData)).toBe(false);
			});

			it("should provide correct metadata", () => {
				expect(strategy.getName()).toBe("PayPal");
				expect(strategy.getRequiredFields()).toEqual(["email"]);
			});
		});

		describe("BankTransferStrategy", () => {
			let strategy: BankTransferStrategy;

			beforeEach(() => {
				strategy = new BankTransferStrategy();
			});

			it("should process valid bank transfers", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const validBankData = {
					accountNumber: "123456789",
					routingNumber: "987654321",
					accountHolderName: "John Doe",
				};

				const result = strategy.processPayment(200, validBankData);

				expect(result.success).toBe(true);
				expect(result.transactionId).toMatch(/^BT-/);
				expect(result.message).toContain("2 dias úteis");

				spy.mockRestore();
			});

			it("should reject invalid bank data", () => {
				const invalidData = {
					accountNumber: "123",
				};

				const result = strategy.processPayment(200, invalidData);

				expect(result.success).toBe(false);
				expect(result.errorCode).toBe("INVALID_BANK_DATA");
			});

			it("should provide correct metadata", () => {
				expect(strategy.getName()).toBe("Bank Transfer");
				expect(strategy.getRequiredFields()).toEqual([
					"accountNumber",
					"routingNumber",
					"accountHolderName",
				]);
			});
		});

		describe("CryptocurrencyStrategy", () => {
			let bitcoinStrategy: CryptocurrencyStrategy;
			let ethereumStrategy: CryptocurrencyStrategy;

			beforeEach(() => {
				bitcoinStrategy = new CryptocurrencyStrategy("bitcoin");
				ethereumStrategy = new CryptocurrencyStrategy("ethereum");
			});

			it("should process valid cryptocurrency payments", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const validBitcoinData = {
					walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
				};

				const result = bitcoinStrategy.processPayment(100, validBitcoinData);

				expect(result.success).toBe(true);
				expect(result.transactionId).toMatch(/^BITCOIN-/);
				expect(result.message).toContain("BITCOIN");

				spy.mockRestore();
			});

			it("should validate wallet addresses correctly", () => {
				const validBitcoinData = {
					walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
				};

				const validEthereumData = {
					walletAddress: "0x742E4c4F8B4C8e4F8B4c4F8B4c4F8B4c4F8B4c4F",
				};

				const invalidData = {
					walletAddress: "invalid-address",
				};

				expect(bitcoinStrategy.validatePaymentData(validBitcoinData)).toBe(
					true,
				);
				expect(ethereumStrategy.validatePaymentData(validEthereumData)).toBe(
					true,
				);
				expect(bitcoinStrategy.validatePaymentData(invalidData)).toBe(false);
			});

			it("should provide correct metadata for different cryptocurrencies", () => {
				expect(bitcoinStrategy.getName()).toBe("Bitcoin");
				expect(ethereumStrategy.getName()).toBe("Ethereum");

				expect(bitcoinStrategy.getRequiredFields()).toEqual(["walletAddress"]);
				expect(ethereumStrategy.getRequiredFields()).toEqual(["walletAddress"]);
			});
		});

		describe("PaymentProcessorFactory", () => {
			it("should create processor with default strategy", () => {
				const processor = PaymentProcessorFactory.createProcessor("paypal");
				expect(processor.getCurrentStrategy()).toBe("PayPal");
			});

			it("should create e-commerce processor with additional strategies", () => {
				const processor = PaymentProcessorFactory.createECommerceProcessor();
				const methods = processor.getSupportedMethods();

				expect(methods).toContain("apple_pay");
				expect(methods).toContain("google_pay");
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Strategy)"),
			);

			spy.mockRestore();
		});
	});
});
