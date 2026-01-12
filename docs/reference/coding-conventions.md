# Coding Conventions

This document outlines the naming conventions, file structure rules, and coding standards used in this project.

## File Naming Conventions

### Suffix Meanings

| Suffix                | Purpose                          | Example                           | Layer          |
| --------------------- | -------------------------------- | --------------------------------- | -------------- |
| `.entity.ts`          | Domain entities (business logic) | `user.entity.ts`                  | Domain         |
| `.typeorm-entity.ts`  | Database entities (TypeORM)      | `users.typeorm-entity.ts`         | Infrastructure |
| `.vo.ts`              | Value objects                    | `user-email.vo.ts`                | Domain         |
| `.dto.ts`             | Data transfer objects            | `create-user.dto.ts`              | Module         |
| `.mapper.ts`          | Transformations between layers   | `user.mapper.ts`                  | Module         |
| `.command.ts`         | CQRS commands (write operations) | `create-user.command.ts`          | Module         |
| `.query.ts`           | CQRS queries (read operations)   | `user-login.query.ts`             | Module         |
| `.use-case.ts`        | Command/query handlers           | `create-user.use-case.ts`         | Module         |
| `.module.ts`          | NestJS modules                   | `user.module.ts`                  | Module         |
| `.controller.ts`      | HTTP controllers                 | `user.controller.ts`              | Module         |
| `.service.ts`         | General services                 | `crypt.service.ts`                | Library        |
| `.repository.ts`      | Repository abstractions          | `user.repository.ts`              | Module         |
| `.typeorm-adapter.ts` | Repository implementations       | `user.typeorm-adapter.ts`         | Infrastructure |
| `.config.ts`          | Configuration files              | `typeorm.config.ts`               | Config         |
| `.types.ts`           | Type definitions                 | `user-entity.types.ts`            | Any            |
| `.enum.ts`            | Enumerations                     | `user-status.enum.ts`             | Any            |
| `.domain-event.ts`    | Domain events                    | `user-registered.domain-event.ts` | Domain         |
| `.event-handler.ts`   | Event listeners                  | `user-register.event-handler.ts`  | External       |
| `.util.ts`            | Utility functions                | `string.util.ts`                  | Library        |

### Naming Rules

**Domain Entities**: Singular, PascalCase

```typescript
User (not Users)
Task (not Tasks)
Product (not Products)
```

**TypeORM Entities**: Plural, PascalCase, with `.typeorm-entity.ts` suffix

```typescript
UsersTypeormEntity (maps to `users` table)
TasksTypeormEntity (maps to `tasks` table)
```

**DTOs**: Descriptive, PascalCase, with Dto suffix

```typescript
CreateUserDto;
UpdateUserDto;
UserResponseDto;
UserLoginDto;
```

**Commands/Queries**: Descriptive verb + noun + Command/Query

```typescript
CreateUserCommand;
UpdateUserCommand;
DeleteUserCommand;
GetUserQuery;
ListUsersQuery;
SearchUsersQuery;
```

**Use Cases**: Same as command/query + UseCase suffix

```typescript
CreateUserUseCase (handles CreateUserCommand)
GetUserUseCase (handles GetUserQuery)
```

**Mappers**: Entity name + Mapper

```typescript
UserMapper;
TaskMapper;
```

**Repositories**: Entity name + Repository

```typescript
UserRepository(abstract);
UserTypeormAdapter(implementation);
```

---

## Directory Structure

### Module Structure

Every feature module follows this structure:

```
src/modules/{feature-name}/
├── domain/                    # Domain layer (pure business logic)
│   ├── {entity}.entity.ts
│   ├── {entity}.vo.ts
│   ├── {entity}-entity.types.ts
│   └── index.ts              # Barrel export
├── dto/                       # Data transfer objects
│   ├── requests/             # Incoming DTOs
│   │   ├── create-{entity}.dto.ts
│   │   ├── update-{entity}.dto.ts
│   │   └── index.ts
│   └── responses/            # Outgoing DTOs
│       ├── {entity}-response.dto.ts
│       └── index.ts
├── repository/                # Data access layer
│   ├── {entity}.repository.ts           # Abstract
│   ├── {entity}.typeorm-adapter.ts      # Implementation
│   ├── {entity}-repository.module.ts    # DI module
│   └── index.ts
├── services/                  # Application services
│   ├── command/              # Write operations
│   │   ├── create-{entity}.command.ts
│   │   ├── update-{entity}.command.ts
│   │   └── index.ts
│   ├── query/                # Read operations
│   │   ├── get-{entity}.query.ts
│   │   ├── list-{entity}s.query.ts
│   │   └── index.ts
│   └── usecase/              # Handlers
│       ├── create-{entity}.use-case.ts
│       ├── get-{entity}.use-case.ts
│       └── index.ts
├── mapper/                    # Transformations
│   ├── {entity}.mapper.ts
│   └── index.ts
├── {feature}.controller.ts    # HTTP routes (optional)
├── {feature}.module.ts        # Module registration
└── index.ts                  # Barrel export
```

