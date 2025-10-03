//  DEPOIS: Com o padrão Flyweight
// Separação entre estado intrínseco (compartilhado) e extrínseco (específico)

// Estado extrínseco (específico de cada instância)
export interface CharacterContext {
	x: number;
	y: number;
}

// Flyweight para caracteres (estado intrínseco compartilhado)
export interface CharacterFlyweight {
	render(context: CharacterContext): string;
	getIntrinsicData(): {
		char: string;
		font: string;
		size: number;
		color: string;
		style: string;
	};
}

// Implementação concreta do Flyweight
class ConcreteCharacterFlyweight implements CharacterFlyweight {
	constructor(
		private char: string,
		private font: string,
		private size: number,
		private color: string,
		private style: string = "normal",
	) {}

	render(context: CharacterContext): string {
		return `Char '${this.char}' at (${context.x}, ${context.y}) - ${this.font} ${this.size}px ${this.color} ${this.style}`;
	}

	getIntrinsicData() {
		return {
			char: this.char,
			font: this.font,
			size: this.size,
			color: this.color,
			style: this.style,
		};
	}

	// Simula o tamanho de memória APENAS do estado intrínseco
	getIntrinsicMemorySize(): number {
		return (
			this.char.length * 2 +
			this.font.length * 2 +
			this.color.length * 2 +
			this.style.length * 2 +
			8
		);
	}
}

// Factory para gerenciar e reutilizar Flyweights
export class CharacterFlyweightFactory {
	private static flyweights: Map<string, CharacterFlyweight> = new Map();

	static getFlyweight(
		char: string,
		font: string,
		size: number,
		color: string,
		style: string = "normal",
	): CharacterFlyweight {
		const key = `${char}-${font}-${size}-${color}-${style}`;

		if (!this.flyweights.has(key)) {
			console.log(` Criando novo flyweight para: ${key}`);
			this.flyweights.set(
				key,
				new ConcreteCharacterFlyweight(char, font, size, color, style),
			);
		} else {
			console.log(` Reutilizando flyweight para: ${key}`);
		}

		return this.flyweights.get(key)!;
	}

	static getFlyweightCount(): number {
		return this.flyweights.size;
	}

	static getTotalIntrinsicMemory(): number {
		let total = 0;
		this.flyweights.forEach((flyweight) => {
			if (flyweight instanceof ConcreteCharacterFlyweight) {
				total += (flyweight as any).getIntrinsicMemorySize();
			}
		});
		return total;
	}

	static clear(): void {
		this.flyweights.clear();
	}

	static listFlyweights(): string[] {
		return Array.from(this.flyweights.keys());
	}
}

// Contexto do caractere no editor
class CharacterInDocument {
	constructor(
		public flyweight: CharacterFlyweight,
		public context: CharacterContext,
	) {}

	render(): string {
		return this.flyweight.render(this.context);
	}

	move(x: number, y: number): void {
		this.context.x = x;
		this.context.y = y;
	}

	getExtrinsicMemorySize(): number {
		return 16; // 2 números (x, y) = 16 bytes
	}
}

// Editor de texto otimizado com Flyweight
export class TextEditorWithFlyweight {
	private characters: CharacterInDocument[] = [];

	addText(
		text: string,
		x: number,
		y: number,
		font: string = "Arial",
		size: number = 12,
		color: string = "black",
		style: string = "normal",
	): void {
		for (let i = 0; i < text.length; i++) {
			const flyweight = CharacterFlyweightFactory.getFlyweight(
				text[i],
				font,
				size,
				color,
				style,
			);

			const context: CharacterContext = {
				x: x + i * size * 0.6,
				y: y,
			};

			this.characters.push(new CharacterInDocument(flyweight, context));
		}
	}

	render(): string {
		let output = "Renderizando documento otimizado:\n";
		this.characters.forEach((char, index) => {
			output += `${index + 1}: ${char.render()}\n`;
		});
		return output;
	}

	getMemoryUsage(): {
		totalCharacters: number;
		uniqueFlyweights: number;
		intrinsicMemory: number;
		extrinsicMemory: number;
		totalMemory: number;
		memorySaved: string;
	} {
		const intrinsicMemory = CharacterFlyweightFactory.getTotalIntrinsicMemory();
		const extrinsicMemory = this.characters.reduce(
			(sum, char) => sum + char.getExtrinsicMemorySize(),
			0,
		);

		// Simula memória que seria usada sem Flyweight
		const memoryWithoutFlyweight = this.characters.length * 80; // Estimativa por caractere

		return {
			totalCharacters: this.characters.length,
			uniqueFlyweights: CharacterFlyweightFactory.getFlyweightCount(),
			intrinsicMemory,
			extrinsicMemory,
			totalMemory: intrinsicMemory + extrinsicMemory,
			memorySaved: `${(((memoryWithoutFlyweight - (intrinsicMemory + extrinsicMemory)) / memoryWithoutFlyweight) * 100).toFixed(1)}%`,
		};
	}

