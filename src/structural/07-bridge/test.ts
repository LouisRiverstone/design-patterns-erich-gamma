import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	EmailSender,
	SMSSender,
	PushSender,
	UrgentNotification,
	NormalNotification,
	MarketingNotification,
	NotificationFactory,
	NotificationSystem,
} from "./after";

describe("Bridge Pattern", () => {
	describe("Before: Without Bridge", () => {
		it("should demonstrate class explosion problem", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Bridge Pattern", () => {
		describe("Implementation (Senders)", () => {
			it("should send via email with metadata", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const sender = new EmailSender();

				sender.sendMessage("Test message", {
					priority: "high",
					subject: "Test",
				});

				expect(consoleSpy).toHaveBeenCalledWith(
					" Enviando email: Test message",
				);
				expect(sender.getPlatformName()).toBe("Email");

				consoleSpy.mockRestore();
			});

			it("should send via SMS with metadata", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const sender = new SMSSender();

				sender.sendMessage("Test SMS", {
					priority: "high",
					shortUrl: "bit.ly/test",
				});

				expect(consoleSpy).toHaveBeenCalledWith(" Enviando SMS: Test SMS");
				expect(sender.getPlatformName()).toBe("SMS");

				consoleSpy.mockRestore();
			});

			it("should send via push with metadata", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const sender = new PushSender();

				sender.sendMessage("Test push", { priority: "high", icon: "warning" });

				expect(consoleSpy).toHaveBeenCalledWith("🔔 Enviando push: Test push");
				expect(sender.getPlatformName()).toBe("Push Notification");

				consoleSpy.mockRestore();
			});
		});

		describe("Abstraction (Notifications)", () => {
			it("should create urgent notification with any sender", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const emailSender = new EmailSender();
				const urgent = new UrgentNotification(emailSender);

				urgent.send("Emergency message");

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("🚨 URGENTE via Email:"),
				);
				expect(urgent.getSenderInfo()).toBe("Email");

				consoleSpy.mockRestore();
			});

			it("should create normal notification with any sender", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const smsSender = new SMSSender();
				const normal = new NormalNotification(smsSender);

				normal.send("Regular message");

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("📢 Normal via SMS:"),
				);

				consoleSpy.mockRestore();
			});

			it("should create marketing notification with specific metadata", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const pushSender = new PushSender();
				const marketing = new MarketingNotification(pushSender);

				marketing.send("Special offer");

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining(" Marketing via Push Notification:"),
				);

				consoleSpy.mockRestore();
			});
		});

		describe("Factory Integration", () => {
			it("should create notifications using factory", () => {
				const notification = NotificationFactory.create("email", "urgent");

				expect(notification).toBeInstanceOf(UrgentNotification);
				expect(notification.getSenderInfo()).toBe("Email");
			});

			it("should list available senders and types", () => {
				const senders = NotificationFactory.getAvailableSenders();
				const types = NotificationFactory.getAvailableTypes();

				expect(senders).toContain("email");
				expect(senders).toContain("sms");
				expect(senders).toContain("push");

				expect(types).toContain("urgent");
				expect(types).toContain("normal");
				expect(types).toContain("marketing");
			});

			it("should handle invalid combinations", () => {
				expect(() => {
					NotificationFactory.create("invalid", "urgent");
				}).toThrow("Sender não suportado");

				expect(() => {
					NotificationFactory.create("email", "invalid");
				}).toThrow("Tipo não suportado");
			});
		});

		describe("Notification System", () => {
			it("should send notification with template rendering", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const system = new NotificationSystem();

				system.sendNotification("email", "normal", "order_confirmed", {
					orderId: "123",
				});

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("Seu pedido #123 foi confirmado!"),
				);

				consoleSpy.mockRestore();
			});

			it("should broadcast to multiple platforms", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const system = new NotificationSystem();

				system.broadcastNotification("urgent", "System maintenance", {}, [
					"email",
					"sms",
				]);

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("📡 Broadcast"),
				);

				consoleSpy.mockRestore();
			});

			it("should handle template variables", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const system = new NotificationSystem();

				system.sendNotification("sms", "marketing", "promotion", {
					discount: 50,
				});

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("50% de desconto!"),
				);

				consoleSpy.mockRestore();
			});
		});

		it("should demonstrate flexibility - same abstraction, different implementations", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			// Same urgent notification type with different senders
			const emailUrgent = new UrgentNotification(new EmailSender());
			const smsUrgent = new UrgentNotification(new SMSSender());
			const pushUrgent = new UrgentNotification(new PushSender());

			const message = "Critical system alert";
			emailUrgent.send(message);
			smsUrgent.send(message);
			pushUrgent.send(message);

			// All should handle urgent notifications but through different platforms
			const logs = consoleSpy.mock.calls.map((call) => call[0]);
			expect(logs.some((log) => log.includes("🚨 URGENTE via Email"))).toBe(
				true,
			);
			expect(logs.some((log) => log.includes("🚨 URGENTE via SMS"))).toBe(true);
			expect(
				logs.some((log) => log.includes("🚨 URGENTE via Push Notification")),
			).toBe(true);

			consoleSpy.mockRestore();
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Bridge)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
