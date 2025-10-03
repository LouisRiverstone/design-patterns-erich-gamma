// Cenário: Sistema de configuração e cache de aplicação
// Problema: Múltiplas instâncias de recursos que deveriam ser únicos

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

// Abordagem ingênua: múltiplas instâncias podem ser criadas
class ConfigurationManager {
	private config: AppConfig;
	private lastUpdate: number;

	constructor() {
		// Processo custoso repetido a cada instância
		console.log(" Carregando configuração (processo custoso)...");
		this.config = this.loadConfigFromEnvironment();
		this.lastUpdate = Date.now();
	}

	private loadConfigFromEnvironment(): AppConfig {
		// Simula carregamento custoso de configuração
		console.log(" Lendo arquivos de configuração...");
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
		this.config = { ...this.config, ...updates };
		this.lastUpdate = Date.now();
		console.log(" Configuração atualizada:", updates);
	}

	getLastUpdate(): number {
		return this.lastUpdate;
	}
}

class CacheManager {
	private cache = new Map<string, CacheEntry>();
	private hitCount = 0;
	private missCount = 0;

	constructor() {
		// Cada instância tem seu próprio cache
		console.log(" Inicializando cache (processo custoso)...");
		this.initializeCache();
	}

	private initializeCache(): void {
		// Simula carregamento custoso de cache
		console.log(" Preparando estruturas de dados...");
		console.log(" Carregando cache persistente...");
	}

	set(key: string, value: any, ttl: number = 300000): void {
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
		return entry.value;
	}

	getStats(): { hits: number; misses: number; size: number } {
		return {
			hits: this.hitCount,
			misses: this.missCount,
			size: this.cache.size,
		};
	}

	clear(): void {
		this.cache.clear();
		this.hitCount = 0;
		this.missCount = 0;
	}
}

// Problemático: múltiplas instâncias de recursos únicos
class DatabaseConnection {
	private connectionPool: string[] = [];
	private maxConnections: number;

	constructor(maxConnections: number = 10) {
		// Cada instância cria seu próprio pool
		console.log(` Criando pool de conexões (${maxConnections} conexões)...`);
		this.maxConnections = maxConnections;
		this.initializePool();
	}

	private initializePool(): void {
		for (let i = 0; i < this.maxConnections; i++) {
			this.connectionPool.push(`connection-${i}`);
		}
	}

	getConnection(): string | null {
		return this.connectionPool.pop() || null;
	}

	releaseConnection(connection: string): void {
		if (this.connectionPool.length < this.maxConnections) {
			this.connectionPool.push(connection);
		}
	}

	getAvailableConnections(): number {
		return this.connectionPool.length;
	}
}

// Cliente cria múltiplas instâncias desnecessariamente
class UserService {
	private config: ConfigurationManager;
	private cache: CacheManager;
	private db: DatabaseConnection;

	constructor() {
		// Cria novas instâncias a cada serviço
		this.config = new ConfigurationManager();
		this.cache = new CacheManager();
		this.db = new DatabaseConnection();
	}

	async getUser(id: string): Promise<any> {
		// Verifica cache primeiro
		const cached = this.cache.get(`user:${id}`);
		if (cached) {
			console.log(` Usuário ${id} encontrado no cache`);
			return cached;
		}

		// Busca no banco
		const connection = this.db.getConnection();
		if (!connection) {
			throw new Error("Sem conexões disponíveis");
		}

		console.log(` Buscando usuário ${id} no banco...`);
		const user = { id, name: `User ${id}`, email: `user${id}@example.com` };

		// Cache por 5 minutos
		this.cache.set(`user:${id}`, user, 300000);
		this.db.releaseConnection(connection);

		return user;
	}
}

class ProductService {
	private config: ConfigurationManager;
	private cache: CacheManager;
	private db: DatabaseConnection;

	constructor() {
		// Cria NOVAS instâncias ao invés de reutilizar
		this.config = new ConfigurationManager();
		this.cache = new CacheManager();
		this.db = new DatabaseConnection();
	}

	async getProduct(id: string): Promise<any> {
		const cached = this.cache.get(`product:${id}`);
		if (cached) {
			return cached;
		}

		const connection = this.db.getConnection();
		if (!connection) {
			throw new Error("Sem conexões disponíveis");
		}

		const product = { id, name: `Product ${id}`, price: 100 };
		this.cache.set(`product:${id}`, product);
		this.db.releaseConnection(connection);

		return product;
	}
}

// Demonstração dos problemas
export function demonstrateProblems() {
	console.log("=== ANTES (Problemático) ===");

	// Múltiplas instâncias custosas
	console.log("\n1. Criando UserService:");
	const userService = new UserService();

	console.log("\n2. Criando ProductService:");
	const productService = new ProductService();

	// Cada serviço tem seu próprio cache, não compartilhado
	console.log("\n3. Testando caches separados:");
	const userCache = (userService as any).cache;
	const productCache = (productService as any).cache;

	userCache.set("shared-key", "user-data");
	productCache.set("shared-key", "product-data");

	console.log("Cache do UserService:", userCache.get("shared-key"));
	console.log("Cache do ProductService:", productCache.get("shared-key"));

	// Pools de conexão duplicados
	const userDb = (userService as any).db;
	const productDb = (productService as any).db;

	console.log("Conexões UserService:", userDb.getAvailableConnections());
	console.log("Conexões ProductService:", productDb.getAvailableConnections());

	console.log(
		"\nProblemas: recursos duplicados, desperdício de memória, configurações inconsistentes",
	);
}
