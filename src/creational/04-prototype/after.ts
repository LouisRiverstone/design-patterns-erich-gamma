// Solução: Prototype Pattern para clonagem eficiente de objetos
// Benefício: Reutilização de configurações custosas e criação eficiente

interface Equipment {
	name: string;
	type: string;
	power: number;
	rarity: string;
}

interface Skill {
	name: string;
	level: number;
	cooldown: number;
	manaCost: number;
}

interface CharacterStats {
	strength: number;
	agility: number;
	intelligence: number;
	vitality: number;
}

//  Interface Prototype define método de clonagem
interface Prototype<T> {
	clone(): T;
}

//  Implementação base com clonagem profunda
abstract class GameCharacter implements Prototype<GameCharacter> {
	constructor(
		public name: string,
		public level: number,
		public health: number,
		public mana: number,
		public equipment: Equipment[],
		public skills: Skill[],
		public stats: CharacterStats,
		public characterClass: string,
	) {}

	//  Clonagem profunda para evitar referências compartilhadas
	clone(): GameCharacter {
		const cloned = Object.create(Object.getPrototypeOf(this));

		// Clonagem profunda de propriedades
		cloned.name = this.name;
		cloned.level = this.level;
		cloned.health = this.health;
		cloned.mana = this.mana;
		cloned.characterClass = this.characterClass;

		//  Deep clone de arrays e objetos
		cloned.equipment = this.equipment.map((item) => ({ ...item }));
		cloned.skills = this.skills.map((skill) => ({ ...skill }));
		cloned.stats = { ...this.stats };

		console.log(
			` Clonando ${this.characterClass} ${this.name} (processo rápido)`,
		);
		return cloned;
	}

	//  Métodos para customização pós-clonagem
	setName(name: string): this {
		this.name = name;
		return this;
	}

	setLevel(level: number): this {
		this.level = level;
		this.recalculateStats();
		return this;
	}

	addEquipment(equipment: Equipment): this {
		this.equipment.push({ ...equipment });
		this.recalculateStats();
		return this;
	}

	upgradeSkill(skillName: string, newLevel: number): this {
		const skill = this.skills.find((s) => s.name === skillName);
		if (skill) {
			skill.level = newLevel;
			skill.manaCost = Math.floor(skill.manaCost * (1 + newLevel * 0.1));
		}
		return this;
	}

	private recalculateStats(): void {
		let totalPower = 0;
		for (const item of this.equipment) {
			totalPower += item.power;
		}

		const baseStat =
			this.characterClass === "Warrior"
				? this.stats.vitality
				: this.stats.intelligence;
		const multiplier = this.characterClass === "Warrior" ? 5 : 3;

		this.health =
			(this.characterClass === "Warrior" ? 100 : 60) +
			baseStat * multiplier +
			totalPower +
			this.level * 10;

		this.mana =
			(this.characterClass === "Warrior" ? 20 : 100) +
			this.stats.intelligence * (this.characterClass === "Warrior" ? 3 : 5) +
			this.level * 5;
	}

	getDescription(): string {
		return `${this.name} (${this.characterClass}) - Nível ${this.level} | HP: ${this.health} | MP: ${this.mana} | Equipamentos: ${this.equipment.length}`;
	}
}

//  Implementação concreta do Warrior
export class WarriorCharacter extends GameCharacter {
	constructor(name: string = "Guerreiro") {
		//  Configuração custosa feita apenas uma vez no protótipo
		const equipment: Equipment[] = [
			{ name: "Espada de Ferro", type: "weapon", power: 25, rarity: "common" },
			{ name: "Armadura de Couro", type: "armor", power: 15, rarity: "common" },
			{
				name: "Escudo de Madeira",
				type: "shield",
				power: 10,
				rarity: "common",
			},
		];

		const skills: Skill[] = [
			{ name: "Ataque Poderoso", level: 1, cooldown: 3, manaCost: 5 },
			{ name: "Defesa", level: 1, cooldown: 2, manaCost: 3 },
			{ name: "Berserker", level: 1, cooldown: 10, manaCost: 15 },
		];

		const stats: CharacterStats = {
			strength: 15,
			agility: 8,
			intelligence: 5,
			vitality: 12,
		};

		super(name, 1, 100, 20, equipment, skills, stats, "Warrior");

		//  Processo custoso executado apenas uma vez
		console.log(
			" Configurando guerreiro protótipo (processo custoso único)...",
		);
		this.initializeWarrior();
	}

