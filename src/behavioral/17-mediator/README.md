# Mediator (Mediador)

## O que é

O padrão Mediator define como um conjunto de objetos interage entre si. Promove baixo acoplamento evitando que objetos se refiram uns aos outros explicitamente, e permite variar suas interações independentemente.

## Problema

Quando objetos comunicam diretamente entre si:
- Alto acoplamento entre objetos
- Lógica de comunicação espalhada e duplicada
- Difícil reutilizar objetos em outros contextos
- Complexidade cresce exponencialmente com novos objetos
- Difícil manter e testar interações

## Solução

Introduzir um objeto mediador que encapsula como objetos interagem. Os objetos não se referenciam diretamente - toda comunicação passa pelo mediador, que coordena as interações.

## Estrutura

- **Mediator**: Interface que define protocolo de comunicação
- **ConcreteMediator**: Implementa comportamento cooperativo coordenando objetos
- **Colleague**: Interface para objetos que se comunicam
- **ConcreteColleague**: Implementa objetos que se comunicam via mediador

## Exemplo no projeto

Sistema de chat com diferentes níveis de funcionalidade:

**Componentes:**
- `ChatMediator`: Interface do mediador
- `ChatRoom`: Mediador básico para chat
- `ModeratedChatRoom`: Mediador avançado com moderação
- `ChatUser`: Usuário que se comunica via mediador

**Funcionalidades:**
- Mensagens públicas e privadas
- Histórico de mensagens
- Sistema de moderação (mute, ban)
- Controle de acesso

## Quando usar

- Quando conjunto de objetos se comunicam de forma complexa
- Para evitar acoplamento direto entre objetos
- Quando quer reutilizar objetos em diferentes contextos
- Para centralizar lógica de interação complexa
- Em sistemas de UI (dialogs, forms)
- Em sistemas de workflow ou orquestração

## Vantagens

- Reduz acoplamento entre objetos
- Centraliza controle de interações
- Facilita reutilização de objetos
- Simplifica protocolos de comunicação
- Facilita manutenção e extensão

## Desvantagens

- Mediador pode se tornar muito complexo
- Pode virar "god object" se não bem projetado
- Pode impactar performance (comunicação indireta)

## Observações

Este exemplo mostra chat room como mediador clássico, mas o padrão é muito usado em:
- **MVC/MVP**: Controller/Presenter como mediador
- **Event buses**: Mediador para eventos
- **Workflow engines**: Orquestração de processos
- **UI frameworks**: Coordenação entre componentes
- **Microservices**: Service mesh, API gateways

**Diferenças de outros padrões:**
- **Observer**: Mediator coordena comunicação bidirecional
- **Facade**: Mediator facilita comunicação, Facade simplifica interface
- **Command**: Mediator coordena, Command encapsula requisições