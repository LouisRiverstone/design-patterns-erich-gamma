# Facade Pattern (Padrão Fachada)

##  Descrição
O Facade é um padrão de design estrutural que fornece uma interface simplificada para um subsistema complexo. Ele define uma interface de nível mais alto que torna o subsistema mais fácil de usar, escondendo a complexidade das interações entre múltiplos objetos.

##  Objetivo
- **Simplificar interface complexa** - Fornecer uma interface unificada e simples
- **Reduzir acoplamento** - Desacoplar clientes dos subsistemas
- **Facilitar uso** - Tornar subsistemas complexos mais acessíveis
- **Centralizar controle** - Concentrar lógica de orquestração

##  Quando Usar

### Use o Facade quando:
- **Subsistema complexo**: Sistema com muitas classes interconectadas
- **Interface simplificada**: Clientes precisam apenas de funcionalidades básicas
- **Múltiplas dependências**: Operações requerem coordenação de vários objetos
- **Reduzir acoplamento**: Isolar clientes da complexidade interna
- **Ponto de entrada único**: Necessita de interface unificada

### Exemplos práticos:
- **Sistema de segurança** (autenticação + autorização + sessão + auditoria)
- **Framework web** (request + routing + middleware + response)
- **API Gateway** (múltiplos microservices)
- **Sistema de pagamento** (validação + processamento + notificação)
- **Compilador** (lexer + parser + optimizer + generator)

##  Estrutura

```
Client
   ↓
Facade ← Interface simplificada
   ↓
SubsystemA, SubsystemB, SubsystemC...
```

##  Componentes

1. **Facade**: Interface simplificada que delega para subsistemas
2. **Subsystems**: Classes que implementam funcionalidades específicas
3. **Client**: Usa a facade em vez de acessar subsistemas diretamente

##  Como Funciona

1. **Cliente** chama método da facade
2. **Facade** coordena chamadas aos subsistemas
3. **Subsistemas** executam suas responsabilidades
4. **Facade** agrega resultados e retorna ao cliente

##  Vantagens

- **Simplicidade**: Interface mais fácil de usar
- **Desacoplamento**: Cliente independente dos subsistemas
- **Flexibilidade**: Mudanças internas não afetam clientes
- **Reutilização**: Facade pode ser reutilizada por múltiplos clientes
- **Organização**: Centraliza lógica de coordenação

## Desvantagens

- **Camada extra**: Pode adicionar complexidade desnecessária
- **Limitações**: Pode não expor toda a funcionalidade dos subsistemas
- **Acoplamento**: Facade pode ficar fortemente acoplada aos subsistemas
- **God Object**: Risco de facade se tornar muito grande
- **Performance**: Indireção pode impactar performance

## 🆚 Comparação com Outros Padrões

| Padrão | Facade | Adapter | Proxy | Mediator |
|--------|--------|---------|-------|----------|
| **Objetivo** | Simplificar interface | Compatibilizar interfaces | Controlar acesso | Coordenar objetos |
| **Estrutura** | 1 para N subsistemas | 1 para 1 adaptação | 1 para 1 proxy | N para N mediação |
| **Foco** | Facilidade de uso | Compatibilidade | Controle | Comunicação |
| **Complexidade** | Reduz | Resolve incompatibilidade | Adiciona controle | Centraliza interação |

##  Implementação TypeScript

### Exemplo: Sistema de Segurança

