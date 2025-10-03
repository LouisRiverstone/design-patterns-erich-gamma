// ANTES: Sem o padrão Facade
// Cliente precisa conhecer e interagir com vários subsistemas complexos

// Subsistema de autenticação
class AuthenticationSystem {
	private users: Map<
		string,
		{ password: string; role: string; lastLogin?: Date }
	> = new Map();

	constructor() {
		// Dados de exemplo
		this.users.set("admin", { password: "admin123", role: "admin" });
		this.users.set("user", { password: "user123", role: "user" });
	}

	validateCredentials(username: string, password: string): boolean {
		console.log(` Validando credenciais para: ${username}`);
		const user = this.users.get(username);
		if (!user) {
			console.log(`Usuário não encontrado: ${username}`);
			return false;
		}

		if (user.password !== password) {
			console.log(`Senha incorreta para: ${username}`);
			return false;
		}

		console.log(` Credenciais válidas para: ${username}`);
		return true;
	}

	updateLastLogin(username: string): void {
		const user = this.users.get(username);
		if (user) {
			user.lastLogin = new Date();
			console.log(`📅 Último login atualizado para: ${username}`);
		}
	}

	getUserRole(username: string): string | null {
		const user = this.users.get(username);
		return user ? user.role : null;
	}
}

// Subsistema de autorização
class AuthorizationSystem {
	private permissions: Map<string, string[]> = new Map();

	constructor() {
		this.permissions.set("admin", ["read", "write", "delete", "admin"]);
		this.permissions.set("user", ["read"]);
	}

	checkPermission(role: string, action: string): boolean {
		console.log(` Verificando permissão: ${role} -> ${action}`);
		const rolePermissions = this.permissions.get(role);

		if (!rolePermissions) {
			console.log(`Role não encontrada: ${role}`);
			return false;
		}

		const hasPermission = rolePermissions.includes(action);
		console.log(
			`${hasPermission ? "" : ""} Permissão ${action} para ${role}: ${hasPermission}`,
		);
		return hasPermission;
	}
}

// Subsistema de sessão
class SessionManager {
	private sessions: Map<
		string,
		{ username: string; role: string; created: Date; lastAccess: Date }
	> = new Map();

	createSession(username: string, role: string): string {
		const sessionId = this.generateSessionId();
		const now = new Date();

		this.sessions.set(sessionId, {
			username,
			role,
			created: now,
			lastAccess: now,
		});

		console.log(`🎫 Sessão criada: ${sessionId} para ${username}`);
		return sessionId;
	}

	validateSession(sessionId: string): boolean {
		console.log(` Validando sessão: ${sessionId}`);
		const session = this.sessions.get(sessionId);

		if (!session) {
			console.log(`Sessão não encontrada: ${sessionId}`);
			return false;
		}

		// Verifica se a sessão não expirou (24 horas)
		const now = new Date();
		const hoursElapsed =
			(now.getTime() - session.lastAccess.getTime()) / (1000 * 60 * 60);

		if (hoursElapsed > 24) {
			console.log(`Sessão expirada: ${sessionId}`);
			this.sessions.delete(sessionId);
			return false;
		}

		// Atualiza último acesso
		session.lastAccess = now;
		console.log(` Sessão válida: ${sessionId}`);
		return true;
	}

	getSessionInfo(sessionId: string) {
		return this.sessions.get(sessionId);
	}

	destroySession(sessionId: string): void {
		console.log(` Destruindo sessão: ${sessionId}`);
		this.sessions.delete(sessionId);
	}

	private generateSessionId(): string {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}
}

// Subsistema de logging
class AuditLogger {
	private logs: Array<{
		timestamp: Date;
		user: string;
		action: string;
		details: string;
	}> = [];

	logAction(user: string, action: string, details: string): void {
		const logEntry = {
			timestamp: new Date(),
			user,
			action,
			details,
		};

		this.logs.push(logEntry);
		console.log(
			` Log: [${logEntry.timestamp.toISOString()}] ${user} -> ${action}: ${details}`,
		);
	}

	getLogs(
		user?: string,
	): Array<{ timestamp: Date; user: string; action: string; details: string }> {
		if (user) {
			return this.logs.filter((log) => log.user === user);
		}
		return [...this.logs];
	}
}