	private initializeWarrior(): void {
		// Simula processo custoso de inicialização
		let totalPower = 0;
		for (const item of this.equipment) {
			totalPower += item.power;
		}

		this.health = 100 + this.stats.vitality * 5 + totalPower;
		this.mana = 20 + this.stats.intelligence * 3;
	}

	//  Métodos específicos do guerreiro
	equipLegendaryWeapon(): this {
		this.addEquipment({
			name: "Excalibur",
			type: "weapon",
			power: 100,
			rarity: "legendary",
		});
		return this;
	}
}

//  Implementação concreta do Mage
export class MageCharacter extends GameCharacter {
	constructor(name: string = "Mago") {
		const equipment: Equipment[] = [
			{ name: "Varinha Mágica", type: "weapon", power: 30, rarity: "uncommon" },
			{ name: "Robes Místicos", type: "armor", power: 8, rarity: "common" },
			{ name: "Amuleto de Mana", type: "accessory", power: 12, rarity: "rare" },
		];

		const skills: Skill[] = [
			{ name: "Bola de Fogo", level: 1, cooldown: 2, manaCost: 8 },
			{ name: "Cura", level: 1, cooldown: 4, manaCost: 12 },
			{ name: "Teleporte", level: 1, cooldown: 15, manaCost: 25 },
		];

		const stats: CharacterStats = {
			strength: 5,
			agility: 7,
			intelligence: 18,
			vitality: 8,
		};

		super(name, 1, 60, 100, equipment, skills, stats, "Mage");

		console.log(" Configurando mago protótipo (processo custoso único)...");
		this.initializeMage();
	}

	private initializeMage(): void {
		let totalPower = 0;
		for (const item of this.equipment) {
			totalPower += item.power;
		}

		this.health = 60 + this.stats.vitality * 3 + totalPower;
		this.mana = 100 + this.stats.intelligence * 5;
	}

	//  Métodos específicos do mago
	learnArcaneSpell(): this {
		this.skills.push({ name: "Meteoro", level: 1, cooldown: 20, manaCost: 50 });
		return this;
	}
}

//  Registry para gerenciar protótipos
export class CharacterPrototypeRegistry {
	private prototypes = new Map<string, GameCharacter>();

	//  Registra protótipos pré-configurados
	registerPrototype(key: string, prototype: GameCharacter): void {
		this.prototypes.set(key, prototype);
	}

	//  Clona protótipo registrado
	createCharacter(key: string, name?: string): GameCharacter | null {
		const prototype = this.prototypes.get(key);
		if (!prototype) {
			console.log(`Protótipo '${key}' não encontrado`);
			return null;
		}

		const clone = prototype.clone();
		if (name) {
			clone.setName(name);
		}

		return clone;
	}

	getAvailablePrototypes(): string[] {
		return Array.from(this.prototypes.keys());
	}

	//  Cria variações especializadas
	createSpecializedCharacter(
		baseKey: string,
		name: string,
		modifications: {
			level?: number;
			equipment?: Equipment[];
			skillUpgrades?: Array<{ name: string; level: number }>;
		},
	): GameCharacter | null {
		const character = this.createCharacter(baseKey, name);
		if (!character) return null;

		if (modifications.level) {
			character.setLevel(modifications.level);
		}

		if (modifications.equipment) {
			modifications.equipment.forEach((item) => character.addEquipment(item));
		}

		if (modifications.skillUpgrades) {
			modifications.skillUpgrades.forEach((upgrade) =>
				character.upgradeSkill(upgrade.name, upgrade.level),
			);
		}

		return character;
	}
}

