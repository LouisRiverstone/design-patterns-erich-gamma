//  DEPOIS: Com o padrão Proxy
// Controle de acesso, cache, lazy loading e monitoramento

// Interface comum para o serviço real e o proxy
export interface DatabaseInterface {
	getUser(id: number): {
		id: number;
		name: string;
		email: string;
		profile: object;
	};
	updateUser(
		id: number,
		data: Partial<{ name: string; email: string }>,
	): boolean;
	deleteUser(id: number): boolean;
	getUserCount(): number;
}

// Serviço real (Subject)
class RealDatabaseService implements DatabaseInterface {
	private connection: string;

	constructor() {
		this.connection = this.establishConnection();
	}

	private establishConnection(): string {
		console.log(" [REAL] Conectando ao banco de dados...");
		return `connection_${Date.now()}`;
	}

	getUser(id: number): {
		id: number;
		name: string;
		email: string;
		profile: object;
	} {
		console.log(` [REAL] Executando query SQL para usuário ${id}`);

		return {
			id,
			name: `User ${id}`,
			email: `user${id}@example.com`,
			profile: {
				preferences: { theme: "dark", language: "en" },
				lastLogin: new Date(),
				permissions: ["read", "write"],
			},
		};
	}

	updateUser(
		id: number,
		data: Partial<{ name: string; email: string }>,
	): boolean {
		console.log(` [REAL] Executando UPDATE SQL para usuário ${id}`);
		return true;
	}

	deleteUser(id: number): boolean {
		console.log(` [REAL] Executando DELETE SQL para usuário ${id}`);
		return true;
	}

	getUserCount(): number {
		console.log(" [REAL] Contando usuários no banco...");
		return Math.floor(Math.random() * 1000) + 100;
	}
}

// Proxy com cache e controle de acesso
export class DatabaseProxy implements DatabaseInterface {
	private realService: RealDatabaseService | null = null;
	private cache: Map<string, { data: any; timestamp: Date; ttl: number }> =
		new Map();
	private sessionId: string | null = null;
	private operationLog: Array<{
		operation: string;
		timestamp: Date;
		userId?: number;
		success: boolean;
	}> = [];

	constructor(sessionId?: string) {
		this.sessionId = sessionId || null;
	}

	// Lazy initialization
	private getRealService(): RealDatabaseService {
		if (!this.realService) {
			console.log(" [PROXY] Lazy loading - criando serviço real...");
			this.realService = new RealDatabaseService();
		}
		return this.realService;
	}

	// Verificação de acesso
	private checkAccess(operation: string): boolean {
		if (!this.sessionId) {
			console.log(` [PROXY] Acesso negado para ${operation} - sem sessão`);
			return false;
		}

		// Simula validação de sessão (poderia usar AuthService)
		console.log(` [PROXY] Verificando acesso para ${operation}`);
		return true;
	}

	// Sistema de cache
	private getCacheKey(method: string, ...args: any[]): string {
		return `${method}_${JSON.stringify(args)}`;
	}

	private getFromCache(key: string): any {
		const cached = this.cache.get(key);
		if (!cached) {
			return null;
		}

		const isExpired =
			new Date().getTime() - cached.timestamp.getTime() > cached.ttl;
		if (isExpired) {
			console.log(`⏰ [PROXY] Cache expirado para: ${key}`);
			this.cache.delete(key);
			return null;
		}

		console.log(` [PROXY] Cache hit para: ${key}`);
		return cached.data;
	}

	private setCache(key: string, data: any, ttlMs: number = 60000): void {
		this.cache.set(key, {
			data,
			timestamp: new Date(),
			ttl: ttlMs,
		});
		console.log(` [PROXY] Dados armazenados no cache: ${key}`);
	}

	// Logging de operações
	private logOperation(
		operation: string,
		success: boolean,
		userId?: number,
	): void {
		this.operationLog.push({
			operation,
			timestamp: new Date(),
			userId,
			success,
		});
	}

