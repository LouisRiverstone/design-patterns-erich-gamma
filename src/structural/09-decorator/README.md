# Decorator Pattern (Padrão Decorador)

##  Descrição
O Decorator é um padrão de design estrutural que permite anexar novos comportamentos a objetos dinamicamente, colocando-os dentro de wrappers especiais que contêm esses comportamentos. É uma alternativa flexível à herança para estender funcionalidades.

##  Objetivo
- **Anexar responsabilidades adicionais** a um objeto dinamicamente
- **Fornecer uma alternativa flexível** à subclasse para estender funcionalidades
- **Permitir combinações** de comportamentos sem explosão de classes
- **Manter a interface original** enquanto adiciona funcionalidades

##  Quando Usar

### Use o Decorator quando:
- **Múltiplas combinações**: Precisa de muitas combinações de funcionalidades
- **Extensão dinâmica**: Quer adicionar/remover funcionalidades em runtime
- **Evitar herança**: Herança levaria à explosão de classes
- **Funcionalidades opcionais**: Nem todos os objetos precisam de todas as funcionalidades
- **Composição sobre herança**: Prefere composição à herança múltipla

### Exemplos práticos:
- **Sistema de notificações** (email + SMS + Slack + Discord)
- **Interface gráfica** (scroll + border + shadow + animation)
- **Processamento de dados** (compress + encrypt + validate)
- **HTTP middleware** (auth + logging + cors + cache)
- **Streaming de dados** (buffer + compress + encrypt)

##  Estrutura

```
Component (Interface)
├── ConcreteComponent (Implementação base)
└── Decorator (Wrapper base)
    ├── ConcreteDecoratorA
    ├── ConcreteDecoratorB
    └── ConcreteDecoratorC
```

##  Componentes

1. **Component**: Interface comum para objetos que podem ter responsabilidades adicionadas
2. **ConcreteComponent**: Classe que define um objeto ao qual responsabilidades adicionais podem ser anexadas
3. **Decorator**: Mantém uma referência a um objeto Component e define uma interface que está em conformidade com a interface do Component
4. **ConcreteDecorator**: Adiciona responsabilidades ao componente

##  Como Funciona

1. **Cliente** cria o componente base
2. **Aplica decorators** conforme necessário
3. **Cada decorator** adiciona sua funcionalidade
4. **Resultado** é um objeto com funcionalidades combinadas

##  Vantagens

- **Flexibilidade**: Combinações dinâmicas em runtime
- **Responsabilidade única**: Cada decorator tem uma responsabilidade
- **Extensibilidade**: Fácil adicionar novos decorators
- **Sem explosão de classes**: Evita 2^n combinações
- **Aberto/Fechado**: Aberto para extensão, fechado para modificação

## Desvantagens

- **Complexidade**: Muitos objetos pequenos
- **Debugging**: Stack traces mais complexos
- **Ordem importa**: Resultado depende da ordem dos decorators
- **Identidade**: Objeto decorado não é igual ao original
- **Configuração**: Pode ser complexo configurar corretamente

## 🆚 Comparação com Outros Padrões

| Padrão | Decorator | Strategy | Adapter | Composite |
|--------|-----------|----------|---------|-----------|
| **Objetivo** | Adicionar funcionalidades | Trocar algoritmos | Compatibilizar interfaces | Estrutura árvore |
| **Estrutura** | Wrapper em camadas | Objeto interno | Wrapper único | Estrutura hierárquica |
| **Flexibilidade** | Alta (runtime) | Alta (runtime) | Baixa (compilação) | Média |
| **Uso** | Funcionalidades opcionais | Algoritmos alternativos | Integração | Hierarquias uniformes |

##  Implementação TypeScript

### Exemplo: Sistema de Notificações

```typescript
// Interface do componente
interface NotificationComponent {
  send(): string;
  getCost(): number;
  getChannels(): string[];
}

// Componente base
class EmailNotification implements NotificationComponent {
  constructor(private message: string) {}
  
  send(): string {
    return ` Email: ${this.message}`;
  }
  
  getCost(): number {
    return 0.01;
  }
  
  getChannels(): string[] {
    return ['email'];
  }
}

// Decorator base
abstract class NotificationDecorator implements NotificationComponent {
  constructor(protected component: NotificationComponent) {}
  
  send(): string {
    return this.component.send();
  }
  
  getCost(): number {
    return this.component.getCost();
  }
  
  getChannels(): string[] {
    return this.component.getChannels();
  }
}

// Decorator concreto
class SMSDecorator extends NotificationDecorator {
  send(): string {
    return `${this.component.send()}\\n SMS: ${this.extractMessage()}`;
  }
  
  getCost(): number {
    return this.component.getCost() + 0.10;
  }
  
  getChannels(): string[] {
    return [...this.component.getChannels(), 'sms'];
  }
}
```

### Uso:

```typescript
// Composição dinâmica
let notification = new EmailNotification("Mensagem importante!");
notification = new SMSDecorator(notification);
notification = new SlackDecorator(notification);
notification = new PriorityDecorator(notification, 'urgente');

// Resultado: Email + SMS + Slack + Prioridade urgente
console.log(notification.send());
console.log(`Custo: $${notification.getCost()}`);
```

##  Casos de Teste

```typescript
describe('Decorator Pattern', () => {
  it('should allow dynamic composition', () => {
    let notification = new EmailNotification("Test");
    notification = new SMSDecorator(notification);
    
    expect(notification.getChannels()).toContain('email');
    expect(notification.getChannels()).toContain('sms');
    expect(notification.getCost()).toBeGreaterThan(0.01);
  });
  
  it('should preserve original functionality', () => {
    const base = new EmailNotification("Test");
    const decorated = new SMSDecorator(base);
    
    expect(decorated.send()).toContain('Email: Test');
    expect(decorated.send()).toContain('SMS');
  });
});
```

##  Dicas de Uso

1. **Mantenha a interface simples** - Evite interfaces muito complexas
2. **Ordem importa** - Teste diferentes ordens de decorators
3. **Use factory** - Para facilitar a criação de combinações comuns
4. **Documente bem** - Deixe claro quais decorators podem ser combinados
5. **Performance** - Muitos decorators podem impactar performance

##  Referências
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Effective Java (Joshua Bloch) - Item 18: Favor composition over inheritance
- Clean Code (Robert Martin) - Princípios SOLID