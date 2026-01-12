# Folder Structure Reference

This document provides a complete reference of the project's directory structure and the purpose of each folder.

## Root Directory

```
nest-skeleton/
├── .git/                  # Git version control
├── .husky/                # Git hooks (pre-commit, commit-msg)
├── .idea/                 # IDE configuration (JetBrains)
├── .scripts/              # Build and deployment scripts
├── dist/                  # Compiled JavaScript output
├── docs/                  # Documentation (you are here!)
├── node_modules/          # Dependencies (ignored in git)
├── src/                   # Source code
├── .commitlintrc.json     # Commit message linting rules
├── .env                   # Environment variables (not in git!)
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore rules
├── .lintstagedrc.json     # Pre-commit lint configuration
├── .prettierignore        # Prettier ignore rules
├── .prettierrc.json       # Prettier formatting rules
├── eslint.config.mjs      # ESLint configuration
├── LICENSE.md             # License information
├── mise.toml              # Mise tool version management
├── nest-cli.json          # NestJS CLI configuration
├── package.json           # Dependencies and scripts
├── pnpm-lock.yaml         # Locked dependency versions
├── README.md              # Project overview
├── tsconfig.build.json    # TypeScript build configuration
└── tsconfig.json          # TypeScript compiler options
```

---

## Source Directory (`src/`)

### Overview

```
src/
├── configs/          # Configuration files
├── controllers/      # Global controllers
├── databases/        # Database layer
├── external/         # External services integration
├── library/          # Shared code
├── modules/          # Feature modules
├── types/            # Global type definitions
├── main.ts           # Application entry point
└── main.module.ts    # Root module
```

---

### `src/configs/`

Runtime configuration organized by concern:

```
configs/
├── fastify/
│   ├── fastify.config.ts      # Fastify server configuration
│   └── index.ts
└── typeorm/
    ├── typeorm.config.ts       # TypeORM database configuration
    └── typeorm-migrations.datasource.ts  # Migration data source
```

**Purpose**: Centralize all configuration in one place.

---

### `src/controllers/`

Global or shared controllers:

```
controllers/
├── controller.module.ts
└── index.ts
```

**Purpose**: HTTP controllers that don't belong to a specific feature module.

---

### `src/databases/`

Database persistence layer:

```
databases/
├── base/
│   └── base.typeorm-entity.ts         # Base entity class
├── embed/
│   └── user-email.embed.ts            # Embeddable objects (JSONB)
├── entities/
│   └── users.typeorm-entity.ts        # TypeORM entities
└── migrations/
    └── 1234567890123-create-users.ts  # Database migrations
```

**Purpose**:

