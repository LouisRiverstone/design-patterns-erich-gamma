//  DEPOIS: Com o padrão Facade
// Interface simples que esconde a complexidade dos subsistemas

// Reutilizando os subsistemas existentes (na prática, estariam em arquivos separados)
class AuthenticationSystem {
	private users: Map<
		string,
		{ password: string; role: string; lastLogin?: Date }
	> = new Map();

	constructor() {
		this.users.set("admin", { password: "admin123", role: "admin" });
		this.users.set("user", { password: "user123", role: "user" });
		this.users.set("guest", { password: "guest123", role: "guest" });
	}

	validateCredentials(username: string, password: string): boolean {
		const user = this.users.get(username);
		return user ? user.password === password : false;
	}

	updateLastLogin(username: string): void {
		const user = this.users.get(username);
		if (user) {
			user.lastLogin = new Date();
		}
	}

	getUserRole(username: string): string | null {
		const user = this.users.get(username);
		return user ? user.role : null;
	}

	getAllUsers(): string[] {
		return Array.from(this.users.keys());
	}
}

class AuthorizationSystem {
	private permissions: Map<string, string[]> = new Map();

	constructor() {
		this.permissions.set("admin", ["read", "write", "delete", "admin"]);
		this.permissions.set("user", ["read", "write"]);
		this.permissions.set("guest", ["read"]);
	}

	checkPermission(role: string, action: string): boolean {
		const rolePermissions = this.permissions.get(role);
		return rolePermissions ? rolePermissions.includes(action) : false;
	}

	getRolePermissions(role: string): string[] {
		return this.permissions.get(role) || [];
	}
}

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

		return sessionId;
	}

	validateSession(sessionId: string): boolean {
		const session = this.sessions.get(sessionId);

		if (!session) {
			return false;
		}

		const now = new Date();
		const hoursElapsed =
			(now.getTime() - session.lastAccess.getTime()) / (1000 * 60 * 60);

		if (hoursElapsed > 24) {
			this.sessions.delete(sessionId);
			return false;
		}

		session.lastAccess = now;
		return true;
	}

	getSessionInfo(sessionId: string) {
		return this.sessions.get(sessionId);
	}

	destroySession(sessionId: string): void {
		this.sessions.delete(sessionId);
	}

	getActiveSessions(): number {
		return this.sessions.size;
	}

	private generateSessionId(): string {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}
}

class AuditLogger {
	private logs: Array<{
		timestamp: Date;
		user: string;
		action: string;
		details: string;
		success: boolean;
	}> = [];

	logAction(
		user: string,
		action: string,
		details: string,
		success: boolean = true,
	): void {
		const logEntry = {
			timestamp: new Date(),
			user,
			action,
			details,
			success,
		};

		this.logs.push(logEntry);
	}

	getLogs(
		user?: string,
		action?: string,
	): Array<{
		timestamp: Date;
		user: string;
		action: string;
		details: string;
		success: boolean;
	}> {
		let filteredLogs = [...this.logs];

		if (user) {
			filteredLogs = filteredLogs.filter((log) => log.user === user);
		}

		if (action) {
			filteredLogs = filteredLogs.filter((log) => log.action === action);
		}

		return filteredLogs;
	}

	getLogCount(): number {
		return this.logs.length;
	}
}

class CacheManager {
	private cache: Map<string, { data: any; expires: Date }> = new Map();

	set(key: string, data: any, ttlMinutes: number = 30): void {
		const expires = new Date();
		expires.setMinutes(expires.getMinutes() + ttlMinutes);
		this.cache.set(key, { data, expires });
	}

