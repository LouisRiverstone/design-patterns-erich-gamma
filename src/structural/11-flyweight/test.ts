import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	type CharacterContext,
	type CharacterFlyweight,
	CharacterFlyweightFactory,
	TextEditorWithFlyweight,
	type ParticleContext,
	type ParticleFlyweight,
	ParticleFlyweightFactory,
	ParticleSystemWithFlyweight,
} from "./after";

describe("Flyweight Pattern", () => {
	describe("Before: Without Flyweight", () => {
		it("should demonstrate memory waste problems", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Flyweight Pattern", () => {
		beforeEach(() => {
			// Clear factories before each test for clean state
			CharacterFlyweightFactory.clear();
			ParticleFlyweightFactory.clear();
		});

		describe("CharacterFlyweightFactory", () => {
			it("should create new flyweight for unique combinations", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				const flyweight1 = CharacterFlyweightFactory.getFlyweight(
					"A",
					"Arial",
					12,
					"black",
				);
				const flyweight2 = CharacterFlyweightFactory.getFlyweight(
					"B",
					"Arial",
					12,
					"black",
				);

				expect(flyweight1).toBeDefined();
				expect(flyweight2).toBeDefined();
				expect(flyweight1).not.toBe(flyweight2);
				expect(CharacterFlyweightFactory.getFlyweightCount()).toBe(2);

				consoleSpy.mockRestore();
			});

			it("should reuse existing flyweight for same combination", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				const flyweight1 = CharacterFlyweightFactory.getFlyweight(
					"A",
					"Arial",
					12,
					"black",
				);
				const flyweight2 = CharacterFlyweightFactory.getFlyweight(
					"A",
					"Arial",
					12,
					"black",
				);

				expect(flyweight1).toBe(flyweight2); // Same instance
				expect(CharacterFlyweightFactory.getFlyweightCount()).toBe(1);

				consoleSpy.mockRestore();
			});

			it("should track total intrinsic memory", () => {
				CharacterFlyweightFactory.getFlyweight("A", "Arial", 12, "black");
				CharacterFlyweightFactory.getFlyweight("B", "Arial", 12, "black");

				const totalMemory = CharacterFlyweightFactory.getTotalIntrinsicMemory();
				expect(totalMemory).toBeGreaterThan(0);
			});

			it("should list all flyweights", () => {
				CharacterFlyweightFactory.getFlyweight("A", "Arial", 12, "black");
				CharacterFlyweightFactory.getFlyweight("B", "Times", 14, "red");

				const flyweights = CharacterFlyweightFactory.listFlyweights();
				expect(flyweights).toHaveLength(2);
				expect(flyweights).toContain("A-Arial-12-black-normal");
				expect(flyweights).toContain("B-Times-14-red-normal");
			});

			it("should clear all flyweights", () => {
				CharacterFlyweightFactory.getFlyweight("A", "Arial", 12, "black");
				expect(CharacterFlyweightFactory.getFlyweightCount()).toBe(1);

				CharacterFlyweightFactory.clear();
				expect(CharacterFlyweightFactory.getFlyweightCount()).toBe(0);
			});
		});

		describe("Character Flyweight Behavior", () => {
			it("should render with external context", () => {
				const flyweight = CharacterFlyweightFactory.getFlyweight(
					"A",
					"Arial",
					12,
					"black",
				);
				const context: CharacterContext = { x: 10, y: 20 };

				const result = flyweight.render(context);
				expect(result).toContain("Char 'A'");
				expect(result).toContain("(10, 20)");
				expect(result).toContain("Arial 12px black");
			});

			it("should return intrinsic data", () => {
				const flyweight = CharacterFlyweightFactory.getFlyweight(
					"X",
					"Times",
					16,
					"blue",
					"bold",
				);
				const data = flyweight.getIntrinsicData();

				expect(data.char).toBe("X");
				expect(data.font).toBe("Times");
				expect(data.size).toBe(16);
				expect(data.color).toBe("blue");
				expect(data.style).toBe("bold");
			});
		});

		describe("TextEditorWithFlyweight", () => {
			let editor: TextEditorWithFlyweight;

			beforeEach(() => {
				editor = new TextEditorWithFlyweight();
			});

			it("should add text efficiently", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				editor.addText("AAA", 0, 0, "Arial", 12, "black");

				const memoryUsage = editor.getMemoryUsage();
				expect(memoryUsage.totalCharacters).toBe(3);
				expect(memoryUsage.uniqueFlyweights).toBe(1); // All A's share same flyweight

				consoleSpy.mockRestore();
			});

			it("should demonstrate memory savings", () => {
				editor.addText("Hello", 0, 0, "Arial", 12, "black");
				editor.addText("Hello", 0, 20, "Arial", 12, "black"); // Same flyweights

				const memoryUsage = editor.getMemoryUsage();
				expect(memoryUsage.totalCharacters).toBe(10);
				expect(memoryUsage.uniqueFlyweights).toBe(4); // H, e, l, o (l is reused)
				expect(parseFloat(memoryUsage.memorySaved)).toBeGreaterThan(0);
			});

			it("should render document correctly", () => {
				editor.addText("Hi", 0, 0, "Arial", 12, "black");

				const rendered = editor.render();
				expect(rendered).toContain("Renderizando documento otimizado");
				expect(rendered).toContain("Char 'H'");
				expect(rendered).toContain("Char 'i'");
			});

			it("should find characters by type", () => {
				editor.addText("AAB", 0, 0, "Arial", 12, "black");

				const aChars = editor.findCharactersByType("A");
				const bChars = editor.findCharactersByType("B");

				expect(aChars).toHaveLength(2);
				expect(bChars).toHaveLength(1);
			});

			it("should generate statistics", () => {
				editor.addText("Hello", 0, 0, "Arial", 12, "black");

				const stats = editor.getStatistics();
				expect(stats.characterFrequency["l"]).toBe(2);
				expect(stats.characterFrequency["H"]).toBe(1);
				expect(stats.fontUsage["Arial"]).toBe(5);
				expect(stats.colorUsage["black"]).toBe(5);
			});

			it("should clear editor", () => {
				editor.addText("Test", 0, 0, "Arial", 12, "black");
				expect(editor.getMemoryUsage().totalCharacters).toBe(4);

				editor.clear();
				expect(editor.getMemoryUsage().totalCharacters).toBe(0);
			});
		});

		describe("ParticleFlyweightFactory", () => {
			it("should create and reuse particle flyweights", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				const flyweight1 = ParticleFlyweightFactory.getFlyweight(
					"firework",
					"red",
					"firework.png",
				);
				const flyweight2 = ParticleFlyweightFactory.getFlyweight(
					"firework",
					"red",
					"firework.png",
				);
				const flyweight3 = ParticleFlyweightFactory.getFlyweight(
					"firework",
					"blue",
					"firework.png",
				);

				expect(flyweight1).toBe(flyweight2); // Same flyweight
				expect(flyweight1).not.toBe(flyweight3); // Different color
				expect(ParticleFlyweightFactory.getFlyweightCount()).toBe(2);

				consoleSpy.mockRestore();
			});

			it("should track memory usage", () => {
				ParticleFlyweightFactory.getFlyweight("smoke", "gray", "smoke.png");
				ParticleFlyweightFactory.getFlyweight(
					"explosion",
					"orange",
					"explosion.png",
				);

				const totalMemory = ParticleFlyweightFactory.getTotalIntrinsicMemory();
				expect(totalMemory).toBeGreaterThan(0);
			});

			it("should provide type distribution", () => {
				ParticleFlyweightFactory.getFlyweight(
					"firework",
					"red",
					"firework.png",
				);
				ParticleFlyweightFactory.getFlyweight(
					"firework",
					"blue",
					"firework.png",
				);
				ParticleFlyweightFactory.getFlyweight("smoke", "gray", "smoke.png");

				const distribution = ParticleFlyweightFactory.getTypeDistribution();
				expect(distribution["firework"]).toBe(2);
				expect(distribution["smoke"]).toBe(1);
			});

			it("should clear factory", () => {
				ParticleFlyweightFactory.getFlyweight("test", "white", "test.png");
				expect(ParticleFlyweightFactory.getFlyweightCount()).toBe(1);

				ParticleFlyweightFactory.clear();
				expect(ParticleFlyweightFactory.getFlyweightCount()).toBe(0);
			});
		});

		describe("Particle Flyweight Behavior", () => {
			it("should render particle with context", () => {
				const flyweight = ParticleFlyweightFactory.getFlyweight(
					"firework",
					"red",
					"firework.png",
				);
				const context: ParticleContext = {
					x: 100,
					y: 200,
					velocityX: 5,
					velocityY: -3,
					life: 50,
					maxLife: 100,
				};

				const result = flyweight.render(context);
				expect(result).toContain("firework at (100.0, 200.0)");
				expect(result).toContain("red");
				expect(result).toContain("α: 0.50"); // alpha = life/maxLife
			});

			it("should update particle context", () => {
				const flyweight = ParticleFlyweightFactory.getFlyweight(
					"smoke",
					"gray",
					"smoke.png",
				);
				const context: ParticleContext = {
					x: 50,
					y: 50,
					velocityX: 2,
					velocityY: -1,
					life: 100,
					maxLife: 100,
				};

				flyweight.update(context);

				expect(context.x).toBe(52); // 50 + 2 * 1.0 (baseVelocity)
				expect(context.y).toBe(49); // 50 + (-1) * 1.0
				expect(context.life).toBe(99); // Decremented
			});

			it("should return particle type", () => {
				const flyweight = ParticleFlyweightFactory.getFlyweight(
					"explosion",
					"orange",
					"explosion.png",
				);
				expect(flyweight.getType()).toBe("explosion");
			});

			it("should return intrinsic data", () => {
				const flyweight = ParticleFlyweightFactory.getFlyweight(
					"spark",
					"yellow",
					"spark.png",
				);
				const data = flyweight.getIntrinsicData();

				expect(data.type).toBe("spark");
				expect(data.color).toBe("yellow");
				expect(data.sprite).toBe("spark.png");
			});
		});

		describe("ParticleSystemWithFlyweight", () => {
			let system: ParticleSystemWithFlyweight;

			beforeEach(() => {
				system = new ParticleSystemWithFlyweight();
			});

			it("should create fireworks efficiently", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});

				system.createFireworks(100, 100, 10);

				const memoryUsage = system.getMemoryUsage();
				expect(memoryUsage.totalParticles).toBe(10);
				expect(memoryUsage.uniqueFlyweights).toBeLessThanOrEqual(6); // Max 6 colors

				consoleSpy.mockRestore();
			});

			it("should create smoke particles", () => {
				system.createSmoke(50, 50, 5);

				const stats = system.getStatistics();
				expect(stats.totalActive).toBe(5);
				expect(stats.typeDistribution["smoke"]).toBe(5);
			});

			it("should create explosion effects", () => {
				system.createExplosion(200, 200, "big");

				const stats = system.getStatistics();
				expect(stats.totalActive).toBe(100); // Big explosion = 100 particles
				expect(stats.typeDistribution["explosion"]).toBe(100);
			});

			it("should update and remove dead particles", () => {
				system.createFireworks(0, 0, 5);

				const initialCount = system.getStatistics().totalActive;

				// Update many times to kill particles
				for (let i = 0; i < 200; i++) {
					system.update();
				}

				const finalCount = system.getStatistics().totalActive;
				expect(finalCount).toBeLessThan(initialCount);
			});

			it("should render particle system", () => {
				system.createFireworks(100, 100, 3);

				const rendered = system.render();
				expect(rendered).toContain("Renderizando");
				expect(rendered).toContain("partículas otimizadas");
				expect(rendered).toContain("firework at");
			});

			it("should calculate memory savings", () => {
				system.createFireworks(100, 100, 20);
				system.createSmoke(50, 50, 10);

				const memoryUsage = system.getMemoryUsage();
				expect(memoryUsage.totalParticles).toBe(30);
				expect(memoryUsage.uniqueFlyweights).toBeGreaterThan(0);
				expect(memoryUsage.intrinsicMemory).toBeGreaterThan(0);
				expect(memoryUsage.extrinsicMemory).toBeGreaterThan(0);
				expect(parseFloat(memoryUsage.memorySaved)).toBeGreaterThan(0);
			});

			it("should filter particles by type", () => {
				system.createFireworks(0, 0, 5);
				system.createSmoke(0, 0, 3);

				const fireworks = system.getParticlesByType("firework");
				const smoke = system.getParticlesByType("smoke");

				expect(fireworks).toHaveLength(5);
				expect(smoke).toHaveLength(3);
			});

			it("should provide detailed statistics", () => {
				system.createFireworks(0, 0, 10);
				system.createExplosion(0, 0, "small");

				const stats = system.getStatistics();
				expect(stats.typeDistribution["firework"]).toBe(10);
				expect(stats.typeDistribution["explosion"]).toBe(50);
				expect(stats.averageLife).toBeGreaterThan(0);
				expect(stats.totalActive).toBe(60);
			});

			it("should clear particle system", () => {
				system.createFireworks(0, 0, 10);
				expect(system.getStatistics().totalActive).toBe(10);

				system.clear();
				expect(system.getStatistics().totalActive).toBe(0);
			});
		});

		describe("Memory Efficiency Integration", () => {
			it("should demonstrate significant memory savings with repeated characters", () => {
				const editor = new TextEditorWithFlyweight();

				// Add lots of repeated text
				for (let i = 0; i < 10; i++) {
					editor.addText("AAAAA", 0, i * 20, "Arial", 12, "black");
				}

				const memoryUsage = editor.getMemoryUsage();
				expect(memoryUsage.totalCharacters).toBe(50);
				expect(memoryUsage.uniqueFlyweights).toBe(1); // Only one 'A' flyweight
				expect(parseFloat(memoryUsage.memorySaved)).toBeGreaterThan(75); // >75% savings
			});

			it("should demonstrate memory efficiency with particle systems", () => {
				const system = new ParticleSystemWithFlyweight();

				// Create many particles of same type
				for (let i = 0; i < 5; i++) {
					system.createFireworks(i * 50, i * 50, 20);
				}

				const memoryUsage = system.getMemoryUsage();
				expect(memoryUsage.totalParticles).toBe(100);
				expect(memoryUsage.uniqueFlyweights).toBeLessThanOrEqual(6); // Limited by color variations
				expect(parseFloat(memoryUsage.memorySaved)).toBeGreaterThan(45); // >45% savings
			});

			it("should maintain flyweight integrity across operations", () => {
				CharacterFlyweightFactory.getFlyweight("A", "Arial", 12, "black");
				const initialCount = CharacterFlyweightFactory.getFlyweightCount();

				// Multiple editors using same flyweights
				const editor1 = new TextEditorWithFlyweight();
				const editor2 = new TextEditorWithFlyweight();

				editor1.addText("AAA", 0, 0, "Arial", 12, "black");
				editor2.addText("AAA", 0, 0, "Arial", 12, "black");

				// Flyweight count should not increase
				expect(CharacterFlyweightFactory.getFlyweightCount()).toBe(
					initialCount,
				);

				// Both editors should use same flyweight
				const chars1 = editor1.findCharactersByType("A");
				const chars2 = editor2.findCharactersByType("A");
				expect(chars1[0].flyweight).toBe(chars2[0].flyweight);
			});
		});

		it("should demonstrate complete solution", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Flyweight)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
