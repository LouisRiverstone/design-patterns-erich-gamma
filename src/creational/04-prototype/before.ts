// Cenário: Sistema de criação de personagens para um jogo
// Problema: Criação custosa de objetos complexos com configurações similares

interface GameCharacter {
	name: string;
	level: number;
	health: number;
	mana: number;
	equipment: Equipment[];
	skills: Skill[];
	stats: CharacterStats;
}

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

// Abordagem ingênua: criação manual repetitiva e custosa
class WarriorCharacter implements GameCharacter {
	constructor(
		public name: string,
		public level: number = 1,
		public health: number = 100,
		public mana: number = 20,
		public equipment: Equipment[] = [],
		public skills: Skill[] = [],
		public stats: CharacterStats = {
			strength: 0,
			agility: 0,
			intelligence: 0,
			vitality: 0,
		},
	) {
		// Configuração custosa em cada criação
		this.setupWarriorDefaults();
	}

	private setupWarriorDefaults(): void {
		// Processo custoso executado a cada criação
		console.log(" Configurando guerreiro (processo custoso)...");

		// Configuração padrão do guerreiro
		this.stats = {
			strength: 15,
			agility: 8,
			intelligence: 5,
			vitality: 12,
		};

		// Criação repetitiva de equipamentos
		this.equipment = [
			{ name: "Espada de Ferro", type: "weapon", power: 25, rarity: "common" },
			{ name: "Armadura de Couro", type: "armor", power: 15, rarity: "common" },
			{
				name: "Escudo de Madeira",
				type: "shield",
				power: 10,
				rarity: "common",
			},
		];

		// Criação repetitiva de habilidades
		this.skills = [
			{ name: "Ataque Poderoso", level: 1, cooldown: 3, manaCost: 5 },
			{ name: "Defesa", level: 1, cooldown: 2, manaCost: 3 },
			{ name: "Berserker", level: 1, cooldown: 10, manaCost: 15 },
		];

		// Simula processo custoso de cálculos
		this.recalculateStats();
	}

	private recalculateStats(): void {
		// Cálculos complexos repetidos desnecessariamente
		let totalPower = 0;
		for (const item of this.equipment) {
			totalPower += item.power;
		}

		this.health = 100 + this.stats.vitality * 5 + totalPower;
		this.mana = 20 + this.stats.intelligence * 3;
	}
}

class MageCharacter implements GameCharacter {
	constructor(
		public name: string,
		public level: number = 1,
		public health: number = 60,
		public mana: number = 100,
		public equipment: Equipment[] = [],
		public skills: Skill[] = [],
		public stats: CharacterStats = {
			strength: 0,
			agility: 0,
			intelligence: 0,
			vitality: 0,
		},
	) {
		// Processo custoso repetido
		this.setupMageDefaults();
	}

	private setupMageDefaults(): void {
		console.log(" Configurando mago (processo custoso)...");

		this.stats = {
			strength: 5,
			agility: 7,
			intelligence: 18,
			vitality: 8,
		};

		this.equipment = [
			{ name: "Varinha Mágica", type: "weapon", power: 30, rarity: "uncommon" },
			{ name: "Robes Místicos", type: "armor", power: 8, rarity: "common" },
			{ name: "Amuleto de Mana", type: "accessory", power: 12, rarity: "rare" },
		];

		this.skills = [
			{ name: "Bola de Fogo", level: 1, cooldown: 2, manaCost: 8 },
			{ name: "Cura", level: 1, cooldown: 4, manaCost: 12 },
			{ name: "Teleporte", level: 1, cooldown: 15, manaCost: 25 },
		];

		this.recalculateStats();
	}

	private recalculateStats(): void {
		let totalPower = 0;
		for (const item of this.equipment) {
			totalPower += item.power;
		}

		this.health = 60 + this.stats.vitality * 3 + totalPower;
		this.mana = 100 + this.stats.intelligence * 5;
	}
}

// Problemático: criação custosa de muitos personagens similares
class CharacterFactory {
	createWarriorTeam(teamSize: number): WarriorCharacter[] {
		const team: WarriorCharacter[] = [];

		// Processo custoso repetido para cada personagem
		for (let i = 0; i < teamSize; i++) {
			team.push(new WarriorCharacter(`Guerreiro-${i + 1}`));
		}

		return team;
	}

	createMageGuild(guildSize: number): MageCharacter[] {
		const guild: MageCharacter[] = [];

		// Ineficiente para criação em massa
		for (let i = 0; i < guildSize; i++) {
			guild.push(new MageCharacter(`Mago-${i + 1}`));
		}

		return guild;
	}

	// Personalização limitada
	createCustomWarrior(
		name: string,
		customEquipment?: Equipment[],
	): WarriorCharacter {
		const warrior = new WarriorCharacter(name);

		if (customEquipment) {
			// Precisa reconfigurar tudo novamente
			warrior.equipment = [...customEquipment];
			// Recálculo custoso
			(warrior as any).recalculateStats();
		}

		return warrior;
	}
}

// Demonstração dos problemas
export function demonstrateProblems() {
	console.log("=== ANTES (Problemático) ===");

	const factory = new CharacterFactory();

	console.time("Criação de time de guerreiros");
	const warriorTeam = factory.createWarriorTeam(5);
	console.timeEnd("Criação de time de guerreiros");

	console.time("Criação de guilda de magos");
	const mageGuild = factory.createMageGuild(3);
	console.timeEnd("Criação de guilda de magos");

	console.log(` Time criado: ${warriorTeam.length} guerreiros`);
	console.log(` Guilda criada: ${mageGuild.length} magos`);

	// Customização custosa
	console.time("Criação de guerreiro customizado");
	const customWarrior = factory.createCustomWarrior("Herói", [
		{ name: "Espada Lendária", type: "weapon", power: 50, rarity: "legendary" },
	]);
	console.timeEnd("Criação de guerreiro customizado");

	console.log(
		"Problemas: processo custoso repetido, sem reuso, ineficiente para massa",
	);
}
