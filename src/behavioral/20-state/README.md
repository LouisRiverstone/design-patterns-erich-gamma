# State (Estado)

## O que é

O padrão State permite que um objeto altere seu comportamento quando seu estado interno muda. O objeto parecerá ter mudado de classe.

## Problema

Quando objetos precisam mudar comportamento baseado em estado:
- Métodos com muitos condicionais (if/switch) baseados em estado
- Lógica de estado espalhada pela classe
- Dificulta adicionar novos estados
- Transições de estado complexas e propensas a erro
- Código difícil de manter e testar

## Solução

Extrair comportamentos dependentes de estado para classes separadas que implementam uma interface comum. O contexto delega operações para o objeto estado atual.

## Estrutura

- **Context**: Mantém referência ao estado atual e delega operações
- **State**: Interface que define operações dependentes de estado
- **ConcreteState**: Implementa comportamento específico para cada estado
- **StateMachine**: (Opcional) Valida transições entre estados

## Exemplo no projeto

Sistema de workflow de documentos com estados bem definidos:

**Componentes:**
- `DocumentContext`: Context que gerencia estado atual
- `DocumentState`: Interface para todos os estados
- `EditingState`, `ReviewingState`, `PublishedState`, `ArchivedState`: Estados concretos
- `StateMachineValidator`: Validador de transições
- `ValidatedDocumentContext`: Context com validação de transições

**Funcionalidades:**
- Estados com ações específicas bem definidas
- Transições de estado controladas
- Histórico de ações e mudanças
- Validação de transições inválidas
- Versionamento de documentos

## Quando usar

- Quando objeto tem muitos estados com comportamentos diferentes
- Para eliminar condicionais complexas baseadas em estado
- Quando transições de estado são bem definidas
- Para implementar máquinas de estado (FSM)
- Em workflows, games (AI), protocolos de rede
- Para implementar padrões de UI (enabled/disabled/loading)

## Vantagens

- Elimina condicionais complexas
- Facilita adicionar novos estados
- Torna transições explícitas
- Cada estado é uma classe coesa
- Facilita testar comportamentos de estado

## Desvantagens

- Pode ser overkill para poucos estados simples
- Aumenta número de classes
- Pode criar dependências entre estados
- Estados podem precisar conhecer uns aos outros

## Observações

Este exemplo mostra workflow de documentos, mas o padrão é essencial em:
- **Game Development**: AI states, game states
- **Network Protocols**: Connection states (connecting, connected, disconnected)
- **UI Components**: Button states (normal, hover, pressed, disabled)
- **Order Processing**: Order states (pending, processing, shipped, delivered)
- **Media Players**: Player states (playing, paused, stopped, loading)

**Variações do padrão:**
- **Flyweight State**: Estados compartilhados (stateless)
- **Hierarchical State**: Estados com sub-estados
- **Pushdown Automaton**: Estados com pilha
- **Finite State Machine**: Com tabela de transições

**Diferenças de outros padrões:**
- **Strategy**: State muda automaticamente, Strategy é escolhida externamente
- **Command**: State encapsula comportamento, Command encapsula requisições
- **Bridge**: State muda em runtime, Bridge escolhido na criação