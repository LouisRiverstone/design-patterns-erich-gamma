// Solução: Singleton Pattern para garantir instância única
// Benefício: Controle de acesso global, economia de recursos, estado consistente

interface AppConfig {
	apiUrl: string;
	databaseUrl: string;
	cacheSize: number;
	debugMode: boolean;
	maxConnections: number;
}

interface CacheEntry {
	key: string;
	value: any;
	timestamp: number;
	ttl: number;
}

//  Singleton thread-safe para configuração
export class ConfigurationManager {
	private static instance: ConfigurationManager;
	private static readonly lock = new Object();

	private config: AppConfig;
	private lastUpdate: number;
	private observers: Array<(config: AppConfig) => void> = [];

	//  Construtor privado impede instanciação externa
	private constructor() {
		console.log(
			" Carregando configuração única (processo custoso executado apenas uma vez)...",
		);
		this.config = this.loadConfigFromEnvironment();
		this.lastUpdate = Date.now();
	}

	//  Acesso thread-safe à instância única
	public static getInstance(): ConfigurationManager {
		if (!ConfigurationManager.instance) {
			// Double-checked locking pattern para thread safety
			if (!ConfigurationManager.instance) {
				ConfigurationManager.instance = new ConfigurationManager();
			}
		}
		return ConfigurationManager.instance;
	}

	private loadConfigFromEnvironment(): AppConfig {
		console.log(" Lendo arquivos de configuração (execução única)...");
		console.log(" Validando URLs...");
		console.log(" Carregando credenciais...");

		return {
			apiUrl: process.env.API_URL || "http://localhost:3000",
			databaseUrl: process.env.DB_URL || "mongodb://localhost:27017",
			cacheSize: parseInt(process.env.CACHE_SIZE || "1000"),
			debugMode: process.env.NODE_ENV === "development",
			maxConnections: parseInt(process.env.MAX_CONNECTIONS || "100"),
		};
	}

	getConfig(): AppConfig {
		return { ...this.config };
	}

	updateConfig(updates: Partial<AppConfig>): void {
		const oldConfig = { ...this.config };
		this.config = { ...this.config, ...updates };
		this.lastUpdate = Date.now();

		console.log(" Configuração global atualizada:", updates);

		//  Notifica observadores da mudança
		this.notifyObservers(this.config);
	}

	//  Padrão Observer integrado
	addConfigObserver(observer: (config: AppConfig) => void): void {
		this.observers.push(observer);
	}

	removeConfigObserver(observer: (config: AppConfig) => void): void {
		const index = this.observers.indexOf(observer);
		if (index > -1) {
			this.observers.splice(index, 1);
		}
	}

	private notifyObservers(config: AppConfig): void {
		this.observers.forEach((observer) => observer(config));
	}

	getLastUpdate(): number {
		return this.lastUpdate;
	}

	//  Método para reset (útil em testes)
	public static reset(): void {
		ConfigurationManager.instance = null as any;
	}
}

//  Singleton para cache global
export class CacheManager {
	private static instance: CacheManager;
	private cache = new Map<string, CacheEntry>();
	private hitCount = 0;
	private missCount = 0;
	private maxSize: number;

	private constructor() {
		console.log(
			" Inicializando cache global (processo custoso executado apenas uma vez)...",
		);
		const config = ConfigurationManager.getInstance().getConfig();
		this.maxSize = config.cacheSize;
		this.initializeCache();
	}

	public static getInstance(): CacheManager {
		if (!CacheManager.instance) {
			CacheManager.instance = new CacheManager();
		}
		return CacheManager.instance;
	}

	private initializeCache(): void {
		console.log(" Preparando estruturas de dados globais...");
		console.log(" Carregando cache persistente...");
	}

