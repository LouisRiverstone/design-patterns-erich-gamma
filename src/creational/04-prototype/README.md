# Prototype Pattern

##  Quando usar

Use o Prototype quando você precisa:

- **Evitar criação custosa** de objetos similares
- **Clonar objetos complexos** em vez de criá-los do zero
- **Reduzir subclasses** de factories para diferentes configurações
- **Criar cópias independentes** de objetos configurados
- **Otimizar performance** em criação em massa

##  Problema que resolve

No sistema de personagens de jogo, criar personagens similares é custoso. Sem o padrão:

**Problemas:**
- Processo de inicialização custoso repetido para cada personagem
- Configuração de equipamentos e habilidades recriada constantemente  
- Ineficiência na criação em massa de personagens similares
- Dificuldade para criar variações de configurações base
- Desperdício de recursos computacionais

##  Solução com Prototype

 **Benefícios:**
- **Performance**: Clonagem é mais rápida que criação do zero
- **Flexibilidade**: Fácil criar variações de objetos configurados
- **Redução de código**: Menos subclasses para diferentes configurações
- **Independência**: Clones são objetos independentes
- **Configuração reutilizável**: Protótipos servem como templates

##  Estrutura

```
Prototype<T>
└── clone(): T

GameCharacter (Abstract)
├── clone()
├── setName()
├── setLevel()
└── addEquipment()

WarriorCharacter    MageCharacter
├── clone()         ├── clone()
└── specialized     └── specialized
    methods            methods

CharacterPrototypeRegistry
├── registerPrototype()
├── createCharacter()
└── createSpecializedCharacter()
```

##  Cenários de uso real

- **Configurações de aplicação**: Templates de configuração
- **Documentos**: Templates de formulários, contratos
- **Objetos gráficos**: Sprites, elementos UI pré-configurados
- **Estados de jogo**: Salvamento/carregamento de estados
- **Caches**: Objetos complexos com configuração custosa

##  Exemplo prático

```typescript
//  Registra protótipos uma vez
const registry = new CharacterPrototypeRegistry();
registry.registerPrototype("warrior", new WarriorCharacter());

//  Criação rápida através de clonagem
const team = [];
for (let i = 0; i < 100; i++) {
  team.push(registry.createCharacter("warrior", `Warrior-${i}`));
}

//  Customização pós-clonagem
const hero = registry.createCharacter("warrior", "Hero")
  .setLevel(20)
  .addEquipment({ name: "Legendary Sword", power: 100 });
```

##  Relação com outros padrões

- **Factory Method**: Prototype pode substituir Factory Method
- **Singleton**: Registry costuma ser implementado como Singleton
- **Command**: Comandos podem ser clonados para undo/redo
- **Memento**: Prototype útil para implementar snapshots