- **base/**: Common base classes for entities
- **embed/**: Reusable embeddable objects (stored as JSONB)
- **entities/**: TypeORM entity definitions (map to database tables)
- **migrations/**: Database schema changes

**Files here should**:

- Use TypeORM decorators
- Map to database tables
- NOT contain business logic
- Follow naming: `{table-name}.typeorm-entity.ts`

---

### `src/external/`

Integrations with external 3rd-party services:

```
external/
├── mailer/           # Email service integration
│   ├── index.ts
│   └── external-mailer.module.ts
```

**Purpose**: Encapsulate logic for interacting with outside systems (Stripe, SendGrid, etc.).

---

### `src/library/`

Shared code used across modules:

```
library/
├── core/
│   ├── auth/              # Authentication module
│   ├── domain/            # Domain base classes
│   │   ├── base/
│   │   │   ├── aggregate-root.base.ts
│   │   │   ├── entity.base.ts
│   │   │   └── vo.base.ts
│   │   ├── events/        # Domain events
│   │   ├── types/         # Domain types
│   │   └── utils/         # Domain utilities
│   ├── dto/               # Shared DTOs
│   ├── exceptions/        # Custom exceptions
│   ├── filters/           # Exception filters
│   ├── interceptors/      # HTTP interceptors
│   ├── pipes/             # Validation pipes
│   └── providers/         # Shared services
│       ├── app-ctx/       # Application context
│       └── crypt/         # Cryptography service
├── enum/
│   ├── requested-lang.enum.ts
│   └── sort-direction.enum.ts
├── external/          # Adapters for external libraries
│   ├── mailer/
│   └── typeorm/
├── types/
│   ├── multi-lang.types.ts
│   └── sorting-field.types.ts
└── utils/
    ├── get-env.utils.ts
    ├── is-empty.ts
    ├── time.ts
    └── uid.ts
```

**Purpose**:

- **core/**: Framework-level code (DDD base classes, interceptors, filters)
- **enum/**: Shared enumerations
- **types/**: Shared type definitions
- **utils/**: Pure utility functions

---

### `src/modules/`

Feature modules (example: `users`):

```
modules/
└── users/
    ├── domain/                    # Domain layer
    │   ├── user.entity.ts        # Domain entity
    │   ├── user-email.vo.ts      # Value object
    │   ├── user-entity.type.ts   # Type definitions
    │   └── index.ts
    ├── dto/                       # Data transfer objects
    │   ├── requests/
    │   │   ├── create-user.dto.ts
    │   │   └── user-login.dto.ts
    │   ├── responses/
    │   │   └── user-response.dto.ts
    │   └── index.ts
    ├── mapper/                    # Layer transformations
    │   ├── user.mapper.ts
    │   ├── user-email.mapper.ts
    │   └── index.ts
    ├── repository/                # Data access
    │   ├── user.repository.ts         # Abstract
    │   ├── user.typeorm-adapter.ts    # Implementation
    │   ├── user-repository.module.ts  # DI module
    │   └── index.ts
    ├── services/                  # Application services
    │   ├── command/               # Write operations
    │   │   ├── create-user.command.ts
    │   │   └── index.ts
    │   ├── query/                 # Read operations
    │   │   ├── user-login.query.ts
    │   │   └── index.ts
    │   └── usecase/               # Handlers
    │       ├── create-user.use-case.ts
    │       ├── user-login.use-case.ts
    │       └── index.ts
    ├── user.controller.ts         # HTTP routes (optional)
    ├── user.module.ts             # Module registration
    └── index.ts
```

**Purpose**: Each feature is self-contained with all its layers.

**Layers**:

1. **domain/**: Pure business logic
2. **dto/**: Request/response objects
3. **mapper/**: Transform between layers
4. **repository/**: Database access
5. **services/**: CQRS commands, queries, handlers

---

## Documentation (`docs/`)

```
docs/
├── architecture/
│   ├── overview.md       # Architecture principles
│   ├── layers.md         # Layer responsibilities
│   └── data-flow.md      # Request flow diagrams
├── guides/
│   ├── getting-started.md
│   ├── cqrs-pattern.md
│   ├── domain-driven-design.md
│   └── repository-pattern.md
├── tutorials/
│   ├── creating-a-module.md
│   ├── adding-endpoints.md
│   └── database-operations.md
├── reference/
│   ├── coding-conventions.md
│   ├── folder-structure.md  # (you are here!)
│   └── api-usage.md
├── examples/
│   └── todo-module/
│       └── step-by-step.md
└── README.md             # Documentation index
```

---

## Configuration Files

### `.env`

Environment-specific variables (NOT committed to git):

- Database credentials
- JWT secrets
- API keys
- Feature flags

### `.env.example`

Template showing required environment variables.

### `tsconfig.json`

TypeScript compiler options:

- **paths**: Import path aliases (`@module/*`, `@libs/*`, etc.)
- **strict**: Type checking strictness
- **target**: JavaScript version to compile to

### `package.json`

- **dependencies**: Runtime packages
- **devDependencies**: Development tools
- **scripts**: Commands like `start:dev`, `lint`, `db:migrate`

### `eslint.config.mjs`

- Linting rules for code quality
- TypeScript-specific rules
- Prettier integration

### `.prettierrc.json`

- Code formatting rules
- Line width, quotes, semicolons, etc.

---

## Best Practices

### DO:

- ✅ Keep related files together in feature modules
- ✅ Use `index.ts` for barrel exports
- ✅ Follow naming conventions (`.entity.ts`, `.dto.ts`, etc.)
- ✅ Put shared code in `library/`
- ✅ Put database entities in `databases/entities/`

### DON'T:

- ❌ Mix domain entities with TypeORM entities
- ❌ Put business logic in controllers
- ❌ Create circular dependencies between modules
- ❌ Commit `.env` files

---

## Quick Navigation

**Need to**:

- Add a new feature? → `src/modules/{new-feature}/`
- Add a database table? → `src/databases/entities/`
- Add shared utility? → `src/library/utils/`
- Add configuration? → `src/configs/`
- Add documentation? → `docs/`

---

## Next Steps

- [Creating a Module](../tutorials/creating-a-module.md) - Build a feature
- [Coding Conventions](coding-conventions.md) - Naming rules
- [Architecture Overview](../architecture/overview.md) - Understand the layers
