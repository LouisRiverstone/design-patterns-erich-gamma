# Observer (Observador)

## O que é

O padrão Observer define uma dependência um-para-muitos entre objetos, de modo que quando um objeto muda de estado, todos os dependentes são notificados e atualizados automaticamente.

## Problema

Quando objetos precisam ser notificados sobre mudanças:
- Acoplamento forte entre objeto observado e observadores
- Difícil adicionar/remover observadores dinamicamente
- Lógica de notificação misturada com lógica de negócio
- Código duplicado para gerenciar listas de interessados
- Difícil manter consistência entre objetos relacionados

## Solução

Definir uma interface para observers e permitir que o subject mantenha uma lista deles. Quando o state muda, o subject notifica todos os observers automaticamente.

## Estrutura

- **Subject**: Interface para anexar/desanexar observers
- **ConcreteSubject**: Armazena estado e notifica observers
- **Observer**: Interface para receber notificações
- **ConcreteObserver**: Implementa resposta a notificações

## Exemplo no projeto

Sistema de publicação de notícias com múltiplos canais:

**Componentes:**
- `NewsPublisher`: Subject que publica notícias
- `EmailSubscriber`: Observer que filtra por categoria
- `SlackNotifier`: Observer que filtra por prioridade
- `AnalyticsTracker`: Observer que coleta estatísticas
- `SmartEmailDigest`: Observer avançado com batching

**Funcionalidades:**
- Notificação automática para múltiplos canais
- Filtragem por categoria e prioridade
- Tratamento de erros em observers
- Histórico de notícias
- Digest inteligente com batching

## Quando usar

- Quando mudança em um objeto requer atualizar vários outros
- Para implementar sistemas de eventos
- Quando quer baixo acoplamento entre subject e observers
- Para implementar Model-View em MVC
- Em sistemas de notificação
- Para implementar publish-subscribe

## Vantagens

- Baixo acoplamento entre subject e observers
- Permite adicionar observers em runtime
- Subject não precisa conhecer observers concretos
- Facilita broadcast de comunicação
- Suporta princípio Open/Closed

## Desvantagens

- Observers não sabem sobre outros observers
- Pode causar atualizações em cascata inesperadas
- Memory leaks se observers não são removidos
- Ordem de notificação pode ser importante mas não controlada

## Observações

Este exemplo mostra sistema de notícias, mas o padrão é fundamental em:
- **MVC/MVVM**: Views observam Models
- **Event systems**: DOM events, custom events
- **Data binding**: Frameworks reativas (React, Vue, Angular)
- **Database**: Triggers, change streams
- **Microservices**: Event-driven architecture

**Variações do padrão:**
- **Push model**: Subject envia dados específicos
- **Pull model**: Observers buscam dados do subject
- **Event-driven**: Com tipos específicos de eventos
- **Weak references**: Para evitar memory leaks

**Diferenças de outros padrões:**
- **Mediator**: Observer é 1-para-N, Mediator é N-para-N
- **Publish-Subscribe**: Observer tem referência direta, Pub-Sub usa broker
- **Chain of Responsibility**: Observer notifica todos, Chain para no primeiro