	get(key: string): any {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		if (new Date() > entry.expires) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	clear(): void {
		this.cache.clear();
	}

	getSize(): number {
		return this.cache.size;
	}
}

// Tipos para retornos da Facade
export interface LoginResult {
	success: boolean;
	sessionId?: string;
	message: string;
	userInfo?: {
		username: string;
		role: string;
		permissions: string[];
	};
}

export interface AccessResult {
	success: boolean;
	message: string;
	userInfo?: {
		username: string;
		role: string;
	};
}

export interface UserSession {
	username: string;
	role: string;
	permissions: string[];
	created: Date;
	lastAccess: Date;
}

//  FACADE - Interface simplificada para o sistema complexo
export class SecurityFacade {
	private auth: AuthenticationSystem;
	private authz: AuthorizationSystem;
	private session: SessionManager;
	private logger: AuditLogger;
	private cache: CacheManager;

	constructor() {
		this.auth = new AuthenticationSystem();
		this.authz = new AuthorizationSystem();
		this.session = new SessionManager();
		this.logger = new AuditLogger();
		this.cache = new CacheManager();
	}

	// Operação simplificada de login
	login(username: string, password: string): LoginResult {
		console.log(` Processando login para: ${username}`);

		try {
			// 1. Verificar cache primeiro (otimização)
			const cacheKey = `user_${username}`;
			let userInfo = this.cache.get(cacheKey);

			if (!userInfo) {
				// 2. Validar credenciais
				if (!this.auth.validateCredentials(username, password)) {
					this.logger.logAction(
						username,
						"LOGIN_FAILED",
						"Credenciais inválidas",
						false,
					);
					return {
						success: false,
						message: "Credenciais inválidas",
					};
				}

				// 3. Obter informações do usuário
				const role = this.auth.getUserRole(username);
				if (!role) {
					this.logger.logAction(
						username,
						"LOGIN_FAILED",
						"Role não encontrada",
						false,
					);
					return {
						success: false,
						message: "Erro interno - role não encontrada",
					};
				}

				const permissions = this.authz.getRolePermissions(role);
				userInfo = { username, role, permissions };

				// Cache por 15 minutos
				this.cache.set(cacheKey, userInfo, 15);
			}

			// 4. Atualizar último login
			this.auth.updateLastLogin(username);

			// 5. Criar sessão
			const sessionId = this.session.createSession(
				userInfo.username,
				userInfo.role,
			);

			// 6. Log de sucesso
			this.logger.logAction(
				username,
				"LOGIN_SUCCESS",
				`SessionId: ${sessionId}`,
			);

			console.log(` Login realizado com sucesso para: ${username}`);

			return {
				success: true,
				sessionId,
				message: "Login realizado com sucesso",
				userInfo,
			};
		} catch (error) {
			this.logger.logAction(username, "LOGIN_ERROR", `Erro: ${error}`, false);
			return {
				success: false,
				message: "Erro interno do sistema",
			};
		}
	}

	// Operação simplificada de logout
	logout(sessionId: string): { success: boolean; message: string } {
		console.log(` Processando logout para sessão: ${sessionId}`);

		const sessionInfo = this.session.getSessionInfo(sessionId);

		if (sessionInfo) {
			this.session.destroySession(sessionId);
			this.logger.logAction(
				sessionInfo.username,
				"LOGOUT",
				`SessionId: ${sessionId}`,
			);

			console.log(` Logout realizado para: ${sessionInfo.username}`);
			return {
				success: true,
				message: "Logout realizado com sucesso",
			};
		}

		return {
			success: false,
			message: "Sessão não encontrada",
		};
	}

