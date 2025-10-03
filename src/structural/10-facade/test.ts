import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	SecurityFacade,
	AdminFacade,
	type LoginResult,
	type AccessResult,
	type UserSession,
	AuthenticationSystem,
	AuthorizationSystem,
	SessionManager,
	AuditLogger,
	CacheManager,
} from "./after";

describe("Facade Pattern", () => {
	describe("Before: Without Facade", () => {
		it("should demonstrate complex client interactions", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Facade Pattern", () => {
		describe("Individual Subsystems", () => {
			it("should test authentication system", () => {
				const auth = new AuthenticationSystem();

				expect(auth.validateCredentials("admin", "admin123")).toBe(true);
				expect(auth.validateCredentials("admin", "wrong")).toBe(false);
				expect(auth.validateCredentials("nonexistent", "password")).toBe(false);

				expect(auth.getUserRole("admin")).toBe("admin");
				expect(auth.getUserRole("user")).toBe("user");
				expect(auth.getUserRole("nonexistent")).toBeNull();

				expect(auth.getAllUsers()).toContain("admin");
				expect(auth.getAllUsers()).toContain("user");
				expect(auth.getAllUsers()).toContain("guest");
			});

			it("should test authorization system", () => {
				const authz = new AuthorizationSystem();

				expect(authz.checkPermission("admin", "read")).toBe(true);
				expect(authz.checkPermission("admin", "write")).toBe(true);
				expect(authz.checkPermission("admin", "delete")).toBe(true);
				expect(authz.checkPermission("admin", "admin")).toBe(true);

				expect(authz.checkPermission("user", "read")).toBe(true);
				expect(authz.checkPermission("user", "write")).toBe(true);
				expect(authz.checkPermission("user", "delete")).toBe(false);
				expect(authz.checkPermission("user", "admin")).toBe(false);

				expect(authz.checkPermission("guest", "read")).toBe(true);
				expect(authz.checkPermission("guest", "write")).toBe(false);

				expect(authz.getRolePermissions("admin")).toEqual([
					"read",
					"write",
					"delete",
					"admin",
				]);
				expect(authz.getRolePermissions("user")).toEqual(["read", "write"]);
				expect(authz.getRolePermissions("guest")).toEqual(["read"]);
			});

			it("should test session manager", () => {
				const session = new SessionManager();

				const sessionId = session.createSession("testuser", "user");
				expect(sessionId).toBeDefined();
				expect(typeof sessionId).toBe("string");
				expect(sessionId.length).toBeGreaterThan(10);

				expect(session.validateSession(sessionId)).toBe(true);
				expect(session.validateSession("invalid-session")).toBe(false);

				const sessionInfo = session.getSessionInfo(sessionId);
				expect(sessionInfo).toBeDefined();
				expect(sessionInfo!.username).toBe("testuser");
				expect(sessionInfo!.role).toBe("user");

				expect(session.getActiveSessions()).toBe(1);

				session.destroySession(sessionId);
				expect(session.validateSession(sessionId)).toBe(false);
				expect(session.getActiveSessions()).toBe(0);
			});

			it("should test audit logger", () => {
				const logger = new AuditLogger();

				logger.logAction("testuser", "LOGIN", "Test login", true);
				logger.logAction("testuser", "ACCESS", "Test access", false);

				expect(logger.getLogCount()).toBe(2);

				const userLogs = logger.getLogs("testuser");
				expect(userLogs).toHaveLength(2);
				expect(userLogs[0].user).toBe("testuser");
				expect(userLogs[0].action).toBe("LOGIN");
				expect(userLogs[0].success).toBe(true);

				const loginLogs = logger.getLogs(undefined, "LOGIN");
				expect(loginLogs).toHaveLength(1);
				expect(loginLogs[0].action).toBe("LOGIN");

				const specificLogs = logger.getLogs("testuser", "ACCESS");
				expect(specificLogs).toHaveLength(1);
				expect(specificLogs[0].success).toBe(false);
			});

			it("should test cache manager", () => {
				const cache = new CacheManager();

				expect(cache.get("nonexistent")).toBeNull();
				expect(cache.getSize()).toBe(0);

				cache.set("test-key", { data: "test-value" }, 1);
				expect(cache.getSize()).toBe(1);

				const cached = cache.get("test-key");
				expect(cached).toEqual({ data: "test-value" });

				cache.clear();
				expect(cache.getSize()).toBe(0);
				expect(cache.get("test-key")).toBeNull();
			});
		});

		describe("SecurityFacade", () => {
			let facade: SecurityFacade;

			beforeEach(() => {
				facade = new SecurityFacade();
			});

			describe("Login functionality", () => {
				it("should perform successful login", () => {
					const result = facade.login("admin", "admin123");

					expect(result.success).toBe(true);
					expect(result.sessionId).toBeDefined();
					expect(result.message).toContain("sucesso");
					expect(result.userInfo).toBeDefined();
					expect(result.userInfo!.username).toBe("admin");
					expect(result.userInfo!.role).toBe("admin");
					expect(result.userInfo!.permissions).toContain("read");
					expect(result.userInfo!.permissions).toContain("write");
					expect(result.userInfo!.permissions).toContain("delete");
					expect(result.userInfo!.permissions).toContain("admin");
				});

				it("should handle invalid credentials", () => {
					const result = facade.login("admin", "wrongpassword");

					expect(result.success).toBe(false);
					expect(result.sessionId).toBeUndefined();
					expect(result.message).toContain("inválidas");
					expect(result.userInfo).toBeUndefined();
				});

				it("should handle nonexistent user", () => {
					const result = facade.login("nonexistent", "password");

					expect(result.success).toBe(false);
					expect(result.sessionId).toBeUndefined();
					expect(result.message).toContain("inválidas");
				});

				it("should cache user information", () => {
					// First login
					const result1 = facade.login("user", "user123");
					expect(result1.success).toBe(true);

					// Logout
					facade.logout(result1.sessionId!);

					// Second login should use cache
					const consoleSpy = vi
						.spyOn(console, "log")
						.mockImplementation(() => {});
					const result2 = facade.login("user", "user123");
					expect(result2.success).toBe(true);
					consoleSpy.mockRestore();
				});
			});

			describe("Logout functionality", () => {
				it("should perform successful logout", () => {
					const loginResult = facade.login("user", "user123");
					expect(loginResult.success).toBe(true);

					const logoutResult = facade.logout(loginResult.sessionId!);
					expect(logoutResult.success).toBe(true);
					expect(logoutResult.message).toContain("sucesso");
				});

				it("should handle invalid session on logout", () => {
					const result = facade.logout("invalid-session-id");

					expect(result.success).toBe(false);
					expect(result.message).toContain("não encontrada");
				});
			});

			describe("Access control", () => {
				let sessionId: string;

				beforeEach(() => {
					const loginResult = facade.login("admin", "admin123");
					sessionId = loginResult.sessionId!;
				});

				it("should grant access for authorized actions", () => {
					const result = facade.checkAccess(sessionId, "read");

					expect(result.success).toBe(true);
					expect(result.message).toContain("autorizado");
					expect(result.userInfo).toBeDefined();
					expect(result.userInfo!.username).toBe("admin");
					expect(result.userInfo!.role).toBe("admin");
				});

				it("should deny access for invalid session", () => {
					const result = facade.checkAccess("invalid-session", "read");

					expect(result.success).toBe(false);
					expect(result.message).toContain("inválida");
				});

				it("should test different permission levels", () => {
					// Logout admin and login as user
					facade.logout(sessionId);
					const userLogin = facade.login("user", "user123");
					const userSessionId = userLogin.sessionId!;

					// User permissions
					expect(facade.checkAccess(userSessionId, "read").success).toBe(true);
					expect(facade.checkAccess(userSessionId, "write").success).toBe(true);
					expect(facade.checkAccess(userSessionId, "delete").success).toBe(
						false,
					);
					expect(facade.checkAccess(userSessionId, "admin").success).toBe(
						false,
					);

					// Logout user and login as guest
					facade.logout(userSessionId);
					const guestLogin = facade.login("guest", "guest123");
					const guestSessionId = guestLogin.sessionId!;

					// Guest permissions
					expect(facade.checkAccess(guestSessionId, "read").success).toBe(true);
					expect(facade.checkAccess(guestSessionId, "write").success).toBe(
						false,
					);
					expect(facade.checkAccess(guestSessionId, "delete").success).toBe(
						false,
					);
					expect(facade.checkAccess(guestSessionId, "admin").success).toBe(
						false,
					);
				});
			});

			describe("Session management", () => {
				it("should get current session information", () => {
					const loginResult = facade.login("user", "user123");
					const sessionInfo = facade.getCurrentSession(loginResult.sessionId!);

					expect(sessionInfo).toBeDefined();
					expect(sessionInfo!.username).toBe("user");
					expect(sessionInfo!.role).toBe("user");
					expect(sessionInfo!.permissions).toEqual(["read", "write"]);
					expect(sessionInfo!.created).toBeInstanceOf(Date);
					expect(sessionInfo!.lastAccess).toBeInstanceOf(Date);
				});

				it("should return null for invalid session", () => {
					const sessionInfo = facade.getCurrentSession("invalid-session");
					expect(sessionInfo).toBeNull();
				});
			});

			describe("Administrative functions", () => {
				it("should get system status", () => {
					// Create some sessions and logs
					const login1 = facade.login("admin", "admin123");
					const login2 = facade.login("user", "user123");

					const status = facade.getSystemStatus();

					expect(status.activeSessions).toBeGreaterThanOrEqual(2);
					expect(status.totalLogs).toBeGreaterThan(0);
					expect(status.registeredUsers).toBe(3); // admin, user, guest
					expect(typeof status.cacheSize).toBe("number");
				});

				it("should get user logs", () => {
					const loginResult = facade.login("admin", "admin123");
					facade.checkAccess(loginResult.sessionId!, "read");

					const logs = facade.getUserLogs("admin");
					expect(logs.length).toBeGreaterThan(0);

					const loginLog = logs.find((log) => log.action === "LOGIN_SUCCESS");
					expect(loginLog).toBeDefined();
					expect(loginLog!.success).toBe(true);
				});

				it("should clear cache", () => {
					// Add something to cache through login
					facade.login("user", "user123");

					// Clear cache
					facade.clearCache();

					const status = facade.getSystemStatus();
					expect(status.cacheSize).toBe(0);
				});

				it("should validate user existence", () => {
					expect(facade.isValidUser("admin")).toBe(true);
					expect(facade.isValidUser("user")).toBe(true);
					expect(facade.isValidUser("nonexistent")).toBe(false);
				});
			});
		});

		describe("AdminFacade", () => {
			let securityFacade: SecurityFacade;
			let adminFacade: AdminFacade;

			beforeEach(() => {
				securityFacade = new SecurityFacade();
				adminFacade = new AdminFacade(securityFacade);
			});

			it("should perform admin actions successfully", () => {
				const result = adminFacade.performAdminAction(
					"admin",
					"admin123",
					"system-status",
				);

				expect(result.success).toBe(true);
				expect(result.message).toContain("executada com sucesso");
				expect(result.result).toBeDefined();
				expect(result.result.activeSessions).toBeDefined();
				expect(result.result.totalLogs).toBeDefined();
			});

			it("should deny access for non-admin users", () => {
				const result = adminFacade.performAdminAction(
					"user",
					"user123",
					"system-status",
				);

				expect(result.success).toBe(false);
				expect(result.message).toContain("privilégios de administrador");
			});

			it("should handle invalid credentials", () => {
				const result = adminFacade.performAdminAction(
					"admin",
					"wrongpassword",
					"system-status",
				);

				expect(result.success).toBe(false);
				expect(result.message).toContain("Falha no login");
			});

			it("should handle unknown admin actions", () => {
				const result = adminFacade.performAdminAction(
					"admin",
					"admin123",
					"unknown-action",
				);

				expect(result.success).toBe(false);
				expect(result.message).toContain("desconhecida");
			});

			it("should perform clear-cache action", () => {
				const result = adminFacade.performAdminAction(
					"admin",
					"admin123",
					"clear-cache",
				);

				expect(result.success).toBe(true);
				expect(result.message).toContain("executada com sucesso");
				expect(result.result).toBe("Cache limpo com sucesso");
			});

			it("should perform user-logs action", () => {
				// Generate some logs first
				securityFacade.login("admin", "admin123");

				const result = adminFacade.performAdminAction(
					"admin",
					"admin123",
					"user-logs",
				);

				expect(result.success).toBe(true);
				expect(result.message).toContain("executada com sucesso");
				expect(Array.isArray(result.result)).toBe(true);
			});

			it("should automatically logout after admin action", () => {
				const result = adminFacade.performAdminAction(
					"admin",
					"admin123",
					"system-status",
				);
				expect(result.success).toBe(true);

				// Check that the session is no longer active
				const status = securityFacade.getSystemStatus();
				// The admin facade should have logged out automatically
				expect(status.activeSessions).toBe(0);
			});
		});

		describe("Integration tests", () => {
			it("should handle complete user workflow", () => {
				const facade = new SecurityFacade();

				// 1. Login
				const loginResult = facade.login("user", "user123");
				expect(loginResult.success).toBe(true);

				// 2. Check permissions
				const readAccess = facade.checkAccess(loginResult.sessionId!, "read");
				expect(readAccess.success).toBe(true);

				const adminAccess = facade.checkAccess(loginResult.sessionId!, "admin");
				expect(adminAccess.success).toBe(false);

				// 3. Get session info
				const sessionInfo = facade.getCurrentSession(loginResult.sessionId!);
				expect(sessionInfo).toBeDefined();
				expect(sessionInfo!.permissions).toContain("read");
				expect(sessionInfo!.permissions).not.toContain("admin");

				// 4. Logout
				const logoutResult = facade.logout(loginResult.sessionId!);
				expect(logoutResult.success).toBe(true);

				// 5. Try to access after logout
				const accessAfterLogout = facade.checkAccess(
					loginResult.sessionId!,
					"read",
				);
				expect(accessAfterLogout.success).toBe(false);
			});

			it("should handle concurrent sessions", () => {
				const facade = new SecurityFacade();

				const session1 = facade.login("admin", "admin123");
				const session2 = facade.login("user", "user123");

				expect(session1.success).toBe(true);
				expect(session2.success).toBe(true);
				expect(session1.sessionId).not.toBe(session2.sessionId);

				// Both sessions should be valid
				expect(facade.checkAccess(session1.sessionId!, "admin").success).toBe(
					true,
				);
				expect(facade.checkAccess(session2.sessionId!, "read").success).toBe(
					true,
				);
				expect(facade.checkAccess(session2.sessionId!, "admin").success).toBe(
					false,
				);

				const status = facade.getSystemStatus();
				expect(status.activeSessions).toBe(2);
			});
		});

		it("should demonstrate complete solution", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Facade)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
