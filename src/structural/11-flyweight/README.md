# Flyweight Pattern (Padrão Peso-Mosca)

##  Descrição
O Flyweight é um padrão de design estrutural que permite que programas suportem uma grande quantidade de objetos mantendo baixo o consumo de memória. O padrão consegue isso compartilhando eficientemente partes comuns do estado entre múltiplos objetos, ao invés de manter todos os dados em cada objeto.

##  Objetivo
- **Minimizar uso de memória** - Reduzir drasticamente o consumo de RAM
- **Compartilhar estado comum** - Reutilizar dados que são iguais entre objetos
- **Suportar grandes quantidades** - Permitir milhares/milhões de objetos
- **Separar responsabilidades** - Distinguir estado intrínseco do extrínseco

##  Quando Usar

### Use o Flyweight quando:
- **Muitos objetos similares**: Sistema precisa criar milhares de objetos similares
- **Custo de armazenamento alto**: Memória limitada ou cara
- **Estado compartilhável**: Objetos contêm estado duplicado
- **Grupos de objetos substituíveis**: Objetos podem ser substituídos por poucos objetos compartilhados
- **Dependências externas mínimas**: Estado extrínseco pode ser computado/fornecido externamente

### Exemplos práticos:
- **Editores de texto** (caracteres com mesma fonte/cor/tamanho)
- **Jogos** (sprites de inimigos, balas, partículas)
- **Sistemas gráficos** (ícones, símbolos, texturas)
- **Árvores de renderização** (nós com propriedades similares)
- **Processamento de dados** (objetos com campos repetitivos)

##  Estrutura

```
Client
   ↓
Context (estado extrínseco)
   ↓
FlyweightFactory → Flyweight (estado intrínseco)
   ↓                    ↓
Pool de Flyweights  ConcreteFlyweight
```

##  Componentes

1. **Flyweight**: Interface que define métodos para receber e atuar no estado extrínseco
2. **ConcreteFlyweight**: Implementa interface e armazena estado intrínseco (compartilhado)
3. **FlyweightFactory**: Cria e gerencia objetos flyweight, garantindo compartilhamento
4. **Context**: Contém estado extrínseco e referência ao flyweight
5. **Client**: Mantém referências aos flyweights e computa/armazena estado extrínseco

##  Como Funciona

1. **Cliente** solicita flyweight através da factory
2. **Factory** verifica se flyweight já existe
3. Se existe, **retorna instância existente**
4. Se não existe, **cria nova instância** e armazena
5. **Cliente** passa estado extrínseco para operações

## 🧠 Estados

### Estado Intrínseco (Compartilhado)
- **Independente de contexto**
- **Imutável**
- **Compartilhado entre objetos**
- **Armazenado no flyweight**

**Exemplos**: fonte, cor, sprite, tipo de partícula

### Estado Extrínseco (Específico)
- **Dependente de contexto**
- **Único para cada uso**
- **Passado como parâmetro**
- **Armazenado externamente**

**Exemplos**: posição, velocidade, tamanho específico

##  Vantagens

- **Economia de memória**: Redução drástica no uso de RAM
- **Performance**: Menos alocações de memória
- **Escalabilidade**: Suporta milhões de objetos
- **Cache-friendly**: Melhor localidade de memória
- **Reutilização**: Máximo aproveitamento de recursos

## Desvantagens

- **Complexidade**: Separação de estados pode complicar código
- **CPU vs Memória**: Pode usar mais CPU para economizar memória
- **Imutabilidade**: Estado intrínseco deve ser imutável
- **Context management**: Cliente deve gerenciar estado extrínseco
- **Over-engineering**: Pode ser complexo demais para casos simples

## 🆚 Comparação com Outros Padrões

| Padrão | Flyweight | Singleton | Prototype | Object Pool |
|--------|-----------|-----------|-----------|-------------|
| **Objetivo** | Economizar memória | Uma instância | Clonar objetos | Reutilizar objetos |
| **Compartilhamento** | Estado intrínseco | Instância única | Não há | Instâncias completas |
| **Mutabilidade** | Imutável (intrínseco) | Mutável | Mutável | Mutável |
| **Contexto** | Estado externo | Global | Local | Pool gerenciado |

##  Implementação TypeScript

### Exemplo: Sistema de Caracteres

```typescript
// Estado extrínseco
interface CharacterContext {
  x: number;
  y: number;
}

// Flyweight
interface CharacterFlyweight {
  render(context: CharacterContext): string;
}

// Flyweight concreto (estado intrínseco)
class ConcreteCharacter implements CharacterFlyweight {
  constructor(
    private char: string,
    private font: string,
    private size: number,
    private color: string
  ) {}

  render(context: CharacterContext): string {
    return `${this.char} at (${context.x}, ${context.y}) - ${this.font} ${this.size}px ${this.color}`;
  }
}

// Factory
class CharacterFactory {
  private static flyweights = new Map<string, CharacterFlyweight>();

  static getFlyweight(char: string, font: string, size: number, color: string): CharacterFlyweight {
    const key = `${char}-${font}-${size}-${color}`;
    
    if (!this.flyweights.has(key)) {
      this.flyweights.set(key, new ConcreteCharacter(char, font, size, color));
    }
    
    return this.flyweights.get(key)!;
  }
}

// Contexto
class CharacterInDocument {
  constructor(
    public flyweight: CharacterFlyweight,
    public context: CharacterContext
  ) {}

  render(): string {
    return this.flyweight.render(this.context);
  }
}
```

