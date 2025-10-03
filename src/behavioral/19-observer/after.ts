// Observer interface
export interface Observer<T = any> {
	update(subject: Subject<T>, data: T): void;
	getId(): string;
}

// Subject interface
export interface Subject<T = any> {
	attach(observer: Observer<T>): void;
	detach(observer: Observer<T>): void;
	notify(data: T): void;
	getObserverCount(): number;
}

// News event types
export interface NewsEvent {
	id: string;
	title: string;
	content: string;
	category: string;
	timestamp: Date;
	priority: "low" | "medium" | "high" | "urgent";
}

// Concrete Subject
export class NewsPublisher implements Subject<NewsEvent> {
	private observers: Set<Observer<NewsEvent>> = new Set();
	private newsHistory: NewsEvent[] = [];

	attach(observer: Observer<NewsEvent>): void {
		this.observers.add(observer);
		console.log(`Observer ${observer.getId()} inscrito`);
	}

	detach(observer: Observer<NewsEvent>): void {
		const removed = this.observers.delete(observer);
		if (removed) {
			console.log(`Observer ${observer.getId()} desinscrito`);
		}
	}

	notify(data: NewsEvent): void {
		console.log(`Notificando ${this.observers.size} observers...`);

		this.observers.forEach((observer) => {
			try {
				observer.update(this, data);
			} catch (error) {
				console.error(`Erro ao notificar ${observer.getId()}:`, error);
			}
		});
	}

	getObserverCount(): number {
		return this.observers.size;
	}

	publishNews(
		title: string,
		content: string,
		category: string,
		priority: NewsEvent["priority"] = "medium",
	): void {
		const news: NewsEvent = {
			id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			title,
			content,
			category,
			timestamp: new Date(),
			priority,
		};

		this.newsHistory.push(news);
		console.log(`\n=== Publicando Notícia ===`);
		console.log(`Título: ${news.title}`);
		console.log(`Categoria: ${news.category}`);
		console.log(`Prioridade: ${news.priority}`);

		this.notify(news);
	}

	getNewsHistory(): readonly NewsEvent[] {
		return this.newsHistory;
	}

	getLatestNews(): NewsEvent | null {
		return this.newsHistory.length > 0
			? this.newsHistory[this.newsHistory.length - 1]
			: null;
	}
}

// Concrete Observers
export class EmailSubscriber implements Observer<NewsEvent> {
	private interestedCategories: Set<string>;

	constructor(
		private email: string,
		private name: string,
		interestedCategories: string[] = [],
	) {
		this.interestedCategories = new Set(interestedCategories);
	}

	update(subject: Subject<NewsEvent>, news: NewsEvent): void {
		// Filtra por categoria se especificado
		if (
			this.interestedCategories.size > 0 &&
			!this.interestedCategories.has(news.category)
		) {
			return;
		}

		console.log(` Email para ${this.name} (${this.email}): ${news.title}`);

		if (news.priority === "urgent") {
			console.log(`  URGENTE - Enviando email prioritário!`);
		}
	}

	getId(): string {
		return `email-${this.email}`;
	}

	addCategoryInterest(category: string): void {
		this.interestedCategories.add(category);
	}

	removeCategoryInterest(category: string): void {
		this.interestedCategories.delete(category);
	}

	getInterestedCategories(): string[] {
		return Array.from(this.interestedCategories);
	}
}

export class SlackNotifier implements Observer<NewsEvent> {
	constructor(
		private channel: string,
		private minPriority: NewsEvent["priority"] = "medium",
	) {}

	update(subject: Subject<NewsEvent>, news: NewsEvent): void {
		if (!this.shouldNotify(news.priority)) {
			return;
		}

		const emoji = this.getPriorityEmoji(news.priority);
		console.log(`🔔 Slack #${this.channel}: ${emoji} ${news.title}`);
	}

	getId(): string {
		return `slack-${this.channel}`;
	}

	private shouldNotify(priority: NewsEvent["priority"]): boolean {
		const priorities = { low: 1, medium: 2, high: 3, urgent: 4 };
		return priorities[priority] >= priorities[this.minPriority];
	}

	private getPriorityEmoji(priority: NewsEvent["priority"]): string {
		const emojis = {
			low: "📢",
			medium: "📣",
			high: "🚨",
			urgent: "🆘",
		};
		return emojis[priority];
	}
}

export class AnalyticsTracker implements Observer<NewsEvent> {
	private stats = {
		totalNews: 0,
		categoryCounts: new Map<string, number>(),
		priorityCounts: new Map<string, number>(),
		lastUpdate: new Date(),
	};

