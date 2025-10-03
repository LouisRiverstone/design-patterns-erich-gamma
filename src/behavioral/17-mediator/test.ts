import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	ChatRoom,
	ModeratedChatRoom,
	ChatUser,
} from "./after";

describe("Mediator Pattern", () => {
	describe("Before: Without Mediator Pattern", () => {
		it("should demonstrate problems with direct coupling", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Mediator Pattern", () => {
		describe("ChatRoom (Basic Mediator)", () => {
			let chatRoom: ChatRoom;
			let alice: ChatUser;
			let bob: ChatUser;
			let charlie: ChatUser;

			beforeEach(() => {
				chatRoom = new ChatRoom();
				alice = new ChatUser("Alice");
				bob = new ChatUser("Bob");
				charlie = new ChatUser("Charlie");

				alice.setMediator(chatRoom);
				bob.setMediator(chatRoom);
				charlie.setMediator(chatRoom);
			});

			it("should allow users to join and leave room", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				alice.joinRoom();
				expect(chatRoom.getUserCount()).toBe(1);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Alice entrou no chat"),
				);

				alice.leaveRoom();
				expect(chatRoom.getUserCount()).toBe(0);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Alice saiu do chat"),
				);

				spy.mockRestore();
			});

			it("should handle public messages", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				alice.joinRoom();
				bob.joinRoom();

				alice.sendMessage("Hello everyone!");

				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("[PÚBLICO] Alice: Hello everyone!"),
				);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("[Bob] Recebeu de Alice: Hello everyone!"),
				);

				spy.mockRestore();
			});

			it("should handle private messages", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				alice.joinRoom();
				bob.joinRoom();
				charlie.joinRoom();

				alice.sendMessage("Secret message", bob);

				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("[PRIVADO] Alice → Bob: Secret message"),
				);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("[Bob] Recebeu de Alice: Secret message"),
				);
				// Charlie should not receive the message
				expect(spy).not.toHaveBeenCalledWith(
					expect.stringContaining("[Charlie]"),
				);

				spy.mockRestore();
			});

			it("should prevent messages from users not in room", () => {
				alice.joinRoom();
				// bob is not in room

				expect(() => bob.sendMessage("Hello")).toThrow("User not in chat room");
			});

			it("should prevent private messages to users not in room", () => {
				alice.joinRoom();
				// bob joins and then leaves
				bob.joinRoom();
				bob.leaveRoom();

				expect(() => alice.sendMessage("Hello", bob)).toThrow(
					"Target user not in chat room",
				);
			});

			it("should track message history", () => {
				alice.joinRoom();
				bob.joinRoom();

				alice.sendMessage("Message 1");
				bob.sendMessage("Message 2", alice);

				const history = chatRoom.getMessageHistory();
				expect(history).toHaveLength(2);
				expect(history[0]).toMatchObject({
					from: "Alice",
					message: "Message 1",
					to: undefined,
				});
				expect(history[1]).toMatchObject({
					from: "Bob",
					message: "Message 2",
					to: "Alice",
				});
			});

			it("should clear history", () => {
				alice.joinRoom();
				alice.sendMessage("Test message");

				expect(chatRoom.getMessageHistory()).toHaveLength(1);

				chatRoom.clearHistory();
				expect(chatRoom.getMessageHistory()).toHaveLength(0);
			});

			it("should provide user list", () => {
				alice.joinRoom();
				bob.joinRoom();

				const users = chatRoom.getUsers();
				expect(users).toHaveLength(2);
				expect(users.map((u) => u.getName())).toContain("Alice");
				expect(users.map((u) => u.getName())).toContain("Bob");
			});

			it("should handle user without mediator", () => {
				const orphanUser = new ChatUser("Orphan");

				expect(() => orphanUser.joinRoom()).toThrow("No mediator set");
				expect(() => orphanUser.sendMessage("Hello")).toThrow(
					"User not connected to any chat room",
				);
			});
		});

		describe("ModeratedChatRoom (Advanced Mediator)", () => {
			let moderatedRoom: ModeratedChatRoom;
			let admin: ChatUser;
			let user1: ChatUser;
			let user2: ChatUser;

			beforeEach(() => {
				moderatedRoom = new ModeratedChatRoom();
				admin = new ChatUser("Admin");
				user1 = new ChatUser("User1");
				user2 = new ChatUser("User2");

				admin.setMediator(moderatedRoom);
				user1.setMediator(moderatedRoom);
				user2.setMediator(moderatedRoom);

				admin.joinRoom();
				user1.joinRoom();
				user2.joinRoom();

				moderatedRoom.addModerator(admin);
			});

			it("should add and remove moderators", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				expect(moderatedRoom.isModerator(admin)).toBe(true);
				expect(moderatedRoom.isModerator(user1)).toBe(false);

				moderatedRoom.addModerator(user1);
				expect(moderatedRoom.isModerator(user1)).toBe(true);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("User1 agora é moderador"),
				);

				moderatedRoom.removeModerator(user1);
				expect(moderatedRoom.isModerator(user1)).toBe(false);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("User1 não é mais moderador"),
				);

				spy.mockRestore();
			});

			it("should allow moderators to mute users", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				expect(moderatedRoom.isMuted(user1)).toBe(false);

				moderatedRoom.muteUser(user1, admin);
				expect(moderatedRoom.isMuted(user1)).toBe(true);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("User1 foi silenciado"),
				);

				// Muted user's message should be blocked
				user1.sendMessage("This should be blocked");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("Mensagem de User1 bloqueada"),
				);

				spy.mockRestore();
			});

			it("should allow moderators to unmute users", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				moderatedRoom.muteUser(user1, admin);
				moderatedRoom.unmuteUser(user1, admin);

				expect(moderatedRoom.isMuted(user1)).toBe(false);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("User1 foi desmutado"),
				);

				spy.mockRestore();
			});

			it("should allow moderators to ban users", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				expect(moderatedRoom.isBanned("User1")).toBe(false);
				expect(moderatedRoom.getUserCount()).toBe(3);

				moderatedRoom.banUser(user1, admin);

				expect(moderatedRoom.isBanned("User1")).toBe(true);
				expect(moderatedRoom.getUserCount()).toBe(2);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("User1 foi banido"),
				);

				spy.mockRestore();
			});

			it("should prevent banned users from rejoining", () => {
				moderatedRoom.banUser(user1, admin);
				user1.leaveRoom(); // Leave if not already removed

				expect(() => user1.joinRoom()).toThrow("User User1 is banned");
			});

			it("should only allow moderators to perform moderation actions", () => {
				expect(() => moderatedRoom.muteUser(user2, user1)).toThrow(
					"Only moderators can mute users",
				);
				expect(() => moderatedRoom.unmuteUser(user2, user1)).toThrow(
					"Only moderators can unmute users",
				);
				expect(() => moderatedRoom.banUser(user2, user1)).toThrow(
					"Only moderators can ban users",
				);
			});

			it("should inherit basic chat room functionality", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				// Should work like a regular chat room
				user1.sendMessage("Normal message");
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("[PÚBLICO] User1: Normal message"),
				);

				user1.sendMessage("Private message", user2);
				expect(spy).toHaveBeenCalledWith(
					expect.stringContaining("[PRIVADO] User1 → User2: Private message"),
				);

				spy.mockRestore();
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Mediator)"),
			);

			spy.mockRestore();
		});
	});
});
