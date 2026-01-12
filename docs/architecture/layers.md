# Layer Breakdown

This document provides a detailed explanation of each architectural layer in the project, their responsibilities, and when to modify them.

## Overview

The application is organized into four main layers:

```
┌─────────────────────────────────────────┐
│     Application Layer                   │  Bootstrap, global config
├─────────────────────────────────────────┤
│     Module Layer                        │  Features, controllers, use cases
├─────────────────────────────────────────┤
│     Domain Layer                        │  Business logic, entities, VOs
├─────────────────────────────────────────┤
│     Infrastructure Layer                │  Database, external services
└─────────────────────────────────────────┘
```

---

## 1. Application Layer

**Location**: `src/main.ts`, `src/main.module.ts`

### Responsibility

Bootstrap the application and configure global concerns:

- Create the NestJS application instance
- Register global middleware, interceptors, filters
- Configure the module composition
- Validate required environment variables
- Start the HTTP server

### Files

#### `main.ts`

```typescript
// Application entry point
import { config } from 'dotenv';
config({ quiet: true });

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { MainModule } from './main.module';

void (async () => {
  const adapter = new FastifyAdapter(fastifyConfig);
  const app = await NestFactory.create(MainModule, adapter);

  app.enableCors({ origin: true });

  await app.listen({ host: '0.0.0.0', port: 3000 });
})();
```

**What it does**:

- Loads environment variables
- Creates Fastify adapter for better performance
- Bootstraps the NestJS application
- Enables CORS
- Starts listening on a port

#### `main.module.ts`

```typescript
@Module({
  imports: [
    AppCtxModule.register(), // Global request context
    TypeOrmModule.forRoot(typeormConfig),
    CqrsModule.forRoot(),
    AuthModule,
    UserModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: BaseExceptionFilter },
  ],
})
export class MainModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    this.envValidation(); // Validates required env vars
  }
}
```

**What it does**:

- Imports feature modules
- Registers global interceptors and filters
- Configures TypeORM connection
- Validates environment configuration

### When to Modify

✏️ **Add a new feature module**

```typescript
@Module({
  imports: [
    // ... existing modules
    TaskModule, // Add your new module here
  ],
})
```

✏️ **Add global interceptor/filter**

```typescript
providers: [
  { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }, // New global concern
];
```

✏️ **Add required environment variable**

```typescript
private envValidation() {
  const ensureEnvs = [
    'DB_HOST',
    'MY_NEW_VAR', // Add here
  ];
}
```

### What NOT to Put Here

❌ Business logic  
❌ Feature-specific code  
❌ Database queries  
❌ HTTP routes

---

## 2. Module Layer

**Location**: `src/modules/{feature-name}/`

### Responsibility

Organize features into cohesive, self-contained modules:

- Define HTTP routes (controllers)
- Orchestrate use cases (CQRS handlers)
- Register module-specific providers
- Define DTOs for requests and responses

### Structure of a Module

```
src/modules/users/
├── domain/                    # Domain entities and value objects
│   ├── user.entity.ts
│   └── user-email.vo.ts
├── dto/                       # Data transfer objects
│   ├── requests/
│   │   └── create-user.dto.ts
│   └── responses/
│       └── user-response.dto.ts
├── repository/                # Data access layer
│   ├── user.repository.ts
│   ├── user.typeorm-adapter.ts
│   └── user-repository.module.ts
├── services/                  # Application services
│   ├── command/               # Write operations
│   │   ├── create-user.command.ts
│   │   ├── user-login.command.ts  # Login is a write op (side effects)
│   │   └── index.ts
│   ├── query/                 # Read operations
│   │   ├── get-user.query.ts
│   │   └── index.ts
│   └── usecase/               # Command/query handlers
│       ├── create-user.use-case.ts
│       ├── user-login.use-case.ts
│       └── index.ts
├── mapper/                    # Transform between layers
│   └── user.mapper.ts
└── user.module.ts             # Module registration
```

### Controllers

**Purpose**: Handle HTTP requests and responses

```typescript
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    return this.commandBus.execute(new UserLoginCommand(dto));
  }
}
```

**Responsibilities**:

- Route definitions (`@Get()`, `@Post()`, etc.)
- Request validation (via DTOs)
- Dispatch to appropriate use case
- Return responses