	clear(): void {
		this.characters = [];
	}

	findCharactersByType(char: string): CharacterInDocument[] {
		return this.characters.filter(
			(charDoc) => charDoc.flyweight.getIntrinsicData().char === char,
		);
	}

	getStatistics(): {
		characterFrequency: Record<string, number>;
		fontUsage: Record<string, number>;
		colorUsage: Record<string, number>;
	} {
		const charFreq: Record<string, number> = {};
		const fontUsage: Record<string, number> = {};
		const colorUsage: Record<string, number> = {};

		this.characters.forEach((charDoc) => {
			const data = charDoc.flyweight.getIntrinsicData();

			charFreq[data.char] = (charFreq[data.char] || 0) + 1;
			fontUsage[data.font] = (fontUsage[data.font] || 0) + 1;
			colorUsage[data.color] = (colorUsage[data.color] || 0) + 1;
		});

		return { characterFrequency: charFreq, fontUsage, colorUsage };
	}
}

// Sistema de partículas com Flyweight
export interface ParticleContext {
	x: number;
	y: number;
	velocityX: number;
	velocityY: number;
	life: number;
	maxLife: number;
}

export interface ParticleFlyweight {
	render(context: ParticleContext): string;
	update(context: ParticleContext): void;
	getType(): string;
	getIntrinsicData(): { type: string; color: string; sprite: string };
}

class ConcreteParticleFlyweight implements ParticleFlyweight {
	constructor(
		private type: string,
		private color: string,
		private sprite: string,
		private baseVelocity: number = 1.0,
	) {}

	render(context: ParticleContext): string {
		const alpha = context.life / context.maxLife;
		return `${this.type} at (${context.x.toFixed(1)}, ${context.y.toFixed(1)}) - ${this.color} (α: ${alpha.toFixed(2)})`;
	}

	update(context: ParticleContext): void {
		context.x += context.velocityX * this.baseVelocity;
		context.y += context.velocityY * this.baseVelocity;
		context.life--;
	}

	getType(): string {
		return this.type;
	}

	getIntrinsicData() {
		return {
			type: this.type,
			color: this.color,
			sprite: this.sprite,
		};
	}

	getIntrinsicMemorySize(): number {
		return (
			this.type.length * 2 + this.color.length * 2 + this.sprite.length * 2 + 8
		);
	}
}

export class ParticleFlyweightFactory {
	private static flyweights: Map<string, ParticleFlyweight> = new Map();

	static getFlyweight(
		type: string,
		color: string,
		sprite: string,
	): ParticleFlyweight {
		const key = `${type}-${color}-${sprite}`;

		if (!this.flyweights.has(key)) {
			console.log(` Criando novo flyweight de partícula: ${key}`);
			this.flyweights.set(
				key,
				new ConcreteParticleFlyweight(type, color, sprite),
			);
		}

		return this.flyweights.get(key)!;
	}

	static getFlyweightCount(): number {
		return this.flyweights.size;
	}

	static getTotalIntrinsicMemory(): number {
		let total = 0;
		this.flyweights.forEach((flyweight) => {
			if (flyweight instanceof ConcreteParticleFlyweight) {
				total += (flyweight as any).getIntrinsicMemorySize();
			}
		});
		return total;
	}

	static clear(): void {
		this.flyweights.clear();
	}

	static getTypeDistribution(): Record<string, number> {
		const distribution: Record<string, number> = {};
		this.flyweights.forEach((flyweight) => {
			const type = flyweight.getType();
			distribution[type] = (distribution[type] || 0) + 1;
		});
		return distribution;
	}
}

class ParticleInSystem {
	constructor(
		public flyweight: ParticleFlyweight,
		public context: ParticleContext,
	) {}

	update(): void {
		this.flyweight.update(this.context);
	}

	render(): string {
		return this.flyweight.render(this.context);
	}

	isAlive(): boolean {
		return this.context.life > 0;
	}

