# Proxy Pattern (Padrão Proxy/Procurador)

##  Descrição
O Proxy é um padrão de design estrutural que fornece um substituto ou marcador de posição para outro objeto. Um proxy controla o acesso ao objeto original, permitindo que você execute algo antes ou depois da requisição chegar ao objeto original.

##  Objetivo
- **Controlar acesso** - Adicionar controle sobre como e quando um objeto é acessado
- **Lazy loading** - Postergar criação/inicialização de objetos caros
- **Cache** - Armazenar resultados para melhorar performance
- **Logging/Monitoramento** - Registrar ou monitorar operações
- **Validação** - Verificar precondições antes de delegar operações

##  Quando Usar

### Use o Proxy quando:
- **Lazy initialization**: Objeto caro que deve ser criado apenas quando necessário
- **Controle de acesso**: Verificar permissões antes de permitir operações
- **Cache local**: Armazenar resultados de operações caras
- **Logging e auditoria**: Registrar todas as operações realizadas
- **Validação**: Verificar parâmetros antes de delegar para o objeto real
- **Smart reference**: Funcionalidades extras como contagem de referências

### Exemplos práticos:
- **Proxy de proteção** (controle de acesso, autenticação)
- **Proxy de cache** (banco de dados, chamadas de API)
- **Proxy virtual** (lazy loading de imagens, documentos)
- **Proxy remoto** (acesso a objetos em rede)
- **Proxy de logging** (auditoria, monitoramento)

##  Estrutura

```
Client → Proxy ← interface → RealSubject
         ↓
    ServiceInterface
```

##  Componentes

1. **ServiceInterface**: Interface comum implementada pelo RealSubject e Proxy
2. **RealSubject**: Classe que contém a lógica de negócio real
3. **Proxy**: Contém referência ao RealSubject e controla acesso a ele
4. **Client**: Trabalha com objetos através da ServiceInterface

##  Como Funciona

1. **Cliente** faz requisição ao proxy (não sabe que é proxy)
2. **Proxy** executa pré-processamento (validação, cache check, etc.)
3. Se necessário, **proxy** delega para o objeto real
4. **Proxy** executa pós-processamento (cache, logging, etc.)
5. **Resultado** é retornado ao cliente

##  Tipos de Proxy

### 1. **Virtual Proxy (Lazy Loading)**
- Posterga criação de objetos caros
- Cria objeto real apenas quando necessário

### 2. **Protection Proxy (Controle de Acesso)**
- Verifica permissões antes de permitir acesso
- Implementa controle de segurança

### 3. **Cache Proxy**
- Armazena resultados de operações caras
- Retorna cache quando disponível

### 4. **Logging Proxy**
- Registra todas as operações
- Implementa auditoria e monitoramento

### 5. **Smart Proxy**
- Adiciona funcionalidades extras
- Ex: contagem de referências, thread safety

##  Vantagens

- **Controle granular**: Controle total sobre acesso ao objeto
- **Transparência**: Cliente não percebe diferença
- **Performance**: Cache e lazy loading melhoram performance
- **Segurança**: Controle de acesso protege recursos
- **Monitoramento**: Logging e auditoria transparentes
- **Flexibilidade**: Múltiplos proxies podem ser combinados

## Desvantagens

- **Complexidade**: Adiciona camada extra de abstração
- **Latência**: Indireção pode impactar performance
- **Memória**: Proxy consome memória adicional
- **Manutenção**: Proxy deve ser mantido sincronizado com objeto real
- **Over-engineering**: Pode ser complexo demais para casos simples

## 🆚 Comparação com Outros Padrões

| Padrão | Proxy | Decorator | Adapter | Facade |
|--------|-------|-----------|---------|---------|
| **Objetivo** | Controlar acesso | Adicionar funcionalidades | Compatibilizar interfaces | Simplificar interface |
| **Interface** | Mesma do objeto real | Mesma do objeto decorado | Adapta incompatibilidades | Nova interface simplificada |
| **Transparência** | Total | Total | Parcial | Não |
| **Controle** | Alto | Médio | Baixo | Baixo |

##  Implementação TypeScript

### Exemplo: Database Proxy com Cache

```typescript
// Interface comum
interface DatabaseInterface {
  getUser(id: number): User;
  updateUser(id: number, data: any): boolean;
  deleteUser(id: number): boolean;
}

// Objeto real
class RealDatabase implements DatabaseInterface {
  getUser(id: number): User {
    console.log(`Executando query SQL para usuário ${id}`);
    // Operação cara no banco
    return { id, name: `User ${id}` };
  }

  updateUser(id: number, data: any): boolean {
    console.log(`Atualizando usuário ${id}`);
    return true;
  }

  deleteUser(id: number): boolean {
    console.log(`Deletando usuário ${id}`);
    return true;
  }
}

// Proxy com cache e controle de acesso
class DatabaseProxy implements DatabaseInterface {
  private realDb: RealDatabase | null = null;
  private cache: Map<number, User> = new Map();
  private sessionId: string | null = null;

  constructor(sessionId?: string) {
    this.sessionId = sessionId;
  }

  private getRealDatabase(): RealDatabase {
    if (!this.realDb) {
      console.log('Lazy loading - criando conexão real');
      this.realDb = new RealDatabase();
    }
    return this.realDb;
  }

  private checkAccess(operation: string): boolean {
    if (!this.sessionId) {
      throw new Error(`Acesso negado para ${operation}`);
    }
    return true;
  }

  getUser(id: number): User {
    // Verificar cache primeiro
    if (this.cache.has(id)) {
      console.log(`Cache hit para usuário ${id}`);
      return this.cache.get(id)!;
    }

    // Verificar acesso
    this.checkAccess('getUser');

    // Delegar para objeto real
    const user = this.getRealDatabase().getUser(id);
    
    // Armazenar no cache
    this.cache.set(id, user);
    
    return user;
  }

  updateUser(id: number, data: any): boolean {
    this.checkAccess('updateUser');
    
    const result = this.getRealDatabase().updateUser(id, data);
    
    // Invalidar cache
    this.cache.delete(id);
    
    return result;
  }

  deleteUser(id: number): boolean {
    this.checkAccess('deleteUser');
    
    // Operação crítica - log extra
    console.log(`AUDIT: Deletando usuário ${id} por sessão ${this.sessionId}`);
    
    const result = this.getRealDatabase().deleteUser(id);
    
    // Invalidar cache
    this.cache.delete(id);
    
    return result;
  }
}
```

