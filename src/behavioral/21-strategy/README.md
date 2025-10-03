# Strategy (Estratégia)

## O que é

O padrão Strategy define uma família de algoritmos, encapsula cada um deles e os torna intercambiáveis. Strategy permite que o algoritmo varie independentemente dos clientes que o utilizam.

## Problema

Quando precisamos escolher entre diferentes algoritmos:
- Classes com múltiplos condicionais para diferentes comportamentos
- Algoritmos fixos difíceis de estender
- Violação do princípio Open/Closed
- Código duplicado para variações de algoritmos
- Dificulta testes de algoritmos individuais

## Solução

Extrair algoritmos para classes separadas que implementam uma interface comum. O contexto mantém referência para uma estratégia e delega o trabalho para ela.

## Estrutura

- **Strategy**: Interface que define algoritmos
- **ConcreteStrategy**: Implementação específica de um algoritmo
- **Context**: Mantém referência à estratégia e a utiliza
- **Client**: Configura context com estratégia apropriada

## Exemplo no projeto

Sistema de processamento de pagamentos com múltiplos métodos:

**Componentes:**
- `PaymentStrategy`: Interface para estratégias de pagamento
- `CreditCardStrategy`, `PayPalStrategy`, `BankTransferStrategy`, `CryptocurrencyStrategy`: Estratégias concretas
- `PaymentProcessor`: Context que usa estratégias
- `PaymentProcessorFactory`: Factory para criar processadores específicos

**Funcionalidades:**
- Múltiplos métodos de pagamento
- Validação específica por método
- Registro dinâmico de novas estratégias
- Tratamento de erros específico
- Factory para diferentes configurações

## Quando usar

- Quando tem muitas formas de fazer a mesma coisa
- Para eliminar condicionais que selecionam comportamentos
- Quando quer que algoritmos sejam intercambiáveis
- Para isolar algoritmos complexos
- Quando algoritmos mudam frequentemente
- Para implementar diferentes políticas

## Vantagens

- Elimina condicionais complexas
- Facilita adicionar novos algoritmos
- Algoritmos podem ser testados isoladamente
- Cliente pode escolher implementação apropriada
- Suporta princípio Open/Closed

## Desvantagens

- Cliente deve conhecer estratégias disponíveis
- Aumenta número de objetos
- Pode ser overkill para algoritmos simples
- Comunicação adicional entre strategy e context

## Observações

Este exemplo mostra sistema de pagamentos, mas o padrão é muito usado em:
- **Sorting algorithms**: QuickSort, MergeSort, BubbleSort
- **Compression**: ZIP, RAR, 7Z algorithms
- **Authentication**: OAuth, SAML, JWT strategies
- **Pricing**: Different pricing models, discounts
- **File formats**: PDF, Excel, CSV exporters
- **Validation**: Different validation rules

**Variações do padrão:**
- **Pluggable Strategy**: Carregamento dinâmico de estratégias
- **Template + Strategy**: Combinado com Template Method
- **Strategy + Factory**: Factory para criar estratégias
- **Null Object Strategy**: Estratégia padrão/vazia

**Diferenças de outros padrões:**
- **State**: Strategy é escolhida pelo cliente, State muda automaticamente
- **Template Method**: Strategy usa composição, Template Method usa herança
- **Command**: Strategy encapsula algoritmos, Command encapsula requisições