**Keep it thin**: Controllers should NOT contain business logic. They delegate to use cases.

### Use Cases (CQRS Handlers)

**Purpose**: Implement application-specific business logic

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly crypt: CryptService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    // 1. Validate business rules
    const existingUser = await this.userRepository.findOneByEmail(command.dto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // 2. Create domain entity
    const user = User.create({
      id: entityId(),
      fields: {
        name: command.dto.name,
        email: UserEmailValueObject.create(command.dto.email),
        password: await this.crypt.toHash(command.dto.password),
        deletedAt: null,
      },
    });

    // 3. Persist
    await this.userRepository.save(this.userMapper.fromDomainToRepositoryEntity(user));

    // 4. Return response
    return this.userMapper.fromDomainToResponse(user);
  }
}
```

**Responsibilities**:

- Coordinate domain entities
- Enforce business rules
- Call repositories for persistence
- Transform data between layers (via mappers)

### Module Registration

```typescript
@Module({
  imports: [
    UserRepositoryModule, // Provides UserRepository
    CryptModule.register(),
  ],
  providers: [CreateUserUseCase, UserLoginUseCase, UserMapper],
  exports: [
    CreateUserUseCase, // Export for other modules if needed
  ],
})
export class UserModule {}
```

### When to Modify

✏️ **Add a new endpoint**: Create controller method  
✏️ **Add business logic**: Create new use case  
✏️ **New data structure**: Add DTO  
✏️ **New domain concept**: Add entity or value object

### What NOT to Put Here

❌ Database connection logic (that's infrastructure)  
❌ Framework-specific code in domain entities  
❌ Global concerns (that's application layer)

---

## 3. Domain Layer

**Location**: Within each module's `domain/` folder

### Responsibility

Pure business logic that's framework-agnostic:

- Define entities (objects with unique identity)
- Define value objects (immutable values)
- Enforce domain invariants (business rules)
- Domain events (for decoupling)

### Entities

**File naming**: `*.entity.ts`

```typescript
export class User extends Entity<UserEntityFields, UserEntityCreationPayload> {
  declare protected _id: string;

  // Define validation schema
  protected getEntityFieldsSchema(): EntityFieldSchema<UserEntityFields> {
    return z
      .object({
        name: z.string(),
        email: z.instanceof(UserEmailValueObject),
        password: z.string(),
        deletedAt: z.date().nullable(),
      })
      .strict();
  }

  // Factory method for creation
  static create(payload: UserEntityCreationPayload) {
    const entity = new User(payload);
    entity.logger.debug('User created', entity.toObject());
    return entity;
  }
}
```

**Characteristics**:

- Has unique identity (`id`)
- Mutable (can change over time)
- Validated on creation (via Zod schema)
- Contains business logic methods

### Value Objects

**File naming**: `*.vo.ts`

```typescript
export class UserEmailValueObject extends ValueObject<UserEmailFields> {
  protected getValueObjectFieldsSchema() {
    return z
      .object({
        email: z.string().email(),
        safeEmail: z.string(), // Encrypted/hashed version
      })
      .strict();
  }