### Root Structure

```
src/
├── configs/          # Configuration files
├── controllers/      # Global or shared controllers
├── databases/        # Database layer
│   ├── base/        # Base entity classes
│   ├── embed/       # Embeddable objects
│   ├── entities/    # TypeORM entities
│   └── migrations/  # Database migrations
├── library/          # Shared code
│   ├── core/        # Core functionality
│   ├── enum/        # Shared enums
│   ├── types/       # Shared types
│   └── utils/       # Utility functions
├── modules/          # Feature modules
├── types/           # Root-level types
├── main.ts          # Application entry point
└── main.module.ts   # Root module
```

---

## Import Path Aliases

Use path aliases for clean imports:

```typescript
// ✅ Good: Use path aliases
import { UserRepository } from '@module/users/repository';
import { typeormConfig } from '@conf/typeorm/typeorm.config';
import { isEmpty } from '@libs/utils';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';

// ❌ Bad: Relative imports
import { UserRepository } from '../../../modules/users/repository';
import { typeormConfig } from '../../../../configs/typeorm/typeorm.config';
```

**Available aliases**:

- `@conf/*` → `src/configs/*`
- `@libs/*` → `src/library/*`
- `@module/*` → `src/modules/*`
- `@db/*` → `src/databases/*`

---

## TypeScript Best Practices

### 1. Always Use Types

```typescript
// ✅ Good: Explicit types
function createUser(name: string, email: string): User {
  return new User(name, email);
}

// ❌ Bad: Implicit any
function createUser(name, email) {
  return new User(name, email);
}
```

### 2. Use Readonly for Immutability

```typescript
// ✅ Good: Readonly properties
export class User {
  readonly id: string;
  readonly createdAt: Date;
}

// For deep readonly
export type ReadonlyUser = Readonly<User>;
```

### 3. Prefer Interfaces for DTOs

```typescript
// ✅ Good: Interface for shape
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

// Or use classes when you need validation
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}
```

### 4. Use Zod for Runtime Validation

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

// Use in domain entities
protected getEntityFieldsSchema() {
  return userSchema;
}
```

### 5. Abstract Dependencies Behind Interfaces

```typescript
// ✅ Good: Abstract repository
export abstract class UserRepository extends Repository<UsersTypeormEntity> {
  abstract findOneByEmail(email: string): Promise<UsersTypeormEntity | null>;
}

// Implementation
@Injectable()
export class UserTypeormAdapter extends UserRepository {
  async findOneByEmail(email: string) {
    // TypeORM-specific implementation
  }
}
```

---

## NestJS Conventions

### 1. Use Dependency Injection

```typescript
// ✅ Good: Constructor injection
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mapper: UserMapper,
  ) {}
}

// ❌ Bad: Direct instantiation
export class CreateUserUseCase {
  private mapper = new UserMapper(); // Don't do this
}
```

### 2. Keep Controllers Thin

```typescript
// ✅ Good: Controller delegates to use case
@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }
}

// ❌ Bad: Business logic in controller
@Controller('users')
export class UserController {
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // Validation logic
    // Database queries
    // Business rules
    // Don't do this - delegate to use case!
  }
}
```

### 3. Use DTOs for Input/Output

```typescript
// ✅ Good: Separate DTOs
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  // Password is NOT included!
}

// ❌ Bad: Exposing domain entities
@Post()
async create(@Body() dto) {
  return await this.userRepo.save(dto); // Exposes database entity
}
```

### 4. Use Decorators Appropriately

```typescript
// HTTP routes
@Get(':id')
@UseGuards(JwtAuthGuard)
@HttpCode(200)
async getUser(@Param('id') id: string) { }

// Validation
@Post()
async create(@Body(ValidationPipe) dto: CreateUserDto) { }

// CQRS
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase { }
```

---

## Domain-Driven Design Conventions

### 1. Domain Entities Are Framework-Agnostic

```typescript
// ✅ Good: No framework dependencies
export class User extends Entity<UserFields> {
  // Pure TypeScript
  // No @Injectable, @Column, etc.
}