```typescript
// Subsistemas complexos
class AuthenticationSystem {
  validateCredentials(username: string, password: string): boolean {
    // Lógica complexa de validação
    return true;
  }
}

class AuthorizationSystem {
  checkPermission(role: string, action: string): boolean {
    // Lógica complexa de autorização
    return true;
  }
}

class SessionManager {
  createSession(username: string, role: string): string {
    // Lógica complexa de sessão
    return 'session-id';
  }
}

//  FACADE
class SecurityFacade {
  private auth = new AuthenticationSystem();
  private authz = new AuthorizationSystem();
  private session = new SessionManager();

  // Interface simplificada
  login(username: string, password: string): LoginResult {
    // Orquestra múltiplos subsistemas
    if (!this.auth.validateCredentials(username, password)) {
      return { success: false, message: 'Credenciais inválidas' };
    }

    const role = this.getUserRole(username);
    const sessionId = this.session.createSession(username, role);

    return {
      success: true,
      sessionId,
      message: 'Login realizado com sucesso'
    };
  }

  checkAccess(sessionId: string, action: string): AccessResult {
    // Coordena validação de sessão e autorização
    if (!this.session.validateSession(sessionId)) {
      return { success: false, message: 'Sessão inválida' };
    }

    const userRole = this.getSessionRole(sessionId);
    if (!this.authz.checkPermission(userRole, action)) {
      return { success: false, message: 'Acesso negado' };
    }

    return { success: true, message: 'Acesso autorizado' };
  }
}
```

### Uso:

```typescript
// Uso simplificado através da facade
const security = new SecurityFacade();

// Login em uma única chamada
const loginResult = security.login('admin', 'password');
if (loginResult.success) {
  console.log('Logado com sucesso!');
  
  // Verificação de acesso simples
  const accessResult = security.checkAccess(loginResult.sessionId, 'delete');
  if (accessResult.success) {
    console.log('Acesso autorizado!');
  }
}
```

##  Casos de Teste

```typescript
describe('Facade Pattern', () => {
  let security: SecurityFacade;

  beforeEach(() => {
    security = new SecurityFacade();
  });

  it('should provide simplified login', () => {
    const result = security.login('admin', 'admin123');
    
    expect(result.success).toBe(true);
    expect(result.sessionId).toBeDefined();
    expect(result.message).toContain('sucesso');
  });

  it('should handle invalid credentials', () => {
    const result = security.login('admin', 'wrong');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('inválidas');
  });

  it('should check access permissions', () => {
    const login = security.login('admin', 'admin123');
    const access = security.checkAccess(login.sessionId!, 'read');
    
    expect(access.success).toBe(true);
  });
});
```

##  Variações do Padrão

### 1. **Facade Simples**
```typescript
class SimpleFacade {
  private subsystemA = new SubsystemA();
  private subsystemB = new SubsystemB();

  operation(): void {
    this.subsystemA.operation1();
    this.subsystemB.operation2();
  }
}
```

### 2. **Facade com Estado**
```typescript
class StatefulFacade {
  private state: any = {};
  
  operation(data: any): void {
    this.state = this.processData(data);
    // Usar estado em operações subsequentes
  }
}
```

### 3. **Facade Hierárquica**
```typescript
class AdminFacade {
  constructor(private securityFacade: SecurityFacade) {}
  
  performAdminAction(): void {
    // Usa outras facades
    const result = this.securityFacade.login(/* ... */);
    // Lógica específica de admin
  }
}
```

##  Anti-padrões

**Facade muito complexa**
```typescript
// Ruim: Facade fazendo muita coisa
class GodFacade {
  // 50+ métodos diferentes
  // Lógica de negócio complexa
  // Múltiplas responsabilidades
}
```

 **Facade focada**
```typescript
// Bom: Facade com responsabilidade específica
class AuthFacade {
  login() { /* ... */ }
  logout() { /* ... */ }
  checkAccess() { /* ... */ }
}
```

##  Dicas de Implementação

1. **Mantenha simples** - Facade deve ser mais simples que subsistemas
2. **Uma responsabilidade** - Cada facade deve ter propósito claro
3. **Não esconda tudo** - Permita acesso direto quando necessário
4. **Use composição** - Combine facades para operações complexas
5. **Documente bem** - Deixe claro o que cada método faz

##  Referências
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Clean Architecture (Robert Martin) - Interface Adapters layer
- Patterns of Enterprise Application Architecture (Martin Fowler)