// Subsistema de cache
class CacheManager {
	private cache: Map<string, { data: any; expires: Date }> = new Map();

	set(key: string, data: any, ttlMinutes: number = 30): void {
		const expires = new Date();
		expires.setMinutes(expires.getMinutes() + ttlMinutes);

		this.cache.set(key, { data, expires });
		console.log(` Cache SET: ${key} (TTL: ${ttlMinutes}min)`);
	}

	get(key: string): any {
		console.log(` Cache GET: ${key}`);
		const entry = this.cache.get(key);

		if (!entry) {
			console.log(`Cache MISS: ${key}`);
			return null;
		}

		if (new Date() > entry.expires) {
			console.log(`Cache EXPIRED: ${key}`);
			this.cache.delete(key);
			return null;
		}

		console.log(` Cache HIT: ${key}`);
		return entry.data;
	}

	clear(): void {
		console.log(` Cache limpo`);
		this.cache.clear();
	}
}

export function demonstrateProblems() {
	console.log("🚨 ANTES (Problemático): Sem padrão Facade");
	console.log("Cliente precisa conhecer todos os subsistemas...");
	console.log("");

	// O cliente precisa instanciar e gerenciar todos os subsistemas
	const auth = new AuthenticationSystem();
	const authz = new AuthorizationSystem();
	const session = new SessionManager();
	const logger = new AuditLogger();
	const cache = new CacheManager();

	// LOGIN COMPLEXO - cliente precisa conhecer toda a sequência
	console.log("=== TENTATIVA DE LOGIN ===");
	const username = "admin";
	const password = "admin123";

	// 1. Verificar cache primeiro
	const cacheKey = `user_${username}`;
	let userInfo = cache.get(cacheKey);

	if (!userInfo) {
		// 2. Validar credenciais
		if (!auth.validateCredentials(username, password)) {
			logger.logAction(username, "LOGIN_FAILED", "Credenciais inválidas");
			console.log("Login falhou!");
			return;
		}

		// 3. Obter role do usuário
		const role = auth.getUserRole(username);
		if (!role) {
			logger.logAction(username, "LOGIN_FAILED", "Role não encontrada");
			console.log("Login falhou!");
			return;
		}

		userInfo = { username, role };
		cache.set(cacheKey, userInfo, 15); // Cache por 15 minutos
	}

	// 4. Atualizar último login
	auth.updateLastLogin(username);

	// 5. Criar sessão
	const sessionId = session.createSession(userInfo.username, userInfo.role);

	// 6. Log da ação
	logger.logAction(username, "LOGIN_SUCCESS", `SessionId: ${sessionId}`);

	console.log(` Login realizado! SessionId: ${sessionId}`);
	console.log("");

	// ACESSO A RECURSO - outro processo complexo
	console.log("=== TENTATIVA DE ACESSO A RECURSO ===");
	const resourceAction = "delete";

	// 1. Validar sessão
	if (!session.validateSession(sessionId)) {
		logger.logAction("UNKNOWN", "ACCESS_DENIED", "Sessão inválida");
		console.log("Acesso negado - sessão inválida!");
		return;
	}

	// 2. Obter informações da sessão
	const sessionInfo = session.getSessionInfo(sessionId);
	if (!sessionInfo) {
		console.log("Informações da sessão não encontradas!");
		return;
	}

	// 3. Verificar autorização
	if (!authz.checkPermission(sessionInfo.role, resourceAction)) {
		logger.logAction(
			sessionInfo.username,
			"ACCESS_DENIED",
			`Ação: ${resourceAction}`,
		);
		console.log("Acesso negado - sem permissão!");
		return;
	}

	// 4. Log da ação
	logger.logAction(
		sessionInfo.username,
		"RESOURCE_ACCESS",
		`Ação: ${resourceAction}`,
	);
	console.log(` Acesso autorizado para ${resourceAction}!`);

	console.log("");
	console.log("Problemas:");
	console.log("- Cliente precisa conhecer 5 subsistemas diferentes");
	console.log("- Sequência complexa e propensa a erros");
	console.log("- Acoplamento forte entre cliente e subsistemas");
	console.log("- Código duplicado para sequências similares");
	console.log("- Difícil manutenção e evolução");
	console.log("- Violação do princípio de responsabilidade única");
}
