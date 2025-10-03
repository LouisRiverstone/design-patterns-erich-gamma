import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	WarriorCharacter,
	MageCharacter,
	CharacterPrototypeRegistry,
	OptimizedCharacterFactory,
} from "./after";

describe("Prototype Pattern", () => {
	describe("Before: Without Prototype", () => {
		it("should demonstrate problems with expensive object creation", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Prototype Pattern", () => {
		it("should clone warrior characters correctly", () => {
			const originalWarrior = new WarriorCharacter("Original");
			const clonedWarrior = originalWarrior.clone();

			//  Should be different instances
			expect(clonedWarrior).not.toBe(originalWarrior);

			//  Should have same initial properties
			expect(clonedWarrior.name).toBe("Original");
			expect(clonedWarrior.characterClass).toBe("Warrior");
			expect(clonedWarrior.level).toBe(originalWarrior.level);
			expect(clonedWarrior.stats.strength).toBe(originalWarrior.stats.strength);
		});

		it("should clone mage characters correctly", () => {
			const originalMage = new MageCharacter("Original");
			const clonedMage = originalMage.clone();

			expect(clonedMage).not.toBe(originalMage);
			expect(clonedMage.name).toBe("Original");
			expect(clonedMage.characterClass).toBe("Mage");
			expect(clonedMage.stats.intelligence).toBe(
				originalMage.stats.intelligence,
			);
		});

		it("should create independent clones (deep cloning)", () => {
			const original = new WarriorCharacter("Original");
			const clone = original.clone();

			//  Modify clone
			clone.setName("Modified Clone");
			clone.setLevel(5);
			clone.addEquipment({
				name: "New Sword",
				type: "weapon",
				power: 50,
				rarity: "rare",
			});

			//  Original should remain unchanged
			expect(original.name).toBe("Original");
			expect(original.level).toBe(1);
			expect(original.equipment).toHaveLength(3); // Original equipment only

			//  Clone should have modifications
			expect(clone.name).toBe("Modified Clone");
			expect(clone.level).toBe(5);
			expect(clone.equipment).toHaveLength(4); // Original + new equipment
		});

		it("should allow fluent interface modifications", () => {
			const character = new WarriorCharacter("Test")
				.setName("Fluent Warrior")
				.setLevel(10)
				.addEquipment({
					name: "Magic Sword",
					type: "weapon",
					power: 75,
					rarity: "epic",
				});

			expect(character.name).toBe("Fluent Warrior");
			expect(character.level).toBe(10);
			expect(
				character.equipment.some((item) => item.name === "Magic Sword"),
			).toBe(true);
		});

		it("should upgrade skills correctly", () => {
			const warrior = new WarriorCharacter("Test");
			const originalSkill = warrior.skills.find(
				(s) => s.name === "Ataque Poderoso",
			);
			const originalManaCost = originalSkill?.manaCost || 0;

			warrior.upgradeSkill("Ataque Poderoso", 3);

			const upgradedSkill = warrior.skills.find(
				(s) => s.name === "Ataque Poderoso",
			);
			expect(upgradedSkill?.level).toBe(3);
			expect(upgradedSkill?.manaCost).toBeGreaterThan(originalManaCost);
		});

		describe("CharacterPrototypeRegistry", () => {
			it("should register and create characters from prototypes", () => {
				const registry = new CharacterPrototypeRegistry();
				const warriorPrototype = new WarriorCharacter("Prototype");

				registry.registerPrototype("warrior", warriorPrototype);

				const character = registry.createCharacter("warrior", "Clone");

				expect(character).not.toBeNull();
				expect(character?.name).toBe("Clone");
				expect(character?.characterClass).toBe("Warrior");
			});

			it("should return null for non-existent prototypes", () => {
				const registry = new CharacterPrototypeRegistry();

				const character = registry.createCharacter("non-existent");

				expect(character).toBeNull();
			});

			it("should create specialized characters with modifications", () => {
				const registry = new CharacterPrototypeRegistry();
				registry.registerPrototype(
					"warrior",
					new WarriorCharacter("Prototype"),
				);

				const specialized = registry.createSpecializedCharacter(
					"warrior",
					"Elite",
					{
						level: 15,
						equipment: [
							{
								name: "Elite Sword",
								type: "weapon",
								power: 100,
								rarity: "legendary",
							},
						],
						skillUpgrades: [{ name: "Ataque Poderoso", level: 5 }],
					},
				);

				expect(specialized).not.toBeNull();
				expect(specialized?.name).toBe("Elite");
				expect(specialized?.level).toBe(15);
				expect(
					specialized?.equipment.some((item) => item.name === "Elite Sword"),
				).toBe(true);

				const skill = specialized?.skills.find(
					(s) => s.name === "Ataque Poderoso",
				);
				expect(skill?.level).toBe(5);
			});

			it("should list available prototypes", () => {
				const registry = new CharacterPrototypeRegistry();
				registry.registerPrototype("warrior", new WarriorCharacter());
				registry.registerPrototype("mage", new MageCharacter());

				const available = registry.getAvailablePrototypes();

				expect(available).toContain("warrior");
				expect(available).toContain("mage");
				expect(available).toHaveLength(2);
			});
		});

		describe("OptimizedCharacterFactory", () => {
			it("should implement singleton pattern", () => {
				const factory1 = OptimizedCharacterFactory.getInstance();
				const factory2 = OptimizedCharacterFactory.getInstance();

				expect(factory1).toBe(factory2);
			});

			it("should have pre-configured prototypes", () => {
				const factory = OptimizedCharacterFactory.getInstance();
				const availableTypes = factory.getAvailableTypes();

				expect(availableTypes).toContain("warrior");
				expect(availableTypes).toContain("mage");
				expect(availableTypes).toContain("elite-warrior");
				expect(availableTypes).toContain("archmage");
			});

			it("should create teams efficiently", () => {
				const factory = OptimizedCharacterFactory.getInstance();

				const team = factory.createTeam("warrior", 5, "TeamMember");

				expect(team).toHaveLength(5);
				expect(team[0].name).toBe("TeamMember-1");
				expect(team[4].name).toBe("TeamMember-5");
				expect(team.every((char) => char.characterClass === "Warrior")).toBe(
					true,
				);
			});

			it("should create custom characters", () => {
				const factory = OptimizedCharacterFactory.getInstance();

				const custom = factory.createCustomCharacter("mage", "Custom Mage", {
					level: 10,
					equipment: [
						{
							name: "Staff of Power",
							type: "weapon",
							power: 60,
							rarity: "epic",
						},
					],
				});

				expect(custom).not.toBeNull();
				expect(custom?.name).toBe("Custom Mage");
				expect(custom?.level).toBe(10);
				expect(custom?.characterClass).toBe("Mage");
			});

			it("should handle invalid character types", () => {
				const factory = OptimizedCharacterFactory.getInstance();

				const team = factory.createTeam("invalid-type", 3);

				expect(team).toHaveLength(0);
			});
		});

		it("should have character-specific methods", () => {
			const warrior = new WarriorCharacter("Test");
			const mage = new MageCharacter("Test");

			//  Warrior specific method
			warrior.equipLegendaryWeapon();
			expect(warrior.equipment.some((item) => item.name === "Excalibur")).toBe(
				true,
			);

			//  Mage specific method
			const initialSkillCount = mage.skills.length;
			mage.learnArcaneSpell();
			expect(mage.skills).toHaveLength(initialSkillCount + 1);
			expect(mage.skills.some((skill) => skill.name === "Meteoro")).toBe(true);
		});

		it("should provide detailed character descriptions", () => {
			const character = new WarriorCharacter("Hero")
				.setLevel(15)
				.addEquipment({
					name: "Epic Armor",
					type: "armor",
					power: 50,
					rarity: "epic",
				});

			const description = character.getDescription();

			expect(description).toContain("Hero");
			expect(description).toContain("Warrior");
			expect(description).toContain("Nível 15");
			expect(description).toContain("HP:");
			expect(description).toContain("MP:");
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Prototype)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
