# Builder Pattern

##  Quando usar

Use o Builder quando você precisa:

- **Construir objetos complexos** com muitos parâmetros opcionais
- **Diferentes representações** do mesmo objeto (ex: pizzas tradicionais vs veganas)
- **Validação durante construção** em vez de após criação
- **Interface fluente** para melhor legibilidade do código
- **Evitar "telescoping constructor"** (construtores com muitos parâmetros)

##  Problema que resolve

No exemplo da pizzaria, criar uma pizza envolve muitas opções e validações. Sem o padrão:

**Problemas:**
- Construtores com 10+ parâmetros são confusos
- Fácil passar parâmetros na ordem errada
- Difícil adicionar novas opções sem quebrar código existente
- Validação apenas no final, não durante construção
- Código repetitivo para configurações similares

##  Solução com Builder

 **Benefícios:**
- **Interface fluente**: Código mais legível e expressivo
- **Construção passo a passo**: Validação durante o processo
- **Flexibilidade**: Diferentes builders para diferentes tipos
- **Reutilização**: Directors para receitas predefinidas
- **Extensibilidade**: Fácil adicionar novos tipos de builder

##  Estrutura

```
PizzaBuilder (Abstract)
├── setSize()
├── setCrust()
├── addTopping()
└── build()

TraditionalPizzaBuilder    VeganPizzaBuilder
├── makePepperoni()        ├── Only vegan toppings
└── addVeggieToppings()    └── Validation rules

PizzaDirector
├── createMargherita()
├── createPepperoni()
└── createVeggiePizza()
```

##  Cenários de uso real

- **SQL Query Builder**: Construir queries complexas passo a passo
- **Configuração de APIs**: Headers, parâmetros, autenticação
- **Formulários HTML**: Campos, validações, layout
- **Relatórios**: Filtros, colunas, formatação
- **Games**: Criação de personagens, levels, configurações

##  Exemplo prático

```typescript
//  Construção fluente e clara
const pizza = new TraditionalPizzaBuilder()
  .setSize("large")
  .setCrust("thick")
  .setSauce("bbq")
  .addTopping("pepperoni")
  .addTopping("mushrooms")
  .addSpecialRequest("Extra queijo")
  .build();

//  Receitas predefinidas via Director
const margherita = PizzaDirector.createMargherita(builder);

//  Validação automática
const veganPizza = new VeganPizzaBuilder()
  .addTopping("pepperoni"); // Erro: não é vegano!
```

##  Relação com outros padrões

- **Abstract Factory**: Builder pode usar Factory para criar componentes
- **Composite**: Builder útil para construir estruturas Composite
- **Director**: Encapsula algoritmos de construção (Strategy pattern)