### Uso:

```typescript
// Editor otimizado
class TextEditor {
  private characters: CharacterInDocument[] = [];

  addText(text: string, x: number, y: number, font: string, size: number, color: string): void {
    for (let i = 0; i < text.length; i++) {
      const flyweight = CharacterFactory.getFlyweight(text[i], font, size, color);
      const context = { x: x + i * 10, y };
      
      this.characters.push(new CharacterInDocument(flyweight, context));
    }
  }
}

// Uso eficiente
const editor = new TextEditor();
editor.addText("Hello", 0, 0, "Arial", 12, "black"); // Cria 5 flyweights únicos
editor.addText("Hello", 0, 20, "Arial", 12, "black"); // Reutiliza os mesmos flyweights!
```

##  Casos de Teste

```typescript
describe('Flyweight Pattern', () => {
  beforeEach(() => {
    CharacterFactory.clear();
  });

  it('should reuse flyweights for same intrinsic state', () => {
    const flyweight1 = CharacterFactory.getFlyweight('A', 'Arial', 12, 'black');
    const flyweight2 = CharacterFactory.getFlyweight('A', 'Arial', 12, 'black');
    
    expect(flyweight1).toBe(flyweight2); // Mesma instância!
  });

  it('should create different flyweights for different intrinsic state', () => {
    const flyweight1 = CharacterFactory.getFlyweight('A', 'Arial', 12, 'black');
    const flyweight2 = CharacterFactory.getFlyweight('A', 'Arial', 12, 'red');
    
    expect(flyweight1).not.toBe(flyweight2); // Instâncias diferentes
  });

  it('should render with external context', () => {
    const flyweight = CharacterFactory.getFlyweight('A', 'Arial', 12, 'black');
    const context = { x: 10, y: 20 };
    
    const result = flyweight.render(context);
    expect(result).toContain('(10, 20)');
  });
});
```

##  Variações do Padrão

### 1. **Flyweight com Factory Pool**
```typescript
class PooledFlyweightFactory {
  private pool: Map<string, CharacterFlyweight[]> = new Map();
  
  getFlyweight(type: string): CharacterFlyweight {
    if (!this.pool.has(type)) {
      this.pool.set(type, []);
    }
    
    const pool = this.pool.get(type)!;
    return pool.pop() || this.createNew(type);
  }
  
  returnFlyweight(flyweight: CharacterFlyweight, type: string): void {
    this.pool.get(type)?.push(flyweight);
  }
}
```

### 2. **Flyweight Hierárquico**
```typescript
abstract class GraphicFlyweight {
  abstract render(context: RenderContext): void;
}

class SpriteFlyweight extends GraphicFlyweight {
  constructor(private texture: string) { super(); }
  
  render(context: RenderContext): void {
    // Renderizar sprite na posição do contexto
  }
}
```

### 3. **Flyweight com Estado Misto**
```typescript
class HybridFlyweight {
  constructor(
    private immutableData: string,  // Intrínseco
    private mutableCache: any = {}  // Cache local
  ) {}
  
  operation(extrinsicData: any): any {
    const key = JSON.stringify(extrinsicData);
    if (!this.mutableCache[key]) {
      this.mutableCache[key] = this.compute(extrinsicData);
    }
    return this.mutableCache[key];
  }
}
```

##  Anti-padrões

**Flyweight com estado mutável**
```typescript
// Ruim: Estado intrínseco mutável
class BadFlyweight {
  private color: string; // Não deve mudar!
  
  setColor(color: string) { // Quebra compartilhamento
    this.color = color;
  }
}
```

 **Flyweight imutável**
```typescript
// Bom: Estado intrínseco imutável
class GoodFlyweight {
  constructor(private readonly color: string) {}
  
  render(position: Point): void {
    // Usa color (imutável) + position (extrínseco)
  }
}
```

##  Dicas de Implementação

1. **Identifique estado compartilhável** - Analise quais dados se repetem
2. **Mantenha flyweights imutáveis** - Estado intrínseco nunca deve mudar
3. **Use factory pattern** - Centralize criação e reutilização
4. **Considere weak references** - Para cleanup automático
5. **Meça memory footprint** - Verifique se realmente economiza memória
6. **Cache context computations** - Evite recálculos desnecessários

##  Métricas de Sucesso

- **Redução de memória**: 50-90% menos uso de RAM
- **Número de flyweights**: Muito menor que objetos totais
- **Cache hit ratio**: Alta reutilização de flyweights
- **Performance**: Melhoria em alocação/garbage collection

##  Referências
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Effective Java (Joshua Bloch) - Item 6: Avoid creating unnecessary objects
- Game Programming Patterns (Robert Nystrom) - Flyweight chapter