//  Factory otimizada usando protótipos
export class OptimizedCharacterFactory {
	private registry: CharacterPrototypeRegistry;
	private static instance: OptimizedCharacterFactory;

	constructor() {
		this.registry = new CharacterPrototypeRegistry();
		this.initializePrototypes();
	}

	static getInstance(): OptimizedCharacterFactory {
		if (!OptimizedCharacterFactory.instance) {
			OptimizedCharacterFactory.instance = new OptimizedCharacterFactory();
		}
		return OptimizedCharacterFactory.instance;
	}

	private initializePrototypes(): void {
		//  Criação custosa feita apenas uma vez
		this.registry.registerPrototype(
			"warrior",
			new WarriorCharacter("Protótipo Guerreiro"),
		);
		this.registry.registerPrototype(
			"mage",
			new MageCharacter("Protótipo Mago"),
		);

		//  Protótipos especializados
		const eliteWarrior = new WarriorCharacter("Elite Warrior")
			.setLevel(10)
			.equipLegendaryWeapon();
		this.registry.registerPrototype("elite-warrior", eliteWarrior);

		const archmage = new MageCharacter("Archmage")
			.setLevel(15)
			.learnArcaneSpell();
		this.registry.registerPrototype("archmage", archmage);
	}

	//  Criação em massa eficiente
	createTeam(
		type: string,
		teamSize: number,
		namePrefix: string = "Jogador",
	): GameCharacter[] {
		const team: GameCharacter[] = [];

		for (let i = 0; i < teamSize; i++) {
			const character = this.registry.createCharacter(
				type,
				`${namePrefix}-${i + 1}`,
			);
			if (character) {
				team.push(character);
			}
		}

		return team;
	}

	//  Criação personalizada eficiente
	createCustomCharacter(
		baseType: string,
		name: string,
		customizations: any,
	): GameCharacter | null {
		return this.registry.createSpecializedCharacter(
			baseType,
			name,
			customizations,
		);
	}

	getAvailableTypes(): string[] {
		return this.registry.getAvailablePrototypes();
	}
}

//  Demonstração da solução
export function demonstrateSolution() {
	console.log("=== DEPOIS (Solução Prototype) ===");

	const factory = OptimizedCharacterFactory.getInstance();

	console.log(" Tipos disponíveis:", factory.getAvailableTypes());

	//  Criação eficiente usando clonagem
	console.time("Criação de time de guerreiros (clonagem)");
	const warriorTeam = factory.createTeam("warrior", 5, "Guerreiro");
	console.timeEnd("Criação de time de guerreiros (clonagem)");

	console.time("Criação de guilda de magos (clonagem)");
	const mageGuild = factory.createTeam("mage", 3, "Mago");
	console.timeEnd("Criação de guilda de magos (clonagem)");

	console.log(` Time clonado: ${warriorTeam.length} guerreiros`);
	warriorTeam.forEach((w) => console.log(`  ${w.getDescription()}`));

	console.log(` Guilda clonada: ${mageGuild.length} magos`);
	mageGuild.forEach((m) => console.log(`  ${m.getDescription()}`));

	//  Personalização eficiente
	console.time("Criação de herói customizado (clonagem + customização)");
	const hero = factory.createCustomCharacter(
		"elite-warrior",
		"Herói Lendário",
		{
			level: 20,
			equipment: [
				{ name: "Armadura Divina", type: "armor", power: 80, rarity: "mythic" },
			],
			skillUpgrades: [{ name: "Ataque Poderoso", level: 5 }],
		},
	);
	console.timeEnd("Criação de herói customizado (clonagem + customização)");

	if (hero) {
		console.log(`🦸 Herói: ${hero.getDescription()}`);
	}

	//  Demonstra independência dos clones
	const warrior1 = factory.createTeam("warrior", 1, "Test")[0];
	const warrior2 = warrior1.clone().setName("Clone").setLevel(5);

	console.log("\n Independência dos clones:");
	console.log(`Original: ${warrior1.getDescription()}`);
	console.log(`Clone modificado: ${warrior2.getDescription()}`);
}
