// Mediator interface
export interface ChatMediator {
	sendMessage(message: string, from: User, to?: User): void;
	addUser(user: User): void;
	removeUser(user: User): void;
	getUsers(): User[];
}

// Colleague interface
export interface User {
	getName(): string;
	setMediator(mediator: ChatMediator): void;
	sendMessage(message: string, to?: User): void;
	receiveMessage(message: string, from: User): void;
	joinRoom(): void;
	leaveRoom(): void;
}

// Concrete Colleague
export class ChatUser implements User {
	private mediator?: ChatMediator;

	constructor(private name: string) {}

	getName(): string {
		return this.name;
	}

	setMediator(mediator: ChatMediator): void {
		this.mediator = mediator;
	}

	sendMessage(message: string, to?: User): void {
		if (!this.mediator) {
			throw new Error("User not connected to any chat room");
		}
		this.mediator.sendMessage(message, this, to);
	}

	receiveMessage(message: string, from: User): void {
		console.log(`[${this.name}] Recebeu de ${from.getName()}: ${message}`);
	}

	joinRoom(): void {
		if (!this.mediator) {
			throw new Error("No mediator set");
		}
		this.mediator.addUser(this);
		console.log(`[SISTEMA] ${this.name} entrou no chat`);
	}

	leaveRoom(): void {
		if (!this.mediator) {
			throw new Error("No mediator set");
		}
		this.mediator.removeUser(this);
		console.log(`[SISTEMA] ${this.name} saiu do chat`);
	}
}

// Concrete Mediator
export class ChatRoom implements ChatMediator {
	private users: Set<User> = new Set();
	private messageHistory: Array<{
		timestamp: Date;
		from: string;
		to?: string;
		message: string;
	}> = [];

	sendMessage(message: string, from: User, to?: User): void {
		if (!this.users.has(from)) {
			throw new Error("User not in chat room");
		}

		if (to && !this.users.has(to)) {
			throw new Error("Target user not in chat room");
		}

		// Log message
		this.messageHistory.push({
			timestamp: new Date(),
			from: from.getName(),
			to: to?.getName(),
			message,
		});

		if (to) {
			// Private message
			console.log(`[PRIVADO] ${from.getName()} → ${to.getName()}: ${message}`);
			to.receiveMessage(message, from);
		} else {
			// Broadcast to all users except sender
			console.log(`[PÚBLICO] ${from.getName()}: ${message}`);
			this.users.forEach((user) => {
				if (user !== from) {
					user.receiveMessage(message, from);
				}
			});
		}
	}

	addUser(user: User): void {
		this.users.add(user);
		user.setMediator(this);
	}

	removeUser(user: User): void {
		this.users.delete(user);
	}

	getUsers(): User[] {
		return Array.from(this.users);
	}

	getUserCount(): number {
		return this.users.size;
	}

	getMessageHistory(): Array<{
		timestamp: Date;
		from: string;
		to?: string;
		message: string;
	}> {
		return [...this.messageHistory];
	}

	clearHistory(): void {
		this.messageHistory = [];
	}
}

// Advanced Mediator with moderation features
export class ModeratedChatRoom extends ChatRoom {
	private moderators: Set<User> = new Set();
	private bannedUsers: Set<string> = new Set();
	private mutedUsers: Set<User> = new Set();

	addModerator(user: User): void {
		this.moderators.add(user);
		console.log(`[SISTEMA] ${user.getName()} agora é moderador`);
	}

	removeModerator(user: User): void {
		this.moderators.delete(user);
		console.log(`[SISTEMA] ${user.getName()} não é mais moderador`);
	}

	banUser(user: User, moderator: User): void {
		if (!this.moderators.has(moderator)) {
			throw new Error("Only moderators can ban users");
		}

		this.bannedUsers.add(user.getName());
		this.removeUser(user);
		console.log(
			`[SISTEMA] ${user.getName()} foi banido por ${moderator.getName()}`,
		);
	}

	muteUser(user: User, moderator: User): void {
		if (!this.moderators.has(moderator)) {
			throw new Error("Only moderators can mute users");
		}

		this.mutedUsers.add(user);
		console.log(
			`[SISTEMA] ${user.getName()} foi silenciado por ${moderator.getName()}`,
		);
	}

	unmuteUser(user: User, moderator: User): void {
		if (!this.moderators.has(moderator)) {
			throw new Error("Only moderators can unmute users");
		}

		this.mutedUsers.delete(user);
		console.log(
			`[SISTEMA] ${user.getName()} foi desmutado por ${moderator.getName()}`,
		);
	}

	addUser(user: User): void {
		if (this.bannedUsers.has(user.getName())) {
			throw new Error(`User ${user.getName()} is banned`);
		}
		super.addUser(user);
	}

	sendMessage(message: string, from: User, to?: User): void {
		if (this.mutedUsers.has(from)) {
			console.log(
				`[SISTEMA] Mensagem de ${from.getName()} bloqueada (usuário silenciado)`,
			);
			return;
		}

		super.sendMessage(message, from, to);
	}

	isModerator(user: User): boolean {
		return this.moderators.has(user);
	}

	isMuted(user: User): boolean {
		return this.mutedUsers.has(user);
	}

	isBanned(username: string): boolean {
		return this.bannedUsers.has(username);
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução Mediator) - Comunicação centralizada");

	// Chat simples
	console.log("\n=== Chat Room Simples ===");
	const chatRoom = new ChatRoom();

	const alice = new ChatUser("Alice");
	const bob = new ChatUser("Bob");
	const charlie = new ChatUser("Charlie");

	// Users se conectam ao mediator
	alice.setMediator(chatRoom);
	bob.setMediator(chatRoom);
	charlie.setMediator(chatRoom);

	alice.joinRoom();
	bob.joinRoom();
	charlie.joinRoom();

	// Mensagens públicas
	alice.sendMessage("Olá pessoal!");
	bob.sendMessage("Oi Alice!");

	// Mensagem privada
	charlie.sendMessage("Mensagem secreta", alice);

	// Chat moderado
	console.log("\n=== Chat Room Moderado ===");
	const moderatedRoom = new ModeratedChatRoom();

	const admin = new ChatUser("Admin");
	const user1 = new ChatUser("User1");
	const user2 = new ChatUser("User2");

	admin.setMediator(moderatedRoom);
	user1.setMediator(moderatedRoom);
	user2.setMediator(moderatedRoom);

	admin.joinRoom();
	user1.joinRoom();
	user2.joinRoom();

	moderatedRoom.addModerator(admin);

	user1.sendMessage("Mensagem normal");

	// Moderação
	moderatedRoom.muteUser(user1, admin);
	user1.sendMessage("Esta mensagem será bloqueada");

	moderatedRoom.unmuteUser(user1, admin);
	user1.sendMessage("Agora posso falar novamente");

	console.log(`\nHistórico: ${chatRoom.getMessageHistory().length} mensagens`);
	console.log(`Usuários online: ${moderatedRoom.getUserCount()}`);
}