	// Implementação dos métodos com controles
	getUser(id: number): {
		id: number;
		name: string;
		email: string;
		profile: object;
	} {
		const cacheKey = this.getCacheKey("getUser", id);

		// Verificar cache primeiro
		const cached = this.getFromCache(cacheKey);
		if (cached) {
			this.logOperation("getUser", true, id);
			return cached;
		}

		// Verificar acesso
		if (!this.checkAccess("getUser")) {
			this.logOperation("getUser", false, id);
			throw new Error("Acesso negado");
		}

		try {
			const result = this.getRealService().getUser(id);
			this.setCache(cacheKey, result, 30000); // Cache por 30 segundos
			this.logOperation("getUser", true, id);
			return result;
		} catch (error) {
			this.logOperation("getUser", false, id);
			throw error;
		}
	}

	updateUser(
		id: number,
		data: Partial<{ name: string; email: string }>,
	): boolean {
		if (!this.checkAccess("updateUser")) {
			this.logOperation("updateUser", false, id);
			throw new Error("Acesso negado");
		}

		try {
			const result = this.getRealService().updateUser(id, data);

			// Invalidar cache do usuário
			const cacheKey = this.getCacheKey("getUser", id);
			this.cache.delete(cacheKey);
			console.log(` [PROXY] Cache invalidado para usuário ${id}`);

			this.logOperation("updateUser", true, id);
			return result;
		} catch (error) {
			this.logOperation("updateUser", false, id);
			throw error;
		}
	}

	deleteUser(id: number): boolean {
		// Operação crítica - verificação extra
		if (!this.sessionId) {
			console.log(" [PROXY] DELETE negado - requer autenticação");
			this.logOperation("deleteUser", false, id);
			throw new Error("Operação crítica requer autenticação");
		}

		if (!this.checkAccess("deleteUser")) {
			this.logOperation("deleteUser", false, id);
			throw new Error("Acesso negado para DELETE");
		}

		try {
			const result = this.getRealService().deleteUser(id);

			// Invalidar todos os caches relacionados
			const keys = Array.from(this.cache.keys()).filter((key) =>
				key.includes(`${id}`),
			);
			keys.forEach((key) => this.cache.delete(key));
			console.log(` [PROXY] ${keys.length} entradas de cache invalidadas`);

			this.logOperation("deleteUser", true, id);
			return result;
		} catch (error) {
			this.logOperation("deleteUser", false, id);
			throw error;
		}
	}

	getUserCount(): number {
		const cacheKey = this.getCacheKey("getUserCount");

		// Cache mais longo para estatísticas
		const cached = this.getFromCache(cacheKey);
		if (cached) {
			this.logOperation("getUserCount", true);
			return cached;
		}

		if (!this.checkAccess("getUserCount")) {
			this.logOperation("getUserCount", false);
			throw new Error("Acesso negado");
		}

		try {
			const result = this.getRealService().getUserCount();
			this.setCache(cacheKey, result, 120000); // Cache por 2 minutos
			this.logOperation("getUserCount", true);
			return result;
		} catch (error) {
			this.logOperation("getUserCount", false);
			throw error;
		}
	}

	// Métodos adicionais do proxy
	clearCache(): void {
		const size = this.cache.size;
		this.cache.clear();
		console.log(`🧹 [PROXY] ${size} entradas removidas do cache`);
	}

	getCacheStats(): { size: number; entries: string[] } {
		return {
			size: this.cache.size,
			entries: Array.from(this.cache.keys()),
		};
	}

	getOperationLog(): Array<{
		operation: string;
		timestamp: Date;
		userId?: number;
		success: boolean;
	}> {
		return [...this.operationLog];
	}

	setSession(sessionId: string): void {
		this.sessionId = sessionId;
		console.log(` [PROXY] Sessão atualizada: ${sessionId}`);
	}
}

// Interface para download de arquivos
export interface FileDownloadInterface {
	downloadFile(url: string): string;
	uploadFile(filename: string, content: string): string;
}

// Serviço real de download
class RealFileDownloadService implements FileDownloadInterface {
	downloadFile(url: string): string {
		console.log(` [REAL] Baixando arquivo de: ${url}`);
		const content = `Conteúdo de ${url} - ${Math.random()}`;
		console.log(` [REAL] Download concluído: ${content.length} chars`);
		return content;
	}

	uploadFile(filename: string, content: string): string {
		console.log(`📤 [REAL] Upload: ${filename} (${content.length} chars)`);
		const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		console.log(` [REAL] Upload concluído. ID: ${fileId}`);
		return fileId;
	}
}