  static create(email: string) {
    // Business logic for creating email
    const safeEmail = hashEmail(email);
    return new UserEmailValueObject({ email, safeEmail });
  }
}
```

**Characteristics**:

- No unique identity
- Immutable (create new instance to "change")
- Equality based on values, not reference
- Self-validating

### Domain Rules

The domain layer must:

- ✅ Be framework-agnostic (no NestJS, TypeORM imports)
- ✅ Contain ALL business validation logic
- ✅ Be testable without a database or HTTP server
- ✅ Use only pure TypeScript/JavaScript

### When to Modify

✏️ **New business concept**: Create new entity or value object  
✏️ **New validation rule**: Update Zod schema  
✏️ **New business behavior**: Add method to entity

### What NOT to Put Here

❌ Database queries  
❌ HTTP requests  
❌ Framework decorators (`@Injectable`, `@Column`, etc.)  
❌ Infrastructure concerns

---

## 4. Infrastructure Layer

**Location**: `src/databases/`, repository implementations

### Responsibility

Handle persistence and external services:

- Database entities (TypeORM)
- Migrations
- Repository implementations
- External API clients
- File storage

### Database Entities

**File naming**: `*.typeorm-entity.ts`

```typescript
@Entity()
export class UsersTypeormEntity extends BaseTypeormEntity {
  readonly sortable: (keyof this)[] = ['name', 'createdAt'];

  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'jsonb', nullable: false })
  email: UserEmailEmbed;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index({ nullFiltered: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
```

**Characteristics**:

- TypeORM decorators for database mapping
- Represents database schema
- No business logic
- Optimized for persistence

### Repository Pattern

**Abstract Repository** (Module Layer):

```typescript
export abstract class UserRepository extends Repository<UsersTypeormEntity> {
  abstract findOneByEmail(email: string): Promise<UsersTypeormEntity | null>;
}
```

**Implementation** (Infrastructure Layer):

```typescript
@Injectable()
export class UserTypeormAdapter extends UserRepository {
  constructor(
    @InjectRepository(UsersTypeormEntity)
    private readonly repo: Repository<UsersTypeormEntity>,
  ) {
    super(UsersTypeormEntity, repo.manager, repo.queryRunner);
  }

  async findOneByEmail(email: string): Promise<UsersTypeormEntity | null> {
    return this.repo.findOne({ where: { email: { safeEmail: email } } });
  }
}
```

**Module Registration**:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([UsersTypeormEntity])],
  providers: [{ provide: UserRepository, useClass: UserTypeormAdapter }],
  exports: [UserRepository],
})
export class UserRepositoryModule {}
```

### Migrations

```bash
# Generate migration
pnpm db:migration:generate create-users-table

# Run migrations
pnpm db:migrate

# Revert last migration
pnpm db:migrate:revert
```

### When to Modify

✏️ **Schema change**: Update TypeORM entity, generate migration  
✏️ **New query method**: Add to repository  
✏️ **New external service**: Create adapter in infrastructure

### What NOT to Put Here

❌ Business validation logic  
❌ HTTP routes  
❌ Use case orchestration

---

## Layer Interaction Rules

### ✅ Allowed Dependencies

```
Application Layer
    ↓ (can import)
Module Layer
    ↓ (can import)
Domain Layer
    ↓ (can import)
Infrastructure Layer
```

### ❌ Forbidden Dependencies

```
Domain Layer ❌ cannot import Infrastructure
Domain Layer ❌ cannot import Module Layer
Domain Layer ❌ cannot import Application Layer
```

### Communication Between Layers

**Controller → Use Case**:

```typescript
// Controller delegates to use case via CQRS bus
@Post()
async createUser(@Body() dto: CreateUserDto) {
  return this.commandBus.execute(new CreateUserCommand(dto));
}
```

**Use Case → Domain**:

```typescript
// Use case creates domain entity
const user = User.create(payload);
```

**Use Case → Repository**:

```typescript
// Use case persists via repository abstraction
await this.userRepository.save(userEntity);
```

**Mapper transforms between layers**:

```typescript
// Domain → Database
this.userMapper.fromDomainToRepositoryEntity(user);

// Database → Domain
this.userMapper.fromRepositoryToDomain(typeormEntity);

// Domain → Response DTO
this.userMapper.fromDomainToResponse(user);
```

---

## Summary Table

| Layer              | Location                    | Responsibility                | Dependencies           | Testability        |
| ------------------ | --------------------------- | ----------------------------- | ---------------------- | ------------------ |
| **Application**    | `main.ts`, `main.module.ts` | Bootstrap, global config      | All layers             | Integration tests  |
| **Module**         | `src/modules/`              | Controllers, use cases, DTOs  | Domain, Infrastructure | Unit + Integration |
| **Domain**         | `domain/` in modules        | Entities, VOs, business rules | None (pure)            | Unit tests (easy)  |
| **Infrastructure** | `src/databases/`, adapters  | DB entities, repositories     | TypeORM, external libs | Integration tests  |

---

## Next Steps

- **See it in action**: [Data Flow Guide](data-flow.md)
- **Build a module**: [Creating a Module Tutorial](../tutorials/creating-a-module.md)
- **Learn patterns**: [CQRS Guide](../guides/cqrs-pattern.md)