### Uso:

```typescript
// Cliente usa proxy transparentemente
const dbProxy = new DatabaseProxy('session123');

// Primeira chamada - vai ao banco e armazena cache
const user1 = dbProxy.getUser(1);

// Segunda chamada - cache hit
const user2 = dbProxy.getUser(1);

// Operação controlada
try {
  dbProxy.deleteUser(1);
} catch (error) {
  console.log('Acesso negado');
}
```

##  Casos de Teste

```typescript
describe('Proxy Pattern', () => {
  let proxy: DatabaseProxy;

  beforeEach(() => {
    proxy = new DatabaseProxy('valid-session');
  });

  it('should provide lazy loading', () => {
    // Proxy criado, mas objeto real ainda não
    expect(proxy).toBeDefined();
    
    // Primeira operação cria objeto real
    const user = proxy.getUser(1);
    expect(user).toBeDefined();
  });

  it('should cache results', () => {
    const spy = vi.spyOn(console, 'log');
    
    proxy.getUser(1); // Primeira chamada
    proxy.getUser(1); // Segunda chamada - cache
    
    expect(spy).toHaveBeenCalledWith('Cache hit para usuário 1');
  });

  it('should control access', () => {
    const proxyWithoutSession = new DatabaseProxy();
    
    expect(() => proxyWithoutSession.getUser(1))
      .toThrow('Acesso negado');
  });

  it('should invalidate cache on updates', () => {
    proxy.getUser(1); // Adiciona ao cache
    proxy.updateUser(1, { name: 'Updated' }); // Invalida cache
    
    // Próxima chamada deve ir ao banco novamente
    const user = proxy.getUser(1);
    expect(user).toBeDefined();
  });
});
```

##  Variações do Padrão

### 1. **Proxy com Múltiplas Funcionalidades**
```typescript
class MultiProxy implements DatabaseInterface {
  constructor(
    private realDb: DatabaseInterface,
    private cache: CacheService,
    private logger: LoggerService,
    private auth: AuthService
  ) {}

  getUser(id: number): User {
    // 1. Verificar autenticação
    this.auth.checkPermission('read');
    
    // 2. Verificar cache
    const cached = this.cache.get(`user-${id}`);
    if (cached) return cached;
    
    // 3. Delegar para objeto real
    this.logger.log(`Fetching user ${id}`);
    const user = this.realDb.getUser(id);
    
    // 4. Armazenar no cache
    this.cache.set(`user-${id}`, user);
    
    return user;
  }
}
```

### 2. **Proxy Chain**
```typescript
const database = new RealDatabase();
const cachedDb = new CacheProxy(database);
const secureDb = new SecurityProxy(cachedDb);
const loggedDb = new LoggingProxy(secureDb);

// Cliente usa o proxy final
const user = loggedDb.getUser(1);
```

### 3. **Smart Proxy com Contadores**
```typescript
class CountingProxy implements DatabaseInterface {
  private accessCount = new Map<string, number>();

  getUser(id: number): User {
    const key = `getUser-${id}`;
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    
    return this.realDb.getUser(id);
  }

  getAccessStats(): Map<string, number> {
    return new Map(this.accessCount);
  }
}
```

##  Anti-padrões

**Proxy muito complexo**
```typescript
// Ruim: Proxy com muitas responsabilidades
class GodProxy {
  // Cache + Security + Logging + Validation + Retry + Circuit Breaker...
  // Muito complexo para manter
}
```

 **Proxy focado**
```typescript
// Bom: Um proxy, uma responsabilidade
class CacheProxy { /* apenas cache */ }
class SecurityProxy { /* apenas segurança */ }
class LoggingProxy { /* apenas logging */ }
```

##  Dicas de Implementação

1. **Mantenha interface idêntica** - Proxy deve ser transparente
2. **Uma responsabilidade por proxy** - Evite god objects
3. **Considere composição** - Combine múltiplos proxies simples
4. **Lazy loading real** - Crie objetos apenas quando necessário
5. **Gerencie lifecycle** - Cleanup de recursos quando necessário
6. **Thread safety** - Considere concorrência se necessário

##  Casos de Uso Reais

- **Hibernate/JPA**: Lazy loading de entidades
- **Spring AOP**: Intercepção de métodos
- **CDN**: Cache de conteúdo estático
- **API Gateway**: Controle de acesso e rate limiting
- **Virtual DOM**: Representação virtual de DOM real

##  Referências
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Patterns of Enterprise Application Architecture (Martin Fowler)
- Clean Architecture (Robert Martin) - Interface Adapters