// Proxy com cache de arquivos
export class FileDownloadProxy implements FileDownloadInterface {
	private realService: RealFileDownloadService | null = null;
	private fileCache: Map<string, string> = new Map();
	private downloadAttempts: Map<string, number> = new Map();
	private readonly maxAttempts = 3;

	private getRealService(): RealFileDownloadService {
		if (!this.realService) {
			console.log(" [FILE-PROXY] Lazy loading - criando serviço real...");
			this.realService = new RealFileDownloadService();
		}
		return this.realService;
	}

	downloadFile(url: string): string {
		// Verificar cache primeiro
		if (this.fileCache.has(url)) {
			console.log(` [FILE-PROXY] Arquivo encontrado no cache: ${url}`);
			return this.fileCache.get(url)!;
		}

		// Verificar limite de tentativas
		const attempts = this.downloadAttempts.get(url) || 0;
		if (attempts >= this.maxAttempts) {
			console.log(` [FILE-PROXY] Muitas tentativas para: ${url}`);
			throw new Error(`Muitas tentativas de download para ${url}`);
		}

		try {
			this.downloadAttempts.set(url, attempts + 1);
			const content = this.getRealService().downloadFile(url);

			// Armazenar no cache
			this.fileCache.set(url, content);
			console.log(` [FILE-PROXY] Arquivo armazenado no cache: ${url}`);

			// Resetar contador de tentativas em caso de sucesso
			this.downloadAttempts.delete(url);

			return content;
		} catch (error) {
			console.log(`[FILE-PROXY] Erro no download: ${url}`);
			throw error;
		}
	}

	uploadFile(filename: string, content: string): string {
		// Validações do proxy
		if (!filename || filename.trim() === "") {
			throw new Error("Nome do arquivo é obrigatório");
		}

		if (content.length === 0) {
			throw new Error("Conteúdo do arquivo não pode estar vazio");
		}

		if (content.length > 1000000) {
			// 1MB
			throw new Error("Arquivo muito grande (máximo 1MB)");
		}

		console.log(` [FILE-PROXY] Validação passou para: ${filename}`);
		return this.getRealService().uploadFile(filename, content);
	}

	getCachedFiles(): string[] {
		return Array.from(this.fileCache.keys());
	}

	clearFileCache(): void {
		const size = this.fileCache.size;
		this.fileCache.clear();
		this.downloadAttempts.clear();
		console.log(`🧹 [FILE-PROXY] ${size} arquivos removidos do cache`);
	}
}

// Proxy de proteção para operações críticas
export class ProtectionProxy {
	private userRole: string;
	private dbProxy: DatabaseProxy;

	constructor(userRole: string, sessionId: string) {
		this.userRole = userRole;
		this.dbProxy = new DatabaseProxy(sessionId);
	}

	// Operações seguras para todos os usuários
	safeGetUser(id: number): any {
		try {
			return this.dbProxy.getUser(id);
		} catch (error) {
			return { error: "Acesso negado ou usuário não encontrado" };
		}
	}

	// Operações que requerem privilégios específicos
	adminDeleteUser(id: number): boolean {
		if (this.userRole !== "admin") {
			console.log(" [PROTECTION] DELETE negado - apenas admins");
			throw new Error("Apenas administradores podem deletar usuários");
		}

		console.log(" [PROTECTION] Admin confirmado - permitindo DELETE");
		return this.dbProxy.deleteUser(id);
	}

	adminGetUserCount(): number {
		if (this.userRole !== "admin") {
			console.log(" [PROTECTION] Estatísticas negadas - apenas admins");
			throw new Error("Apenas administradores podem ver estatísticas");
		}

		return this.dbProxy.getUserCount();
	}

	// Método para trocar de papel (re-autenticação)
	changeRole(newRole: string, newSessionId: string): void {
		this.userRole = newRole;
		this.dbProxy.setSession(newSessionId);
		console.log(` [PROTECTION] Role alterado para: ${newRole}`);
	}
}

// Sistema integrado usando proxies
export class SecureApplication {
	private dbProxy: DatabaseProxy;
	private fileProxy: FileDownloadProxy;
	private protectionProxy: ProtectionProxy | null = null;

	constructor() {
		// Proxies criados sem os serviços reais (lazy loading)
		this.dbProxy = new DatabaseProxy();
		this.fileProxy = new FileDownloadProxy();
		console.log(" [APP] Aplicação criada com proxies (sem conexões caras)");
	}