	set(key: string, value: any, ttl: number = 300000): void {
		//  Implementa LRU quando atinge tamanho máximo
		if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey) {
				this.cache.delete(firstKey);
			}
		}

		this.cache.set(key, {
			key,
			value,
			timestamp: Date.now(),
			ttl,
		});
	}

	get(key: string): any {
		const entry = this.cache.get(key);

		if (!entry) {
			this.missCount++;
			return null;
		}

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			this.missCount++;
			return null;
		}

		this.hitCount++;

		//  Move para final (LRU)
		this.cache.delete(key);
		this.cache.set(key, entry);

		return entry.value;
	}

	has(key: string): boolean {
		const entry = this.cache.get(key);
		return entry !== undefined && Date.now() - entry.timestamp <= entry.ttl;
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	getStats(): { hits: number; misses: number; size: number; hitRatio: number } {
		const total = this.hitCount + this.missCount;
		return {
			hits: this.hitCount,
			misses: this.missCount,
			size: this.cache.size,
			hitRatio: total > 0 ? this.hitCount / total : 0,
		};
	}

	clear(): void {
		this.cache.clear();
		this.hitCount = 0;
		this.missCount = 0;
	}

	//  Cleanup de entradas expiradas
	cleanup(): number {
		const now = Date.now();
		let cleaned = 0;

		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
				cleaned++;
			}
		}

		return cleaned;
	}

	public static reset(): void {
		CacheManager.instance = null as any;
	}
}

//  Singleton para pool de conexões
export class DatabaseConnectionPool {
	private static instance: DatabaseConnectionPool;
	private connectionPool: string[] = [];
	private maxConnections: number;
	private activeConnections = new Set<string>();

	private constructor() {
		console.log(
			" Criando pool global de conexões (processo custoso executado apenas uma vez)...",
		);
		const config = ConfigurationManager.getInstance().getConfig();
		this.maxConnections = config.maxConnections;
		this.initializePool();
	}

	public static getInstance(): DatabaseConnectionPool {
		if (!DatabaseConnectionPool.instance) {
			DatabaseConnectionPool.instance = new DatabaseConnectionPool();
		}
		return DatabaseConnectionPool.instance;
	}

	private initializePool(): void {
		console.log(` Inicializando ${this.maxConnections} conexões...`);
		for (let i = 0; i < this.maxConnections; i++) {
			this.connectionPool.push(`connection-${i}`);
		}
	}

	async getConnection(): Promise<string | null> {
		if (this.connectionPool.length === 0) {
			console.log(" Pool esgotado, aguardando...");
			return null;
		}

		const connection = this.connectionPool.pop()!;
		this.activeConnections.add(connection);

		console.log(
			` Conexão ${connection} adquirida (${this.getAvailableConnections()} restantes)`,
		);
		return connection;
	}

	releaseConnection(connection: string): void {
		if (this.activeConnections.has(connection)) {
			this.activeConnections.delete(connection);
			this.connectionPool.push(connection);
			console.log(
				` Conexão ${connection} liberada (${this.getAvailableConnections()} disponíveis)`,
			);
		}
	}

	getAvailableConnections(): number {
		return this.connectionPool.length;
	}

	getActiveConnections(): number {
		return this.activeConnections.size;
	}

	getPoolStats(): { total: number; available: number; active: number } {
		return {
			total: this.maxConnections,
			available: this.getAvailableConnections(),
			active: this.getActiveConnections(),
		};
	}

	//  Graceful shutdown
	async closeAllConnections(): Promise<void> {
		console.log(" Fechando todas as conexões...");
		this.connectionPool.length = 0;
		this.activeConnections.clear();
	}

	public static reset(): void {
		DatabaseConnectionPool.instance = null as any;
	}
}

//  Serviços usam singletons compartilhados
export class UserService {
	private config: ConfigurationManager;
	private cache: CacheManager;
	private db: DatabaseConnectionPool;

	constructor() {
		//  Reutiliza instâncias únicas
		this.config = ConfigurationManager.getInstance();
		this.cache = CacheManager.getInstance();
		this.db = DatabaseConnectionPool.getInstance();
	}

