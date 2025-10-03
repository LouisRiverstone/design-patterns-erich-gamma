import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	type NotificationComponent,
	EmailNotification,
	NotificationDecorator,
	SMSDecorator,
	SlackDecorator,
	DiscordDecorator,
	WhatsAppDecorator,
	PriorityDecorator,
	EncryptionDecorator,
	NotificationFactory,
	NotificationManager,
} from "./after";

describe("Decorator Pattern", () => {
	describe("Before: Without Decorator", () => {
		it("should demonstrate problems with inheritance explosion", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Decorator Pattern", () => {
		describe("Base Components", () => {
			it("should implement basic email notification", () => {
				const email = new EmailNotification("Test message");

				expect(email.send()).toBe(" Email: Test message");
				expect(email.getCost()).toBe(0.01);
				expect(email.getChannels()).toEqual(["email"]);
			});
		});

		describe("Individual Decorators", () => {
			let baseNotification: NotificationComponent;

			beforeEach(() => {
				baseNotification = new EmailNotification("Test message");
			});

			it("should add SMS functionality", () => {
				const smsNotification = new SMSDecorator(
					baseNotification,
					"+55-11-99999-0000",
				);

				const result = smsNotification.send();
				expect(result).toContain(" Email: Test message");
				expect(result).toContain(" SMS para +55-11-99999-0000");
				expect(smsNotification.getCost()).toBe(0.11); // 0.01 + 0.10
				expect(smsNotification.getChannels()).toEqual(["email", "sms"]);
			});

			it("should add Slack functionality", () => {
				const slackNotification = new SlackDecorator(
					baseNotification,
					"#testing",
				);

				const result = slackNotification.send();
				expect(result).toContain(" Email: Test message");
				expect(result).toContain(" Slack #testing");
				expect(slackNotification.getCost()).toBeCloseTo(0.06); // 0.01 + 0.05
				expect(slackNotification.getChannels()).toEqual(["email", "slack"]);
			});

			it("should add Discord functionality", () => {
				const discordNotification = new DiscordDecorator(
					baseNotification,
					"Test Server",
				);

				const result = discordNotification.send();
				expect(result).toContain(" Email: Test message");
				expect(result).toContain(" Discord [Test Server]");
				expect(discordNotification.getCost()).toBe(0.04); // 0.01 + 0.03
				expect(discordNotification.getChannels()).toEqual(["email", "discord"]);
			});

			it("should add WhatsApp functionality", () => {
				const whatsappNotification = new WhatsAppDecorator(
					baseNotification,
					"+55-11-88888-0000",
				);

				const result = whatsappNotification.send();
				expect(result).toContain(" Email: Test message");
				expect(result).toContain("💚 WhatsApp para +55-11-88888-0000");
				expect(whatsappNotification.getCost()).toBe(0.03); // 0.01 + 0.02
				expect(whatsappNotification.getChannels()).toEqual([
					"email",
					"whatsapp",
				]);
			});

			it("should add priority functionality", () => {
				const priorityNotification = new PriorityDecorator(
					baseNotification,
					"urgente",
				);

				const result = priorityNotification.send();
				expect(result).toContain("🔴 [URGENTE]");
				expect(result).toContain(" Email: Test message");
				expect(priorityNotification.getCost()).toBe(0.02); // 0.01 * 2 (urgente multiplier)
				expect(priorityNotification.getChannels()).toEqual(["email"]);
			});

			it("should handle different priority levels", () => {
				const priorities = ["baixa", "normal", "alta", "urgente"] as const;
				const expectedIcons = ["🟢", "🟡", "🟠", "🔴"];
				const expectedMultipliers = [1, 1, 1.5, 2];

				priorities.forEach((priority, index) => {
					const notification = new PriorityDecorator(
						baseNotification,
						priority,
					);
					const result = notification.send();

					expect(result).toContain(expectedIcons[index]);
					expect(result).toContain(`[${priority.toUpperCase()}]`);
					expect(notification.getCost()).toBe(
						0.01 * expectedMultipliers[index],
					);
				});
			});

			it("should add encryption functionality", () => {
				const encryptedNotification = new EncryptionDecorator(
					baseNotification,
					"base64",
				);

				const result = encryptedNotification.send();
				expect(result).toContain(" [CRIPTOGRAFADO-BASE64]");
				expect(encryptedNotification.getCost()).toBe(0.02); // 0.01 + 0.01
				expect(encryptedNotification.getChannels()).toEqual(["email"]);
			});

			it("should handle AES encryption", () => {
				const encryptedNotification = new EncryptionDecorator(
					baseNotification,
					"aes",
				);

				const result = encryptedNotification.send();
				expect(result).toContain(" [CRIPTOGRAFADO-AES]");
				expect(result).toContain("aes-");
				expect(encryptedNotification.getCost()).toBe(0.02);
			});
		});

		describe("Decorator Composition", () => {
			it("should allow multiple decorators in sequence", () => {
				let notification: NotificationComponent = new EmailNotification(
					"Order confirmed",
				);
				notification = new SMSDecorator(notification);
				notification = new SlackDecorator(notification, "#orders");
				notification = new PriorityDecorator(notification, "alta");

				const result = notification.send();
				expect(result).toContain("🟠 [ALTA]");
				expect(result).toContain(" Email: Order confirmed");
				expect(result).toContain(" SMS");
				expect(result).toContain(" Slack #orders");

				expect(notification.getCost()).toBeCloseTo(0.24); // (0.01 + 0.10 + 0.05) * 1.5
				expect(notification.getChannels()).toEqual(["email", "sms", "slack"]);
			});

			it("should preserve order of decorators", () => {
				let notification1: NotificationComponent = new EmailNotification(
					"Test",
				);
				notification1 = new PriorityDecorator(notification1, "alta");
				notification1 = new EncryptionDecorator(notification1);

				let notification2: NotificationComponent = new EmailNotification(
					"Test",
				);
				notification2 = new EncryptionDecorator(notification2);
				notification2 = new PriorityDecorator(notification2, "alta");

				const result1 = notification1.send();
				const result2 = notification2.send();

				// Different orders should produce different results
				expect(result1).not.toBe(result2);
				expect(result1).toContain(" [CRIPTOGRAFADO");
				expect(result2).toContain("🟠 [ALTA]");
			});

			it("should allow complex combinations", () => {
				let notification: NotificationComponent = new EmailNotification(
					"Security alert!",
				);
				notification = new SMSDecorator(notification, "+55-11-99999-0001");
				notification = new SlackDecorator(notification, "#security");
				notification = new DiscordDecorator(notification, "Security Team");
				notification = new WhatsAppDecorator(notification, "+55-11-88888-0001");
				notification = new PriorityDecorator(notification, "urgente");
				notification = new EncryptionDecorator(notification, "aes");

				const result = notification.send();
				expect(result).toContain(" [CRIPTOGRAFADO-AES]");
				// When encryption is applied last, it encrypts the entire message including priority
				expect(result).toContain("aes-"); // AES signature
				expect(notification.getChannels()).toHaveLength(5);

				// Cost: ((0.01 + 0.10 + 0.05 + 0.03 + 0.02) * 2) + 0.01 = 0.43
				expect(notification.getCost()).toBeCloseTo(0.43);
				expect(notification.getChannels()).toHaveLength(5);
			});
		});

		describe("NotificationFactory", () => {
			it("should create basic notifications", () => {
				const notification = NotificationFactory.createBasic("Welcome!");

				expect(notification.send()).toBe(" Email: Welcome!");
				expect(notification.getCost()).toBe(0.01);
				expect(notification.getChannels()).toEqual(["email"]);
			});

			it("should create multi-channel notifications", () => {
				const notification = NotificationFactory.createMultiChannel(
					"Order confirmed!",
					["sms", "slack"],
					{
						phoneNumber: "+55-11-99999-1234",
						slackChannel: "#orders",
					},
				);

				const result = notification.send();
				expect(result).toContain(" Email: Order confirmed!");
				expect(result).toContain(" SMS para +55-11-99999-1234");
				expect(result).toContain(" Slack #orders");
				expect(notification.getChannels()).toEqual(["email", "sms", "slack"]);
			});

			it("should create notifications with priority and encryption", () => {
				const notification = NotificationFactory.createMultiChannel(
					"Security breach!",
					["sms", "discord"],
					{
						priority: "urgente",
						encrypt: true,
						discordServer: "Security Team",
					},
				);

				const result = notification.send();
				expect(result).toContain(" [CRIPTOGRAFADO");
				// When encryption is applied last, the priority message is encrypted
				expect(result.toUpperCase()).toContain("BASE64");
			});

			it("should handle all channel types", () => {
				const notification = NotificationFactory.createMultiChannel(
					"All channels test",
					["sms", "slack", "discord", "whatsapp"],
				);

				const channels = notification.getChannels();
				expect(channels).toContain("email");
				expect(channels).toContain("sms");
				expect(channels).toContain("slack");
				expect(channels).toContain("discord");
				expect(channels).toContain("whatsapp");
				expect(channels).toHaveLength(5);
			});
		});

		describe("NotificationManager", () => {
			let manager: NotificationManager;

			beforeEach(() => {
				manager = new NotificationManager();
			});

			it("should manage multiple notifications", () => {
				const notification1 = NotificationFactory.createBasic("Message 1");
				const notification2 = NotificationFactory.createBasic("Message 2");

				manager.addNotification("msg1", notification1);
				manager.addNotification("msg2", notification2);

				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				const result1 = manager.sendNotification("msg1");
				const result2 = manager.sendNotification("msg2");

				expect(result1).toContain("Message 1");
				expect(result2).toContain("Message 2");

				consoleSpy.mockRestore();
			});

			it("should return null for non-existent notifications", () => {
				const result = manager.sendNotification("non-existent");
				expect(result).toBeNull();
			});

			it("should calculate statistics correctly", () => {
				const basic = NotificationFactory.createBasic("Basic");
				const multi = NotificationFactory.createMultiChannel("Multi", [
					"sms",
					"slack",
				]);

				manager.addNotification("basic", basic);
				manager.addNotification("multi", multi);

				const stats = manager.getStatistics();

				expect(stats.total).toBe(2);
				expect(stats.totalCost).toBeCloseTo(0.17); // 0.01 + 0.16
				expect(stats.channelUsage.email).toBe(2);
				expect(stats.channelUsage.sms).toBe(1);
				expect(stats.channelUsage.slack).toBe(1);
			});

			it("should clear all notifications", () => {
				const notification = NotificationFactory.createBasic("Test");
				manager.addNotification("test", notification);

				let stats = manager.getStatistics();
				expect(stats.total).toBe(1);

				manager.clear();

				stats = manager.getStatistics();
				expect(stats.total).toBe(0);
				expect(stats.totalCost).toBe(0);
			});

			it("should send all notifications", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				const notification1 = NotificationFactory.createBasic("Message 1");
				const notification2 = NotificationFactory.createMultiChannel(
					"Message 2",
					["sms"],
				);

				manager.addNotification("msg1", notification1);
				manager.addNotification("msg2", notification2);

				manager.sendAll();

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining("📨 Enviando todas as notificações"),
				);

				consoleSpy.mockRestore();
			});
		});

		it("should demonstrate complete solution", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Decorator)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
