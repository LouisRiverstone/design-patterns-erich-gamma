# Factory Method Pattern

##  Quando usar

Use o Factory Method quando você precisa:

- **Delegar criação de objetos** para subclasses
- **Não saber antecipadamente** quais classes concretas criar
- **Facilitar extensão** sem modificar código existente
- **Encapsular lógica de criação** complexa
- **Promover baixo acoplamento** entre cliente e classes concretas

##  Problema que resolve

No sistema de notificações, diferentes canais têm diferentes requisitos de criação e validação. Sem o padrão:

**Problemas:**
- Cliente conhece todas as classes concretas (alto acoplamento)
- Switch/if extenso que viola princípio aberto/fechado
- Difícil adicionar novos tipos de notificação
- Validação e criação espalhadas pelo código
- Repetição de lógica em múltiplos lugares

##  Solução com Factory Method

 **Benefícios:**
- **Baixo acoplamento**: Cliente usa apenas interfaces
- **Extensibilidade**: Fácil adicionar novos tipos sem modificar código existente
- **Encapsulamento**: Lógica de criação centralizada em cada factory
- **Polimorfismo**: Tratamento uniforme de diferentes tipos
- **Validação específica**: Cada tipo valida seus próprios dados

##  Estrutura

```
NotificationCreator (Abstract)
├── createNotification() [abstract]
├── sendNotification()
└── sendBulkNotifications()

EmailCreator          SMSCreator           PushCreator
├── EmailNotification ├── SMSNotification  ├── PushNotification
└── sendWithAttachment └── sendShortCode    └── sendSilentNotification
```

##  Cenários de uso real

- **Parsers de arquivos**: Factory para diferentes formatos (JSON, XML, CSV)
- **Conexões de banco**: Factory para diferentes SGBDs
- **Clientes HTTP**: Factory para diferentes APIs (REST, GraphQL, SOAP)
- **Loggers**: Factory para diferentes destinos (file, console, remote)
- **Validadores**: Factory para diferentes tipos de dados

##  Exemplo prático

```typescript
//  Criação sem conhecer classe concreta
const service = new NotificationService();
service.sendNotification("email", "Título", "Mensagem", "user@test.com");

//  Fácil extensão
service.registerCreator("slack", new SlackNotificationCreator());
service.sendNotification("slack", "Alert", "Sistema online", "#general");

//  Funcionalidades específicas
const emailCreator = new EmailNotificationCreator();
emailCreator.sendWithAttachment("Contract", "See attached", "client@company.com", ["file.pdf"]);
```

##  Relação com outros padrões

- **Abstract Factory**: Factory Method é usado dentro de Abstract Factory
- **Template Method**: Factory Method é um caso especial de Template Method
- **Singleton**: Factories costumam ser implementadas como Singleton
- **Strategy**: Factory Method pode criar diferentes strategies