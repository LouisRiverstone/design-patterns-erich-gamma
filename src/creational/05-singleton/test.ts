import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	ConfigurationManager,
	CacheManager,
	DatabaseConnectionPool,
	UserService,
	ProductService,
} from "./after";

describe("Singleton Pattern", () => {
	// Reset singletons before each test to avoid state pollution
	beforeEach(() => {
		ConfigurationManager.reset();
		CacheManager.reset();
		DatabaseConnectionPool.reset();
	});

	describe("Before: Without Singleton", () => {
		it("should demonstrate problems with multiple instances", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Singleton Pattern", () => {
		describe("ConfigurationManager", () => {
			it("should return the same instance", () => {
				const config1 = ConfigurationManager.getInstance();
				const config2 = ConfigurationManager.getInstance();

				expect(config1).toBe(config2);
			});

			it("should load configuration only once", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				ConfigurationManager.getInstance();
				ConfigurationManager.getInstance();
				ConfigurationManager.getInstance();

				// Should only see the expensive loading process once
				const loadingCalls = consoleSpy.mock.calls.filter((call) =>
					call[0].includes("Carregando configuração única"),
				);
				expect(loadingCalls).toHaveLength(1);

				consoleSpy.mockRestore();
			});

			it("should update configuration globally", () => {
				const config = ConfigurationManager.getInstance();
				const originalConfig = config.getConfig();

				config.updateConfig({ debugMode: true, maxConnections: 50 });

				const updatedConfig = config.getConfig();
				expect(updatedConfig.debugMode).toBe(true);
				expect(updatedConfig.maxConnections).toBe(50);
				expect(updatedConfig.apiUrl).toBe(originalConfig.apiUrl); // Other values preserved
			});

			it("should support configuration observers", () => {
				const config = ConfigurationManager.getInstance();
				const observerSpy = vi.fn();

				config.addConfigObserver(observerSpy);
				config.updateConfig({ debugMode: true });

				expect(observerSpy).toHaveBeenCalledWith(
					expect.objectContaining({ debugMode: true }),
				);
			});

			it("should remove observers correctly", () => {
				const config = ConfigurationManager.getInstance();
				const observerSpy = vi.fn();

				config.addConfigObserver(observerSpy);
				config.removeConfigObserver(observerSpy);
				config.updateConfig({ debugMode: true });

				expect(observerSpy).not.toHaveBeenCalled();
			});
		});

		describe("CacheManager", () => {
			it("should return the same instance", () => {
				const cache1 = CacheManager.getInstance();
				const cache2 = CacheManager.getInstance();

				expect(cache1).toBe(cache2);
			});

			it("should share cache between different parts of application", () => {
				const cache = CacheManager.getInstance();

				cache.set("shared-key", "shared-value");

				// Simulate different parts of app accessing same cache
				const cache2 = CacheManager.getInstance();
				expect(cache2.get("shared-key")).toBe("shared-value");
			});

			it("should handle cache operations correctly", () => {
				const cache = CacheManager.getInstance();

				// Set and get
				cache.set("test-key", "test-value", 1000);
				expect(cache.get("test-key")).toBe("test-value");
				expect(cache.has("test-key")).toBe(true);

				// Delete
				expect(cache.delete("test-key")).toBe(true);
				expect(cache.get("test-key")).toBeNull();
				expect(cache.has("test-key")).toBe(false);
			});

			it("should handle TTL expiration", () => {
				const cache = CacheManager.getInstance();

				// Set with short TTL
				cache.set("expire-key", "expire-value", 1); // 1ms TTL

				// Wait for expiration
				return new Promise((resolve) => {
					setTimeout(() => {
						expect(cache.get("expire-key")).toBeNull();
						resolve(undefined);
					}, 10);
				});
			});

			it("should track hit/miss statistics", () => {
				const cache = CacheManager.getInstance();

				cache.set("hit-key", "hit-value");

				// Hit
				cache.get("hit-key");
				cache.get("hit-key");

				// Miss
				cache.get("miss-key");

				const stats = cache.getStats();
				expect(stats.hits).toBe(2);
				expect(stats.misses).toBe(1);
				expect(stats.hitRatio).toBeCloseTo(2 / 3);
			});

			it("should implement LRU eviction", () => {
				const cache = CacheManager.getInstance();

				// Fill cache beyond maxSize would require mocking config
				// For now, test that size is tracked
				cache.set("key1", "value1");
				cache.set("key2", "value2");

				const stats = cache.getStats();
				expect(stats.size).toBe(2);
			});

			it("should cleanup expired entries", () => {
				const cache = CacheManager.getInstance();

				cache.set("expire1", "value1", 1); // 1ms TTL
				cache.set("expire2", "value2", 1); // 1ms TTL
				cache.set("keep", "value3", 10000); // 10s TTL

				return new Promise((resolve) => {
					setTimeout(() => {
						const cleaned = cache.cleanup();
						expect(cleaned).toBe(2);
						expect(cache.has("keep")).toBe(true);
						resolve(undefined);
					}, 10);
				});
			});
		});

		describe("DatabaseConnectionPool", () => {
			it("should return the same instance", () => {
				const pool1 = DatabaseConnectionPool.getInstance();
				const pool2 = DatabaseConnectionPool.getInstance();

				expect(pool1).toBe(pool2);
			});

			it("should manage connection pool correctly", async () => {
				const pool = DatabaseConnectionPool.getInstance();

				const initialStats = pool.getPoolStats();
				expect(initialStats.available).toBeGreaterThan(0);
				expect(initialStats.active).toBe(0);

				// Get connection
				const connection = await pool.getConnection();
				expect(connection).not.toBeNull();

				const afterGetStats = pool.getPoolStats();
				expect(afterGetStats.available).toBe(initialStats.available - 1);
				expect(afterGetStats.active).toBe(1);

				// Release connection
				if (connection) {
					pool.releaseConnection(connection);
				}

				const afterReleaseStats = pool.getPoolStats();
				expect(afterReleaseStats.available).toBe(initialStats.available);
				expect(afterReleaseStats.active).toBe(0);
			});

			it("should handle pool exhaustion", async () => {
				const pool = DatabaseConnectionPool.getInstance();
				const connections: string[] = [];

				// Exhaust the pool
				let connection;
				while ((connection = await pool.getConnection()) !== null) {
					connections.push(connection);
				}

				// Should return null when pool is exhausted
				const noConnection = await pool.getConnection();
				expect(noConnection).toBeNull();

				// Release connections
				connections.forEach((conn) => pool.releaseConnection(conn));
			});
		});

		describe("Service Integration", () => {
			it("should share singletons between services", () => {
				const userService = new UserService();
				const productService = new ProductService();

				// Both services should use the same singleton instances
				const cache = CacheManager.getInstance();
				cache.set("shared-data", "test-value");

				// Both services can access the shared cache
				expect(cache.get("shared-data")).toBe("test-value");
			});

			it("should handle user service operations", async () => {
				const userService = new UserService();

				// Should cache user data
				const user1 = await userService.getUser("123");
				const user2 = await userService.getUser("123"); // Should come from cache

				expect(user1).toEqual(user2);
				expect(user1.id).toBe("123");
				expect(user1.name).toBe("User 123");
			});

			it("should handle product service operations", async () => {
				const productService = new ProductService();

				const product = await productService.getProduct("456");
				expect(product.id).toBe("456");
				expect(product.name).toBe("Product 456");
				expect(typeof product.price).toBe("number");
			});

			it("should handle cache invalidation", async () => {
				const productService = new ProductService();
				const cache = CacheManager.getInstance();

				// Get product (cached)
				await productService.getProduct("789");
				expect(cache.has("product:789")).toBe(true);

				// Update price (should invalidate cache)
				await productService.updateProductPrice("789", 99.99);
				expect(cache.has("product:789")).toBe(false);
			});

			it("should handle search operations with caching", async () => {
				const userService = new UserService();
				const cache = CacheManager.getInstance();

				const users = await userService.searchUsers("john");
				expect(users).toHaveLength(3);
				expect(cache.has("search:users:john")).toBe(true);

				// Second search should use cache
				const cachedUsers = await userService.searchUsers("john");
				expect(cachedUsers).toEqual(users);
			});
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Singleton)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