	getExtrinsicMemorySize(): number {
		return 48; // 6 números (x, y, vx, vy, life, maxLife) = 48 bytes
	}
}

export class ParticleSystemWithFlyweight {
	private particles: ParticleInSystem[] = [];

	createFireworks(x: number, y: number, count: number = 50): void {
		const colors = ["red", "blue", "green", "yellow", "purple", "orange"];

		for (let i = 0; i < count; i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			const flyweight = ParticleFlyweightFactory.getFlyweight(
				"firework",
				color,
				"firework.png",
			);

			const context: ParticleContext = {
				x,
				y,
				velocityX: (Math.random() - 0.5) * 10,
				velocityY: (Math.random() - 0.5) * 10,
				life: Math.random() * 100 + 50,
				maxLife: Math.random() * 100 + 50,
			};
			context.maxLife = context.life;

			this.particles.push(new ParticleInSystem(flyweight, context));
		}
	}

	createSmoke(x: number, y: number, count: number = 30): void {
		const flyweight = ParticleFlyweightFactory.getFlyweight(
			"smoke",
			"gray",
			"smoke.png",
		);

		for (let i = 0; i < count; i++) {
			const context: ParticleContext = {
				x: x + Math.random() * 20 - 10,
				y,
				velocityX: (Math.random() - 0.5) * 2,
				velocityY: -Math.random() * 3,
				life: Math.random() * 200 + 100,
				maxLife: Math.random() * 200 + 100,
			};
			context.maxLife = context.life;

			this.particles.push(new ParticleInSystem(flyweight, context));
		}
	}

	createExplosion(x: number, y: number, type: "big" | "small" = "big"): void {
		const count = type === "big" ? 100 : 50;
		const colors =
			type === "big"
				? ["red", "orange", "yellow", "white"]
				: ["blue", "cyan", "white"];

		for (let i = 0; i < count; i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			const flyweight = ParticleFlyweightFactory.getFlyweight(
				"explosion",
				color,
				"explosion.png",
			);

			const angle = (Math.PI * 2 * i) / count;
			const speed = Math.random() * 5 + 2;

			const context: ParticleContext = {
				x,
				y,
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed,
				life: Math.random() * 80 + 20,
				maxLife: Math.random() * 80 + 20,
			};
			context.maxLife = context.life;

			this.particles.push(new ParticleInSystem(flyweight, context));
		}
	}

	update(): void {
		this.particles.forEach((particle) => particle.update());
		this.particles = this.particles.filter((particle) => particle.isAlive());
	}

	render(): string {
		let output = `Renderizando ${this.particles.length} partículas otimizadas:\n`;
		this.particles.slice(0, 10).forEach((particle, index) => {
			output += `${index + 1}: ${particle.render()}\n`;
		});
		if (this.particles.length > 10) {
			output += `... e mais ${this.particles.length - 10} partículas\n`;
		}
		return output;
	}

	getMemoryUsage(): {
		totalParticles: number;
		uniqueFlyweights: number;
		intrinsicMemory: number;
		extrinsicMemory: number;
		totalMemory: number;
		memorySaved: string;
	} {
		const intrinsicMemory = ParticleFlyweightFactory.getTotalIntrinsicMemory();
		const extrinsicMemory = this.particles.reduce(
			(sum, particle) => sum + particle.getExtrinsicMemorySize(),
			0,
		);

		// Memória que seria usada sem Flyweight
		const memoryWithoutFlyweight = this.particles.length * 100; // Estimativa

		return {
			totalParticles: this.particles.length,
			uniqueFlyweights: ParticleFlyweightFactory.getFlyweightCount(),
			intrinsicMemory,
			extrinsicMemory,
			totalMemory: intrinsicMemory + extrinsicMemory,
			memorySaved: `${(((memoryWithoutFlyweight - (intrinsicMemory + extrinsicMemory)) / memoryWithoutFlyweight) * 100).toFixed(1)}%`,
		};
	}

	getParticlesByType(type: string): ParticleInSystem[] {
		return this.particles.filter(
			(particle) => particle.flyweight.getType() === type,
		);
	}

	getStatistics(): {
		typeDistribution: Record<string, number>;
		averageLife: number;
		totalActive: number;
	} {
		const typeCount: Record<string, number> = {};
		let totalLife = 0;

		this.particles.forEach((particle) => {
			const type = particle.flyweight.getType();
			typeCount[type] = (typeCount[type] || 0) + 1;
			totalLife += particle.context.life;
		});

		return {
			typeDistribution: typeCount,
			averageLife:
				this.particles.length > 0 ? totalLife / this.particles.length : 0,
			totalActive: this.particles.length,
		};
	}