	// Operação simplificada de verificação de acesso
	checkAccess(sessionId: string, action: string): AccessResult {
		console.log(` Verificando acesso para ação: ${action}`);

		try {
			// 1. Validar sessão
			if (!this.session.validateSession(sessionId)) {
				this.logger.logAction(
					"UNKNOWN",
					"ACCESS_DENIED",
					`Sessão inválida: ${sessionId}`,
					false,
				);
				return {
					success: false,
					message: "Sessão inválida ou expirada",
				};
			}

			// 2. Obter informações da sessão
			const sessionInfo = this.session.getSessionInfo(sessionId);
			if (!sessionInfo) {
				return {
					success: false,
					message: "Informações da sessão não encontradas",
				};
			}

			// 3. Verificar autorização
			if (!this.authz.checkPermission(sessionInfo.role, action)) {
				this.logger.logAction(
					sessionInfo.username,
					"ACCESS_DENIED",
					`Ação: ${action}`,
					false,
				);
				return {
					success: false,
					message: `Acesso negado para ação: ${action}`,
					userInfo: {
						username: sessionInfo.username,
						role: sessionInfo.role,
					},
				};
			}

			// 4. Log de sucesso
			this.logger.logAction(
				sessionInfo.username,
				"ACCESS_GRANTED",
				`Ação: ${action}`,
			);

			console.log(
				` Acesso autorizado para ${sessionInfo.username} -> ${action}`,
			);

			return {
				success: true,
				message: `Acesso autorizado para: ${action}`,
				userInfo: {
					username: sessionInfo.username,
					role: sessionInfo.role,
				},
			};
		} catch (error) {
			this.logger.logAction("UNKNOWN", "ACCESS_ERROR", `Erro: ${error}`, false);
			return {
				success: false,
				message: "Erro interno do sistema",
			};
		}
	}

	// Operação para obter sessão atual
	getCurrentSession(sessionId: string): UserSession | null {
		if (!this.session.validateSession(sessionId)) {
			return null;
		}

		const sessionInfo = this.session.getSessionInfo(sessionId);
		if (!sessionInfo) {
			return null;
		}

		const permissions = this.authz.getRolePermissions(sessionInfo.role);

		return {
			username: sessionInfo.username,
			role: sessionInfo.role,
			permissions,
			created: sessionInfo.created,
			lastAccess: sessionInfo.lastAccess,
		};
	}

	// Operações administrativas simplificadas
	getSystemStatus(): {
		activeSessions: number;
		totalLogs: number;
		cacheSize: number;
		registeredUsers: number;
	} {
		return {
			activeSessions: this.session.getActiveSessions(),
			totalLogs: this.logger.getLogCount(),
			cacheSize: this.cache.getSize(),
			registeredUsers: this.auth.getAllUsers().length,
		};
	}

	getUserLogs(
		username: string,
	): Array<{
		timestamp: Date;
		action: string;
		details: string;
		success: boolean;
	}> {
		return this.logger.getLogs(username);
	}

	clearCache(): void {
		this.cache.clear();
		this.logger.logAction(
			"SYSTEM",
			"CACHE_CLEARED",
			"Cache limpo pelo sistema",
		);
	}

	// Método para demonstração - normalmente não existiria
	isValidUser(username: string): boolean {
		return this.auth.getAllUsers().includes(username);
	}
}

// Facade adicional para operações específicas de administração
export class AdminFacade {
	private securityFacade: SecurityFacade;

	constructor(securityFacade: SecurityFacade) {
		this.securityFacade = securityFacade;
	}

