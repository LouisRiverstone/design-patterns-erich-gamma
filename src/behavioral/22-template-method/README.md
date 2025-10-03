# Template Method (Método Gabarito)

## O que é

O padrão Template Method define o esqueleto de um algoritmo em uma superclasse, permitindo que subclasses substituam passos específicos do algoritmo sem mudar sua estrutura.

## Problema

Quando algoritmos têm estrutura similar mas passos diferentes:
- Código duplicado em classes com fluxos similares
- Dificulta manutenção quando algoritmo principal muda
- Violação do princípio DRY (Don't Repeat Yourself)
- Lógica comum espalhada por várias classes
- Dificulta extensão de novos tipos de processamento

## Solução

Criar uma classe base com método template que define o algoritmo principal. Subclasses implementam passos específicos através de métodos abstratos ou sobrescrevem métodos hook.

## Estrutura

- **AbstractClass**: Define template method e operações abstratas
- **ConcreteClass**: Implementa operações específicas do algoritmo
- **Template Method**: Método que define estrutura do algoritmo
- **Hook Methods**: Métodos opcionais que subclasses podem sobrescrever

## Exemplo no projeto

Sistema de processamento de dados com múltiplos formatos:

**Componentes:**
- `DataProcessor<T>`: Classe base com template method
- `CSVDataProcessor`, `JSONDataProcessor`, `XMLDataProcessor`: Implementações específicas
- `BatchDataProcessor`: Processador avançado que combina estratégias
- Hook methods para pré/pós-processamento

**Funcionalidades:**
- Pipeline de processamento padronizado (load → validate → transform → save)
- Validação específica por formato
- Hooks opcionais para customização
- Tratamento de erros centralizado
- Métricas de processamento

## Quando usar

- Quando algoritmos têm estrutura similar com passos diferentes
- Para eliminar código duplicado em hierarquias de classes
- Quando quer controlar quais partes do algoritmo podem variar
- Para implementar frameworks com pontos de extensão
- Em pipelines de processamento de dados
- Para implementar "Hollywood Principle" (don't call us, we'll call you)

## Vantagens

- Elimina código duplicado
- Facilita manutenção do algoritmo principal
- Controla pontos de variação
- Facilita adição de novos tipos
- Promove reutilização de código

## Desvantagens

- Pode dificultar entendimento do fluxo completo
- Herança pode ser limitante vs composição
- Depende de convenções de nomenclatura
- Pode criar acoplamento entre base e subclasses

## Observações

Este exemplo mostra processamento de dados, mas o padrão é fundamental em:
- **Frameworks**: Spring Boot, Angular, React lifecycles
- **Testing frameworks**: Setup → Execute → Teardown
- **Build systems**: Compile → Link → Package
- **Game engines**: Initialize → Update → Render loops
- **HTTP handlers**: Parse → Validate → Process → Response
- **Machine Learning**: Load → Preprocess → Train → Evaluate

**Variações do padrão:**
- **Hook Template**: Com métodos opcionais vazios
- **Strategy + Template**: Combina ambos os padrões
- **Functional Template**: Usando higher-order functions
- **Async Template**: Para operações assíncronas

**Diferenças de outros padrões:**
- **Strategy**: Template Method usa herança, Strategy usa composição
- **Factory Method**: Template Method para algoritmos, Factory Method para criação
- **Observer**: Template Method para sequência, Observer para eventos