	clear(): void {
		this.particles = [];
	}
}

// Demonstração da solução
export function demonstrateSolution() {
	console.log(
		" DEPOIS (Solução Flyweight): Estado compartilhado vs específico",
	);
	console.log("");

	// Resetar factories para demonstração limpa
	CharacterFlyweightFactory.clear();
	ParticleFlyweightFactory.clear();

	console.log("=== SOLUÇÃO 1: EDITOR DE TEXTO OTIMIZADO ===");
	const editor = new TextEditorWithFlyweight();

	// Mesmo texto que antes, mas agora otimizado
	console.log("Adicionando texto (observe a reutilização de flyweights):");
	editor.addText("Hello World! ", 10, 20, "Arial", 12, "black");
	editor.addText("Hello World! ", 10, 40, "Arial", 12, "black"); // Mesmos flyweights!
	editor.addText("Hello World! ", 10, 60, "Arial", 12, "red");
	editor.addText("BOLD TEXT", 10, 80, "Arial", 14, "black", "bold");

	console.log("\nTexto renderizado (primeiros 10 caracteres):");
	const rendered = editor.render();
	console.log(rendered.split("\n").slice(0, 12).join("\n"));

	const memoryUsage = editor.getMemoryUsage();
	console.log("\n Uso de memória otimizado:");
	console.log(`Total de caracteres: ${memoryUsage.totalCharacters}`);
	console.log(`Flyweights únicos: ${memoryUsage.uniqueFlyweights}`);
	console.log(`Memória intrínseca: ${memoryUsage.intrinsicMemory} bytes`);
	console.log(`Memória extrínseca: ${memoryUsage.extrinsicMemory} bytes`);
	console.log(`Memória total: ${memoryUsage.totalMemory} bytes`);
	console.log(`Economia de memória: ${memoryUsage.memorySaved}`);

	const stats = editor.getStatistics();
	console.log("\n Estatísticas:");
	console.log(
		"Frequência de caracteres:",
		Object.entries(stats.characterFrequency).slice(0, 5),
	);
	console.log("Uso de fontes:", stats.fontUsage);
	console.log("Uso de cores:", stats.colorUsage);

	console.log("\n=== SOLUÇÃO 2: SISTEMA DE PARTÍCULAS OTIMIZADO ===");
	const particleSystem = new ParticleSystemWithFlyweight();

	console.log("Criando efeitos (observe os flyweights criados):");
	particleSystem.createFireworks(100, 100, 20);
	particleSystem.createExplosion(200, 150, "big");
	particleSystem.createSmoke(150, 200, 15);

	console.log("\nPartículas iniciais:");
	console.log(particleSystem.render());

	const particleMemory = particleSystem.getMemoryUsage();
	console.log("\n Uso de memória das partículas:");
	console.log(`Total de partículas: ${particleMemory.totalParticles}`);
	console.log(`Flyweights únicos: ${particleMemory.uniqueFlyweights}`);
	console.log(`Memória intrínseca: ${particleMemory.intrinsicMemory} bytes`);
	console.log(`Memória extrínseca: ${particleMemory.extrinsicMemory} bytes`);
	console.log(`Memória total: ${particleMemory.totalMemory} bytes`);
	console.log(`Economia de memória: ${particleMemory.memorySaved}`);

	// Simular evolução do sistema
	console.log("\nSimulando 10 frames:");
	for (let i = 0; i < 10; i++) {
		particleSystem.update();
	}

	const finalStats = particleSystem.getStatistics();
	console.log(`\nPartículas restantes: ${finalStats.totalActive}`);
	console.log("Distribuição por tipo:", finalStats.typeDistribution);
	console.log(`Vida média: ${finalStats.averageLife.toFixed(1)}`);

	const finalMemory = particleSystem.getMemoryUsage();
	console.log(`Economia final: ${finalMemory.memorySaved}`);

	console.log("\n Vantagens do Flyweight:");
	console.log("- Redução drástica no uso de memória");
	console.log("- Separação clara entre estado intrínseco e extrínseco");
	console.log("- Reutilização eficiente de objetos similares");
	console.log("- Melhor performance com muitos objetos");
	console.log("- Factory centraliza criação e reutilização");
	console.log(
		"- Ideal para sistemas com milhares/milhões de objetos similares",
	);
}

// As classes já foram exportadas na declaração
