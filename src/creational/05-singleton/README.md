# Singleton Pattern

##  Quando usar

Use o Singleton quando você precisa:

- **Garantir uma única instância** de uma classe na aplicação
- **Acesso global** a um recurso compartilhado
- **Controlar o acesso** a recursos limitados (banco de dados, cache)
- **Estado global consistente** (configurações, loggers)
- **Evitar desperdício de recursos** custosos de criar

##  Problema que resolve

No sistema de aplicação, recursos como configuração, cache e pool de conexões deveriam ser únicos. Sem o padrão:

**Problemas:**
- Múltiplas instâncias de recursos custosos (desperdício de memória)
- Configurações inconsistentes entre diferentes partes da aplicação
- Caches separados que não compartilham dados
- Pools de conexão duplicados causando esgotamento de recursos
- Processo de inicialização custoso repetido desnecessariamente

##  Solução com Singleton

 **Benefícios:**
- **Instância única**: Garante que só existe uma instância da classe
- **Acesso global**: Ponto de acesso consistente em toda aplicação
- **Economia de recursos**: Evita criação desnecessária de objetos custosos
- **Estado consistente**: Todas as partes da aplicação veem o mesmo estado
- **Controle de inicialização**: Processo custoso executado apenas uma vez

##  Estrutura

```
ConfigurationManager
├── private static instance
├── private constructor()
├── public static getInstance()
└── business methods

CacheManager (Singleton)
├── Shared cache across services
└── LRU eviction policy

DatabaseConnectionPool (Singleton)
├── Single connection pool
└── Resource management
```

##  Cenários de uso real

- **Configurações de aplicação**: Settings globais
- **Cache de aplicação**: Cache compartilhado entre módulos
- **Pool de conexões**: Conexões de banco de dados
- **Loggers**: Sistema de log centralizado
- **Drivers de hardware**: Acesso a impressoras, sensores
- **Service Registry**: Registro de serviços disponíveis

##  Exemplo prático

```typescript
//  Acesso à instância única
const config = ConfigurationManager.getInstance();
const cache = CacheManager.getInstance();
const dbPool = DatabaseConnectionPool.getInstance();

//  Estado compartilhado
cache.set("user:123", userData);
// Outro serviço pode acessar o mesmo cache
const cachedUser = cache.get("user:123");

//  Configuração global
config.updateConfig({ debugMode: true });
// Todos os serviços veem a mudança
```

##  Cuidados e considerações

### Potenciais problemas:
- **Testabilidade**: Pode dificultar testes unitários
- **Acoplamento**: Pode criar dependências implícitas
- **Threading**: Requer cuidado em ambientes multi-thread
- **Debugging**: Estado global pode ser difícil de debugar

### Soluções implementadas:
```typescript
//  Reset para testes
public static reset(): void {
  ConfigurationManager.instance = null as any;
}

//  Dependency injection alternativa
class UserService {
  constructor(
    private cache = CacheManager.getInstance(),
    private config = ConfigurationManager.getInstance()
  ) {}
}
```

##  Relação com outros padrões

- **Factory Method**: Factories são frequentemente Singletons
- **Observer**: Singletons podem notificar mudanças de estado
- **Registry**: Pode ser implementado como Singleton
- **Dependency Injection**: Alternativa ao Singleton para gerenciar dependências