	// Operação completa: login + verificação de admin + ação administrativa
	performAdminAction(
		username: string,
		password: string,
		action: string,
	): {
		success: boolean;
		message: string;
		result?: any;
	} {
		console.log(` Executando ação administrativa: ${action}`);

		// 1. Login
		const loginResult = this.securityFacade.login(username, password);
		if (!loginResult.success) {
			return {
				success: false,
				message: `Falha no login: ${loginResult.message}`,
			};
		}

		// 2. Verificar se é admin
		const accessResult = this.securityFacade.checkAccess(
			loginResult.sessionId!,
			"admin",
		);
		if (!accessResult.success) {
			// Logout automático em caso de falha
			this.securityFacade.logout(loginResult.sessionId!);
			return {
				success: false,
				message: "Acesso negado - privilégios de administrador necessários",
			};
		}

		// 3. Executar ação específica
		let result;
		switch (action) {
			case "system-status":
				result = this.securityFacade.getSystemStatus();
				break;
			case "clear-cache":
				this.securityFacade.clearCache();
				result = "Cache limpo com sucesso";
				break;
			case "user-logs":
				result = this.securityFacade.getUserLogs(username);
				break;
			default:
				this.securityFacade.logout(loginResult.sessionId!);
				return {
					success: false,
					message: `Ação administrativa desconhecida: ${action}`,
				};
		}

		// 4. Logout
		this.securityFacade.logout(loginResult.sessionId!);

		return {
			success: true,
			message: `Ação ${action} executada com sucesso`,
			result,
		};
	}
}

export function demonstrateSolution() {
	console.log(" DEPOIS (Solução Facade): Interface simplificada");
	console.log("");

	const security = new SecurityFacade();
	const admin = new AdminFacade(security);

	console.log("=== OPERAÇÕES SIMPLIFICADAS COM FACADE ===");

	// 1. Login simplificado
	console.log("\n1. Login do usuário:");
	const loginResult = security.login("admin", "admin123");
	console.log(
		`Resultado: ${loginResult.success ? "" : ""} ${loginResult.message}`,
	);

	if (loginResult.success && loginResult.userInfo) {
		console.log(`Usuário: ${loginResult.userInfo.username}`);
		console.log(`Role: ${loginResult.userInfo.role}`);
		console.log(`Permissões: ${loginResult.userInfo.permissions.join(", ")}`);
	}

	// 2. Verificação de acesso simplificada
	if (loginResult.success && loginResult.sessionId) {
		console.log("\n2. Verificação de acesso:");

		const readAccess = security.checkAccess(loginResult.sessionId, "read");
		console.log(
			`Leitura: ${readAccess.success ? "" : ""} ${readAccess.message}`,
		);

		const deleteAccess = security.checkAccess(loginResult.sessionId, "delete");
		console.log(
			`Exclusão: ${deleteAccess.success ? "" : ""} ${deleteAccess.message}`,
		);

		// 3. Informações da sessão
		console.log("\n3. Informações da sessão:");
		const currentSession = security.getCurrentSession(loginResult.sessionId);
		if (currentSession) {
			console.log(`Usuário ativo: ${currentSession.username}`);
			console.log(`Criado em: ${currentSession.created.toLocaleString()}`);
			console.log(
				`Último acesso: ${currentSession.lastAccess.toLocaleString()}`,
			);
		}

		// 4. Logout
		console.log("\n4. Logout:");
		const logoutResult = security.logout(loginResult.sessionId);
		console.log(`${logoutResult.success ? "" : ""} ${logoutResult.message}`);
	}

	// 5. Operações administrativas
	console.log("\n5. Operações administrativas (Facade composta):");
	const statusResult = admin.performAdminAction(
		"admin",
		"admin123",
		"system-status",
	);
	console.log(`${statusResult.success ? "" : ""} ${statusResult.message}`);
	if (statusResult.result) {
		console.log("Status do sistema:", statusResult.result);
	}

	// 6. Tentativa com usuário sem privilégios
	console.log("\n6. Tentativa com usuário comum:");
	const userResult = admin.performAdminAction(
		"user",
		"user123",
		"system-status",
	);
	console.log(`${userResult.success ? "" : ""} ${userResult.message}`);

	console.log("\n Vantagens da Facade:");
	console.log("- Interface única e simples para operações complexas");
	console.log("- Cliente não precisa conhecer os subsistemas");
	console.log("- Reduz acoplamento e complexidade");
	console.log("- Facilita manutenção e evolução");
	console.log("- Permite composição de operações (AdminFacade)");
	console.log("- Centraliza tratamento de erros e logging");
}

export {
	AuthenticationSystem,
	AuthorizationSystem,
	SessionManager,
	AuditLogger,
	CacheManager,
};
