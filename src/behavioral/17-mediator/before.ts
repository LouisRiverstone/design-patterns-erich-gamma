export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Acoplamento direto entre objetos");

	class User {
		private friends: User[] = [];

		constructor(public name: string) {}

		addFriend(friend: User): void {
			this.friends.push(friend);
			friend.friends.push(this); // Acoplamento direto
		}

		sendMessage(message: string, to?: User): void {
			if (to) {
				console.log(`${this.name} envia para ${to.name}: ${message}`);
				to.receiveMessage(message, this);
			} else {
				// Broadcast para todos os amigos
				this.friends.forEach((friend) => {
					console.log(`${this.name} envia para ${friend.name}: ${message}`);
					friend.receiveMessage(message, this);
				});
			}
		}

		receiveMessage(message: string, from: User): void {
			console.log(`${this.name} recebeu de ${from.name}: ${message}`);
		}
	}

	const alice = new User("Alice");
	const bob = new User("Bob");
	const charlie = new User("Charlie");

	alice.addFriend(bob);
	alice.addFriend(charlie);
	bob.addFriend(charlie);

	alice.sendMessage("Olá pessoal!");
	bob.sendMessage("Oi Alice!", alice);

	console.log(
		"Problemas: objetos acoplados, lógica complexa, difícil manutenção",
	);
}