	update(subject: Subject<NewsEvent>, news: NewsEvent): void {
		this.stats.totalNews++;
		this.stats.lastUpdate = new Date();

		// Atualiza contadores por categoria
		const categoryCount = this.stats.categoryCounts.get(news.category) || 0;
		this.stats.categoryCounts.set(news.category, categoryCount + 1);

		// Atualiza contadores por prioridade
		const priorityCount = this.stats.priorityCounts.get(news.priority) || 0;
		this.stats.priorityCounts.set(news.priority, priorityCount + 1);

		console.log(
			` Analytics: Registrada notícia da categoria "${news.category}" (total: ${this.stats.totalNews})`,
		);
	}

	getId(): string {
		return "analytics-tracker";
	}

	getStats() {
		return {
			...this.stats,
			categoryCounts: new Map(this.stats.categoryCounts),
			priorityCounts: new Map(this.stats.priorityCounts),
		};
	}

	printReport(): void {
		console.log("\n=== Relatório de Analytics ===");
		console.log(`Total de notícias: ${this.stats.totalNews}`);
		console.log("Por categoria:");
		this.stats.categoryCounts.forEach((count, category) => {
			console.log(`  ${category}: ${count}`);
		});
		console.log("Por prioridade:");
		this.stats.priorityCounts.forEach((count, priority) => {
			console.log(`  ${priority}: ${count}`);
		});
	}
}

// Advanced Observer with filtering and batching
export class SmartEmailDigest implements Observer<NewsEvent> {
	private pendingNews: NewsEvent[] = [];
	private timer: NodeJS.Timeout | null = null;

	constructor(
		private email: string,
		private batchSize: number = 5,
		private batchTimeoutMs: number = 10000,
	) {}

	update(subject: Subject<NewsEvent>, news: NewsEvent): void {
		this.pendingNews.push(news);

		// Envia imediatamente se urgente
		if (news.priority === "urgent") {
			this.sendImmediately(news);
			return;
		}

		// Envia em lote se atingiu o tamanho máximo
		if (this.pendingNews.length >= this.batchSize) {
			this.sendDigest();
			return;
		}

		// Configura timer para envio por timeout
		if (!this.timer) {
			this.timer = setTimeout(() => {
				this.sendDigest();
			}, this.batchTimeoutMs);
		}
	}

	getId(): string {
		return `smart-digest-${this.email}`;
	}

	private sendImmediately(news: NewsEvent): void {
		console.log(`🚨 Digest URGENTE para ${this.email}: ${news.title}`);
		// Remove das pendentes se já estava lá
		this.pendingNews = this.pendingNews.filter((n) => n.id !== news.id);
	}

	private sendDigest(): void {
		if (this.pendingNews.length === 0) return;

		console.log(
			` Digest para ${this.email} (${this.pendingNews.length} notícias):`,
		);
		this.pendingNews.forEach((news) => {
			console.log(`  - ${news.title} [${news.category}]`);
		});

		this.pendingNews = [];
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}

	forceSendDigest(): void {
		this.sendDigest();
	}

	getPendingCount(): number {
		return this.pendingNews.length;
	}
}

export function demonstrateSolution() {
	console.log(
		"DEPOIS (Solução Observer) - Baixo acoplamento e notificações automáticas",
	);

	const newsPublisher = new NewsPublisher();

	// Diferentes tipos de observers
	const alice = new EmailSubscriber("alice@email.com", "Alice", [
		"tecnologia",
		"ciência",
	]);
	const bob = new EmailSubscriber("bob@email.com", "Bob"); // Todas as categorias
	const slackDev = new SlackNotifier("desenvolvimento", "high");
	const slackGeneral = new SlackNotifier("geral", "medium");
	const analytics = new AnalyticsTracker();
	const smartDigest = new SmartEmailDigest("digest@email.com", 3);

	// Inscrever observers
	newsPublisher.attach(alice);
	newsPublisher.attach(bob);
	newsPublisher.attach(slackDev);
	newsPublisher.attach(slackGeneral);
	newsPublisher.attach(analytics);
	newsPublisher.attach(smartDigest);

	// Publicar diferentes tipos de notícias
	newsPublisher.publishNews(
		"Nova versão do TypeScript lançada",
		"TypeScript 5.0 traz novos recursos...",
		"tecnologia",
		"medium",
	);

	newsPublisher.publishNews(
		"Descoberta científica revolucionária",
		"Cientistas descobrem nova forma de energia...",
		"ciência",
		"high",
	);

	newsPublisher.publishNews(
		"Sistema em manutenção",
		"Manutenção emergencial será realizada...",
		"sistema",
		"urgent",
	);

	// Alice se desinscreve
	newsPublisher.detach(alice);

	newsPublisher.publishNews(
		"Novo framework JavaScript",
		"Framework promete revolucionar desenvolvimento...",
		"tecnologia",
		"low",
	);

	// Relatório final
	analytics.printReport();
	console.log(`\nObservers ativos: ${newsPublisher.getObserverCount()}`);
	console.log(`Notícias pendentes no digest: ${smartDigest.getPendingCount()}`);
}
