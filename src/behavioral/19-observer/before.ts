export function demonstrateProblems() {
	console.log(
		"ANTES (Problemático) - Acoplamento direto e notificações manuais",
	);

	class NewsletterService {
		private subscribers: string[] = [];

		addSubscriber(email: string): void {
			this.subscribers.push(email);
		}

		removeSubscriber(email: string): void {
			const index = this.subscribers.indexOf(email);
			if (index > -1) {
				this.subscribers.splice(index, 1);
			}
		}

		publishNews(news: string): void {
			console.log(`Publicando: ${news}`);

			// Problema: lógica de notificação misturada
			this.subscribers.forEach((email) => {
				console.log(`Email enviado para: ${email}`);
			});

			// Problema: acoplamento com outros serviços
			this.sendToSlack(news);
			this.sendToDiscord(news);
			this.updateAnalytics(news);
		}

		private sendToSlack(news: string): void {
			console.log(`Slack: ${news}`);
		}

		private sendToDiscord(news: string): void {
			console.log(`Discord: ${news}`);
		}

		private updateAnalytics(news: string): void {
			console.log(`Analytics: notícia publicada`);
		}
	}

	class User {
		constructor(
			public name: string,
			public email: string,
			private newsletter: NewsletterService,
		) {
			// Problema: User precisa conhecer NewsletterService
			newsletter.addSubscriber(email);
		}

		unsubscribe(): void {
			this.newsletter.removeSubscriber(this.email);
		}
	}

	const newsletter = new NewsletterService();
	const user1 = new User("Alice", "alice@email.com", newsletter);
	const user2 = new User("Bob", "bob@email.com", newsletter);

	newsletter.publishNews("Breaking News!");

	console.log("Problemas: acoplamento forte, responsabilidades misturadas");
}
