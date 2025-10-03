// ANTES: Sem o padrão Proxy
// Acesso direto a recursos caros sem controle

// Serviço caro que acessa banco de dados
class DatabaseService {
	private connection: string;

	constructor() {
		this.connection = this.establishConnection();
	}

	private establishConnection(): string {
		console.log(" Conectando ao banco de dados... (operação cara)");
		// Simula conexão lenta
		return `connection_${Date.now()}`;
	}

	getUser(id: number): {
		id: number;
		name: string;
		email: string;
		profile: object;
	} {
		console.log(` Executando query SQL custosa para usuário ${id}...`);

		// Simula query pesada
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
		console.log(` Executando UPDATE SQL para usuário ${id}...`);
		console.log(`Dados: ${JSON.stringify(data)}`);
		return true;
	}

	deleteUser(id: number): boolean {
		console.log(` Executando DELETE SQL para usuário ${id}...`);
		return true;
	}

	getUserCount(): number {
		console.log(" Contando todos os usuários no banco...");
		return Math.floor(Math.random() * 1000) + 100;
	}
}

// Serviço de download de arquivos
class FileDownloadService {
	downloadFile(url: string): string {
		console.log(` Baixando arquivo de: ${url}`);
		console.log("⏳ Download em progresso... (operação lenta)");

		// Simula download lento
		const content = `Conteúdo do arquivo de ${url} - ${Math.random()}`;
		console.log(` Download concluído: ${content.length} caracteres`);

		return content;
	}

	uploadFile(filename: string, content: string): string {
		console.log(`📤 Fazendo upload do arquivo: ${filename}`);
		console.log(` Tamanho: ${content.length} caracteres`);

		const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		console.log(` Upload concluído. ID: ${fileId}`);

		return fileId;
	}
}

// Sistema de autenticação sem controle
class AuthenticationService {
	private sessions: Map<
		string,
		{ userId: number; role: string; expires: Date }
	> = new Map();

	login(username: string, password: string): string | null {
		console.log(` Validando credenciais para: ${username}`);

		// Simula validação sempre bem-sucedida para demonstração
		if (password === "wrong") {
			console.log("Credenciais inválidas");
			return null;
		}

		const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const expires = new Date();
		expires.setHours(expires.getHours() + 1);

		this.sessions.set(sessionId, {
			userId: 1,
			role: username === "admin" ? "admin" : "user",
			expires,
		});

		console.log(` Login realizado. SessionID: ${sessionId}`);
		return sessionId;
	}

	validateSession(sessionId: string): boolean {
		const session = this.sessions.get(sessionId);
		if (!session) {
			console.log("Sessão não encontrada");
			return false;
		}

		if (new Date() > session.expires) {
			console.log("Sessão expirada");
			this.sessions.delete(sessionId);
			return false;
		}

		console.log(" Sessão válida");
		return true;
	}

	getSessionRole(sessionId: string): string | null {
		const session = this.sessions.get(sessionId);
		return session ? session.role : null;
	}
}

// Cliente usando serviços diretamente
class ApplicationWithoutProxy {
	private dbService: DatabaseService;
	private fileService: FileDownloadService;
	private authService: AuthenticationService;

	constructor() {
		// Conexões caras criadas imediatamente
		this.dbService = new DatabaseService();
		this.fileService = new FileDownloadService();
		this.authService = new AuthenticationService();
	}

	// Acesso direto sem cache ou controle
	getUserData(userId: number): any {
		return this.dbService.getUser(userId);
	}

	downloadFileContent(url: string): string {
		return this.fileService.downloadFile(url);
	}

	// Sem controle de acesso
	deleteUserUnsafe(userId: number): boolean {
		return this.dbService.deleteUser(userId);
	}

	// Estatísticas sem cache
	getStatistics(): { userCount: number; timestamp: Date } {
		return {
			userCount: this.dbService.getUserCount(),
			timestamp: new Date(),
		};
	}
}

export function demonstrateProblems() {
	console.log("🚨 ANTES (Problemático): Acesso direto sem controle");
	console.log("");

	console.log("=== PROBLEMA 1: CRIAÇÃO CARA DE RECURSOS ===");
	console.log("Criando aplicação (observe as conexões caras):");
	const app = new ApplicationWithoutProxy();

	console.log("\n=== PROBLEMA 2: SEM CACHE - OPERAÇÕES REPETITIVAS ===");
	console.log("Acessando mesmo usuário múltiplas vezes:");
	app.getUserData(1);
	app.getUserData(1); // Mesma query custosa novamente!
	app.getUserData(1); // E novamente!

	console.log("\nBaixando mesmo arquivo múltiplas vezes:");
	app.downloadFileContent("https://example.com/data.json");
	app.downloadFileContent("https://example.com/data.json"); // Download caro novamente!

	console.log("\n=== PROBLEMA 3: SEM CONTROLE DE ACESSO ===");
	console.log("Qualquer um pode deletar usuários:");
	app.deleteUserUnsafe(123); // Sem verificação de permissão!

	console.log("\n=== PROBLEMA 4: SEM LAZY LOADING ===");
	console.log("Estatísticas pesadas executadas toda vez:");
	app.getStatistics(); // Query cara
	app.getStatistics(); // Mesma query cara novamente!

	console.log("\nProblemas identificados:");
	console.log("- Recursos caros criados desnecessariamente");
	console.log("- Operações custosas repetidas sem cache");
	console.log("- Nenhum controle de acesso ou segurança");
	console.log("- Sem lazy loading para operações pesadas");
	console.log("- Performance ruim por falta de otimizações");
	console.log("- Não há logging ou monitoramento das operações");
}