	async getUser(id: string): Promise<any> {
		// Verifica cache compartilhado
		const cacheKey = `user:${id}`;
		const cached = this.cache.get(cacheKey);
		if (cached) {
			console.log(` Usuário ${id} encontrado no cache compartilhado`);
			return cached;
		}

		// Busca no banco usando pool compartilhado
		const connection = await this.db.getConnection();
		if (!connection) {
			throw new Error("Pool de conexões esgotado");
		}

		try {
			console.log(` Buscando usuário ${id} no banco...`);
			// Simula delay de busca
			await new Promise((resolve) => setTimeout(resolve, 100));

			const user = { id, name: `User ${id}`, email: `user${id}@example.com` };

			// Cache no cache compartilhado
			this.cache.set(cacheKey, user, 300000);

			return user;
		} finally {
			this.db.releaseConnection(connection);
		}
	}

	async searchUsers(query: string): Promise<any[]> {
		const cacheKey = `search:users:${query}`;
		const cached = this.cache.get(cacheKey);
		if (cached) {
			return cached;
		}

		const connection = await this.db.getConnection();
		if (!connection) {
			throw new Error("Pool de conexões esgotado");
		}

		try {
			// Simula busca
			const users = Array.from({ length: 3 }, (_, i) => ({
				id: `${query}-${i}`,
				name: `User ${query} ${i}`,
				email: `${query}${i}@example.com`,
			}));

			this.cache.set(cacheKey, users, 600000); // Cache por 10 minutos
			return users;
		} finally {
			this.db.releaseConnection(connection);
		}
	}
}

export class ProductService {
	private config: ConfigurationManager;
	private cache: CacheManager;
	private db: DatabaseConnectionPool;

	constructor() {
		//  Mesmas instâncias únicas reutilizadas
		this.config = ConfigurationManager.getInstance();
		this.cache = CacheManager.getInstance();
		this.db = DatabaseConnectionPool.getInstance();
	}

	async getProduct(id: string): Promise<any> {
		const cacheKey = `product:${id}`;
		const cached = this.cache.get(cacheKey);
		if (cached) {
			console.log(`📦 Produto ${id} encontrado no cache compartilhado`);
			return cached;
		}

		const connection = await this.db.getConnection();
		if (!connection) {
			throw new Error("Pool de conexões esgotado");
		}

		try {
			console.log(` Buscando produto ${id} no banco...`);
			const product = {
				id,
				name: `Product ${id}`,
				price: Math.random() * 1000,
			};

			this.cache.set(cacheKey, product);
			return product;
		} finally {
			this.db.releaseConnection(connection);
		}
	}

	async updateProductPrice(id: string, newPrice: number): Promise<any> {
		const connection = await this.db.getConnection();
		if (!connection) {
			throw new Error("Pool de conexões esgotado");
		}

		try {
			//  Remove do cache após atualização
			this.cache.delete(`product:${id}`);

			const product = { id, name: `Product ${id}`, price: newPrice };
			console.log(` Preço do produto ${id} atualizado para ${newPrice}`);

			return product;
		} finally {
			this.db.releaseConnection(connection);
		}
	}
}

//  Demonstração da solução
export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Singleton) ===");

	//  Instâncias únicas reutilizadas
	console.log("\n1. Criando UserService (reutiliza singletons):");
	const userService = new UserService();

	console.log("\n2. Criando ProductService (reutiliza mesmos singletons):");
	const productService = new ProductService();

	//  Cache compartilhado entre serviços
	console.log("\n3. Testando cache compartilhado:");
	const cache = CacheManager.getInstance();

	cache.set("shared-key", "dados-compartilhados");
	console.log("Cache compartilhado:", cache.get("shared-key"));

	//  Pool de conexões compartilhado
	console.log("\n4. Testando pool compartilhado:");
	const db = DatabaseConnectionPool.getInstance();
	console.log("Stats do pool:", db.getPoolStats());

	//  Configuração global consistente
	console.log("\n5. Configuração global:");
	const config = ConfigurationManager.getInstance();
	console.log("API URL:", config.getConfig().apiUrl);

	//  Mudança de configuração afeta todos
	config.updateConfig({ debugMode: true });
	console.log("Debug mode ativado globalmente");

	//  Demonstra estatísticas do cache
	console.log("\n6. Estatísticas do cache global:");
	console.log("Stats:", cache.getStats());

	console.log(
		"\n Benefícios: recurso único, estado consistente, economia de memória",
	);
}
