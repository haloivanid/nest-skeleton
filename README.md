# Nest Skeleton

A NestJS + Fastify starter that demonstrates a layered module/repository pattern with TypeORM and PostgreSQL.

## 🎓 New to this project?

**Welcome!** This is a professional NestJS starter showcasing Clean Architecture, DDD, and CQRS patterns.

### Quick Start Path

1. **[Getting Started](docs/guides/getting-started.md)** (15 min) - Set up and run the project
2. **[Architecture Overview](docs/architecture/overview.md)** (15 min) - Understand the big picture
3. **[CQRS Pattern Guide](docs/guides/cqrs-pattern.md)** (30 min) - How we organize code
4. **[Creating a Module Tutorial](docs/tutorials/creating-a-module.md)** (2 hours) - Build your first feature

### 📚 Full Documentation

**See [docs/README.md](docs/README.md)** for:

- Complete architecture guides
- Step-by-step tutorials
- Coding conventions
- API reference
- FAQ

---

## Quick Reference

### Project Structure

```
src/
├── configs/        # Runtime configuration (TypeORM, Fastify)
├── databases/      # Database entities, migrations, seeds
├── library/        # Shared utilities, core modules, interceptors, filters
├── modules/        # Feature modules (users, etc.)
├── main.ts         # Application entry point
└── main.module.ts  # Root module
```

**Learn more**: See [Folder Structure Reference](docs/reference/folder-structure.md) for detailed explanations.

### Architecture at a Glance

This project uses:

- **Clean Architecture** - Layered separation of concerns
- **Domain-Driven Design (DDD)** - Business logic in domain entities
- **CQRS Pattern** - Separate commands (write) and queries (read)
- **Repository Pattern** - Abstract data access

**Learn more**: Read the [Architecture Overview](docs/architecture/overview.md) to understand why and how.

---

## Development

### Prerequisites

- Node.js >= 22.0.0
- pnpm 10.26.1
- PostgreSQL >= 14

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
pnpm db:migrate
```

**Detailed setup**: See [Getting Started Guide](docs/guides/getting-started.md)

### Running the Application

```bash
# Development mode with hot reload
pnpm start:dev

# Production build
pnpm build
pnpm start
```

Server runs on `http://localhost:3000`

### Database Commands

```bash
# Generate migration
pnpm db:migration:generate <name>

# Run migrations
pnpm db:migrate

# Revert last migration
pnpm db:migrate:revert

# Create seed
pnpm db:seed:create <name>
```

**Learn more**: [Database Operations Tutorial](docs/tutorials/database-operations.md)

### Code Quality

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Commit with conventional commits
pnpm commit
```

**Standards**: See [Coding Conventions](docs/reference/coding-conventions.md)

---

## Environment Variables

Required variables (see `.env.example` for full list):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=nest_skeleton

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000
NODE_ENV=development
```

---

## Adding a New Feature

Quick steps (2-hour tutorial available):

1. Create module directory: `src/modules/{feature}/`
2. Define domain entity with validation
3. Create database entity and migration
4. Implement repository pattern
5. Create CQRS commands/queries
6. Add controller endpoints
7. Register in `MainModule`

**Step-by-step guide**: [Creating a Module Tutorial](docs/tutorials/creating-a-module.md)

---

## API Usage

```bash
# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Full API docs**: See [API Usage Guide](docs/reference/api-usage.md)

---

## Learn More

- **Architecture**: [docs/architecture/overview.md](docs/architecture/overview.md)
- **App Context**: [docs/architecture/app-context.md](docs/architecture/app-context.md)
- **CQRS Pattern**: [docs/guides/cqrs-pattern.md](docs/guides/cqrs-pattern.md)
- **Event-Driven Architecture**: [docs/architecture/events.md](docs/architecture/events.md)
- **All Documentation**: [docs/README.md](docs/README.md)

---

## License

MIT
