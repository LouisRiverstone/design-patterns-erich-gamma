import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	EmailNotificationCreator,
	SMSNotificationCreator,
	PushNotificationCreator,
	NotificationService,
} from "./after";

describe("Factory Method Pattern", () => {
	describe("Before: Without Factory Method", () => {
		it("should demonstrate problems with direct instantiation", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Factory Method Pattern", () => {
		it("should create email notifications with proper validation", () => {
			const emailCreator = new EmailNotificationCreator();
			const notification = emailCreator.createNotification(
				"Test",
				"Message",
				"test@example.com",
			);

			expect(notification.validate()).toBe(true);
			expect(notification.getStatus()).toBe("Email enviado via SMTP");
		});

		it("should create SMS notifications with proper validation", () => {
			const smsCreator = new SMSNotificationCreator();
			const notification = smsCreator.createNotification(
				"Test",
				"Message",
				"11999999999",
			);

			expect(notification.validate()).toBe(true);
			expect(notification.getStatus()).toBe("SMS enviado via gateway");
		});

		it("should create push notifications with proper validation", () => {
			const pushCreator = new PushNotificationCreator();
			const notification = pushCreator.createNotification(
				"Test",
				"Message",
				"valid-device-token-123",
			);

			expect(notification.validate()).toBe(true);
			expect(notification.getStatus()).toBe("Push enviado via FCM");
		});

		it("should validate recipients correctly for each type", () => {
			const emailCreator = new EmailNotificationCreator();
			const smsCreator = new SMSNotificationCreator();
			const pushCreator = new PushNotificationCreator();

			//  Valid recipients
			expect(emailCreator.validateRecipient("test@example.com")).toBe(true);
			expect(smsCreator.validateRecipient("11999999999")).toBe(true);
			expect(pushCreator.validateRecipient("valid-device-token-123")).toBe(
				true,
			);

			// Invalid recipients
			expect(emailCreator.validateRecipient("invalid-email")).toBe(false);
			expect(smsCreator.validateRecipient("abc")).toBe(false);
			expect(pushCreator.validateRecipient("short")).toBe(false);
		});

		it("should handle bulk notifications with detailed results", () => {
			const emailCreator = new EmailNotificationCreator();
			const recipients = [
				"test1@example.com",
				"invalid-email",
				"test2@example.com",
			];

			const result = emailCreator.sendBulkNotifications(
				"Newsletter",
				"Test message",
				recipients,
			);

			expect(result.sent).toBeGreaterThanOrEqual(0);
			expect(result.failed).toBeGreaterThanOrEqual(0);
			expect(result.sent + result.failed).toBe(recipients.length);
			expect(result.details).toHaveLength(recipients.length);
		});

		it("should support email-specific functionality", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			const emailCreator = new EmailNotificationCreator();

			const result = emailCreator.sendWithAttachment(
				"Contract",
				"Please review",
				"client@company.com",
				["contract.pdf", "terms.pdf"],
			);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("📎 Anexos: contract.pdf, terms.pdf"),
			);

			consoleSpy.mockRestore();
		});

		it("should support SMS-specific functionality", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			const smsCreator = new SMSNotificationCreator();

			smsCreator.sendShortCode("11999999999", "1234");

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining(" Enviando SMS para 11999999999"),
			);
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Código: Seu código de verificação: 1234"),
			);

			consoleSpy.mockRestore();
		});

		it("should support push-specific functionality", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			const pushCreator = new PushNotificationCreator();

			pushCreator.sendSilentNotification("device-token-123", {
				type: "update",
				version: "1.2.0",
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("🔔 Enviando push para dispositivo"),
			);

			consoleSpy.mockRestore();
		});

		describe("NotificationService Integration", () => {
			it("should register and use different notification creators", () => {
				const service = new NotificationService();

				const availableTypes = service.getAvailableTypes();
				expect(availableTypes).toContain("email");
				expect(availableTypes).toContain("sms");
				expect(availableTypes).toContain("push");
			});

			it("should send notifications through registered creators", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const service = new NotificationService();

				const emailResult = service.sendNotification(
					"email",
					"Test",
					"Message",
					"test@example.com",
				);
				const smsResult = service.sendNotification(
					"sms",
					"Test",
					"Message",
					"11999999999",
				);
				const pushResult = service.sendNotification(
					"push",
					"Test",
					"Message",
					"device-token-123",
				);

				// Results depend on random success rate, but should be boolean
				expect(typeof emailResult).toBe("boolean");
				expect(typeof smsResult).toBe("boolean");
				expect(typeof pushResult).toBe("boolean");

				consoleSpy.mockRestore();
			});

			it("should handle unsupported notification types gracefully", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const service = new NotificationService();

				const result = service.sendNotification(
					"unsupported",
					"Test",
					"Message",
					"recipient",
				);

				expect(result).toBe(false);
				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("Tipo não suportado: unsupported"),
				);

				consoleSpy.mockRestore();
			});

			it("should handle bulk notifications with mixed results", () => {
				const service = new NotificationService();
				const recipients = [
					"test1@example.com",
					"invalid-email",
					"test2@example.com",
				];

				const result = service.sendBulkNotifications(
					"email",
					"Test",
					"Message",
					recipients,
				);

				expect(result.sent + result.failed).toBe(recipients.length);
				expect(result.details).toHaveLength(recipients.length);
			});

			it("should allow registration of new creators", () => {
				const service = new NotificationService();
				const customCreator = new EmailNotificationCreator(); // Using email as example

				service.registerCreator("custom", customCreator);

				const availableTypes = service.getAvailableTypes();
				expect(availableTypes).toContain("custom");
			});
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Factory Method)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