// ❌ Bad: Framework decorators in domain
@Entity() // This is a TypeORM decorator - don't use in domain!
export class User {
  @Column()
  name: string;
}
```

### 2. Value Objects for Domain Concepts

```typescript
// ✅ Good: Email as value object
export class Email extends ValueObject<{ email: string }> {
  protected getValueObjectFieldsSchema() {
    return z.object({ email: z.string().email() });
  }
}

// ❌ Bad: Primitive obsession
const email: string = 'john@example.com'; // Just a string
```

### 3. Use Factory Methods

```typescript
// ✅ Good: Static factory method
export class User extends Entity {
  static create(payload: UserCreationPayload): User {
    const user = new User(payload);
    user.logger.debug('User created');
    return user;
  }
}

// Usage
const user = User.create(payload);

// ❌ Bad: Direct instantiation
const user = new User(payload); // Constructor is protected
```

---

## Git Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process, tooling
- `style`: Code style changes (formatting)
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(users): add email verification

Implement email verification flow with JWT tokens.
Users must verify their email before login.

Closes #123

---

fix(auth): handle expired tokens correctly

---

docs(readme): update installation instructions

---

refactor(users): extract user mapper to separate file
```

### Scope

Use the module or feature name:

- `users`
- `auth`
- `tasks`
- `database`
- `config`

### Rules

- Subject in lowercase
- No period at the end
- Present tense ("add" not "added")
- Max 100 characters for header
- Body should explain **why**, not **what**

---

## Code Style

### 1. Use Prettier

The project uses Prettier for formatting:

```bash
# Format all files
pnpm format

# Format is enforced on commit via husky
```

### 2. ESLint Rules

```bash
# Lint and fix
pnpm lint

# Linting runs on commit via lint-staged
```

### 3. Naming Conventions

**Variables and functions**: camelCase

```typescript
const userName = 'John';
function getUserById(id: string) {}
```

**Classes and interfaces**: PascalCase

```typescript
class UserService {}
interface UserRepository {}
```

**Constants**: UPPER_SNAKE_CASE

```typescript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

**Private members**: Prefix with underscore

```typescript
class User {
  private _id: string;
  private _createdAt: Date;
}
```

### 4. Comments

```typescript
// ✅ Good: Explain why, not what
// Use hash instead of encryption for performance
const hash = await bcrypt.hash(password, 10);

// ❌ Bad: Stating the obvious
// Hash the password
const hash = await bcrypt.hash(password, 10);

// ✅ Good: JSDoc for public APIs
/**
 * Creates a new user in the system.
 *
 * @param payload - User creation data
 * @returns Created user entity
 * @throws {ConflictException} If email already exists
 */
static create(payload: UserCreationPayload): User {
  // ...
}
```

---

## Testing Conventions (Future)

When tests are added, follow these conventions:

### File Naming

```
user.service.spec.ts        # Unit test
user.controller.e2e.spec.ts # E2E test
```

### Test Structure

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: MockType<UserRepository>;

  beforeEach(() => {
    // Setup
  });

  describe('execute', () => {
    it('should create a user when email does not exist', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw when email already exists', () => {
      // Arrange
      // Act & Assert
    });
  });
});
```

---

## Summary Checklist

When creating new code, ensure:

- [ ] File named according to conventions (.entity.ts, .dto.ts, etc.)
- [ ] In the correct directory (domain/, dto/, repository/, etc.)
- [ ] Uses path aliases (@module/_, @libs/_, etc.)
- [ ] TypeScript types defined
- [ ] Domain entities are framework-agnostic
- [ ] Controllers delegate to use cases
- [ ] DTOs for input/output
- [ ] Proper dependency injection
- [ ] Conventional commit message
- [ ] Code formatted with Prettier
- [ ] No ESLint errors

---

## Quick Reference

| Task                  | Pattern                                                       |
| --------------------- | ------------------------------------------------------------- |
| Add entity            | Create `{entity}.entity.ts` in `domain/`                      |
| Add database table    | Create `{entity}s.typeorm-entity.ts` in `databases/entities/` |
| Add endpoint          | Create command/query + use case + controller method           |
| Add DTO               | Create in `dto/requests/` or `dto/responses/`                 |
| Add validation        | Use Zod schema in domain entity                               |
| Add repository method | Add to abstract repository, implement in adapter              |
| Add business logic    | Create use case in `services/usecase/`                        |

---

## Next Steps

- **See these in practice**: [Creating a Module Tutorial](../tutorials/creating-a-module.md)
- **Understand the architecture**: [Architecture Overview](../architecture/overview.md)
- **Learn CQRS**: [CQRS Pattern Guide](cqrs-pattern.md)