	// Login e criação de proxies protegidos
	login(username: string, password: string): boolean {
		if (password === "wrong") {
			console.log("[APP] Login falhou");
			return false;
		}

		const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const role = username === "admin" ? "admin" : "user";

		this.dbProxy.setSession(sessionId);
		this.protectionProxy = new ProtectionProxy(role, sessionId);

		console.log(` [APP] Login realizado: ${username} (${role})`);
		return true;
	}

	// Operações com cache automático
	getUserDataCached(userId: number): any {
		return this.dbProxy.getUser(userId);
	}

	// Download com cache de arquivos
	downloadFileCached(url: string): string {
		return this.fileProxy.downloadFile(url);
	}

	// Operação protegida
	safeDeleteUser(userId: number): boolean {
		if (!this.protectionProxy) {
			throw new Error("Login necessário");
		}
		return this.protectionProxy.adminDeleteUser(userId);
	}

	// Estatísticas protegidas
	getSecureStatistics(): any {
		if (!this.protectionProxy) {
			throw new Error("Login necessário");
		}

		const userCount = this.protectionProxy.adminGetUserCount();
		const cacheStats = this.dbProxy.getCacheStats();
		const fileCache = this.fileProxy.getCachedFiles();
		const operationLog = this.dbProxy.getOperationLog();

		return {
			userCount,
			cacheStats,
			filesCached: fileCache.length,
			recentOperations: operationLog.slice(-5),
		};
	}

	// Limpeza de cache
	clearAllCaches(): void {
		this.dbProxy.clearCache();
		this.fileProxy.clearFileCache();
		console.log("🧹 [APP] Todos os caches limpos");
	}
}

export function demonstrateSolution() {
	console.log(" DEPOIS (Solução Proxy): Controle total de acesso");
	console.log("");

	console.log("=== SOLUÇÃO 1: LAZY LOADING ===");
	console.log("Criando aplicação (sem conexões caras):");
	const app = new SecureApplication();

	console.log("\n=== SOLUÇÃO 2: CONTROLE DE ACESSO ===");
	console.log("Tentando operação sem login:");
	try {
		app.getUserDataCached(1);
	} catch (error) {
		console.log(`Erro esperado: ${(error as Error).message}`);
	}

	console.log("\nFazendo login:");
	app.login("admin", "admin123");

	console.log("\n=== SOLUÇÃO 3: CACHE AUTOMÁTICO ===");
	console.log("Acessando usuário múltiplas vezes:");
	app.getUserDataCached(1); // Primeira vez - vai ao banco
	app.getUserDataCached(1); // Segunda vez - cache hit!
	app.getUserDataCached(1); // Terceira vez - cache hit novamente!

	console.log("\nDownload de arquivos com cache:");
	app.downloadFileCached("https://api.example.com/data.json"); // Download real
	app.downloadFileCached("https://api.example.com/data.json"); // Cache hit!

	console.log("\n=== SOLUÇÃO 4: OPERAÇÕES PROTEGIDAS ===");
	console.log("Operações de administrador:");
	try {
		app.safeDeleteUser(123); // Apenas admins
		console.log(" DELETE autorizado");
	} catch (error) {
		console.log(`${(error as Error).message}`);
	}

	console.log("\n=== SOLUÇÃO 5: ESTATÍSTICAS E MONITORAMENTO ===");
	const stats = app.getSecureStatistics();
	console.log(" Estatísticas do sistema:");
	console.log(`- Usuários no sistema: ${stats.userCount}`);
	console.log(`- Entradas no cache: ${stats.cacheStats.size}`);
	console.log(`- Arquivos em cache: ${stats.filesCached}`);
	console.log(`- Operações recentes: ${stats.recentOperations.length}`);

	console.log("\n=== LIMPEZA ===");
	app.clearAllCaches();

	console.log("\n Vantagens do Proxy:");
	console.log("- Lazy loading evita conexões desnecessárias");
	console.log("- Cache reduz operações custosas");
	console.log("- Controle de acesso protege operações críticas");
	console.log("- Logging permite auditoria");
	console.log("- Validação previne erros");
	console.log("- Transparência - cliente não percebe diferença");
}

// As classes já foram exportadas na declaração
