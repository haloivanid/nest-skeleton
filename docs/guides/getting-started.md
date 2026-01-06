# Getting Started

This guide helps you set up and run the NestJS skeleton project for the first time.

## Prerequisites

- **Node.js**: >= 22.0.0
- **pnpm**: 10.26.1 (see [package.json](../../package.json) for exact version)
- **PostgreSQL**: >= 14
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nest-skeleton
```

### 2. Install Dependencies

The project uses pnpm for package management:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=nest_skeleton_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Encryption
SALT_ROUND=10
PII_SECRET=your-pii-secret
PII_ACTIVE=true
HMAC_SECRET=your-hmac-secret
MASTER_KEY=your-master-key
DERIVE_KEY=your-derive-key

# Server
PORT=3000
NODE_ENV=development
```

> ⚠️ **Security**: Never commit `.env` to version control. Use strong, random values for secrets in production.

### 4. Set Up the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE nest_skeleton_dev;
```

Or using the command line:

```bash
createdb nest_skeleton_dev
```

### 5. Run Migrations

Apply database migrations:

```bash
pnpm db:migrate
```

This will create the necessary tables in your database.

### 6. Start the Development Server

```bash
pnpm start:dev
```

The server will start on `http://localhost:3000` (or the PORT you specified).

You should see:

```
[Nest] INFO  Application successfully started
```

### 7. Test the API

Test if everything is working:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Response should be:
# {"id":"...","name":"Test User","email":"test@example.com","createdAt":"..."}
```

---

## Development Workflow

### Running the Application

```bash
# Development mode with hot reload
pnpm start:dev

# Production build
pnpm build
pnpm start
```

### Code Quality

```bash
# Format code with Prettier
pnpm format

# Lint code with ESLint
pnpm lint

# Both are enforced on commit via husky
```

### Database Migrations

```bash
# Generate a new migration
pnpm db:migration:generate migration-name

# Run pending migrations
pnpm db:migrate

# Revert last migration
pnpm db:migrate:revert
```

### Committing Changes

The project uses conventional commits:

```bash
# Interactive commit helper
pnpm commit

# This will guide you through creating a properly formatted commit message
```

Commit format: `type(scope): subject`

Example:

```bash
feat(users): add email verification
fix(auth): handle expired tokens correctly
docs(readme): update installation steps
```

---

## Project Structure Overview

```
nest-skeleton/
├── docs/              # Documentation (you are here!)
├── src/
│   ├── configs/       # Configuration files
│   ├── databases/     # TypeORM entities, migrations
│   ├── library/       # Shared code, utilities
│   ├── modules/       # Feature modules
│   ├── main.ts        # Application entry point
│   └── main.module.ts # Root module
├── .env               # Environment variables (create from .env.example)
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

---

## Next Steps

Now that you have the project running:

1. **Understand the architecture**: [Architecture Overview](../architecture/overview.md)
2. **Learn CQRS**: [CQRS Pattern Guide](cqrs-pattern.md)
3. **Create your first feature**: [Creating a Module Tutorial](../tutorials/creating-a-module.md)
4. **Explore the code**: Check out the `users` module as a reference implementation

---

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Change PORT in .env
PORT=3001
```

### Database Connection Error

Check your database credentials in `.env` and ensure PostgreSQL is running:

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

### Migration Errors

If migrations fail:

```bash
# Check database connection
pnpm typeorm -d src/library/utils/typeorm/typeorm-migrations.datasource.ts query "SELECT 1"

# Drop all tables and re-run migrations (CAUTION: deletes all data)
pnpm db:migration:revert # Repeat until all reverted
pnpm db:migrate
```

### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules
pnpm install
```

---

## Getting Help

- Check the [FAQ in docs README](../README.md#-frequently-asked-questions)
- Review the [API Usage Guide](../reference/api-usage.md)
- Open an issue on the repository

---

**Ready to build?** Head to [Creating a Module Tutorial](../tutorials/creating-a-module.md)!
