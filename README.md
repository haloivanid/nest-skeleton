# Nest Skeleton

A NestJS + Fastify starter that demonstrates a layered module/repository pattern with TypeORM and PostgreSQL.

## How the project works

### Application bootstrap

- Entry point: `src/main.ts` loads environment variables (`dotenv`), creates a Fastify-based Nest app, enables CORS, and starts the HTTP server.
- Root module: `src/main.module.ts` wires global interceptors/filters, registers the app context module, configures TypeORM, and imports feature modules. It also validates required DB environment variables on bootstrap.

### Layered structure

```
src/
  configs/        # Runtime configuration (e.g., TypeORM, Fastify)
  databases/      # Database layer (entities, migrations, seeds)
  library/        # Shared utilities, core modules, interceptors, filters
  modules/        # Feature modules (controllers + repositories)
  main.ts         # App bootstrap
  main.module.ts  # Root module composition
```

At a high level:

- **Application layer**: the Nest application (`main.ts`, `main.module.ts`).
- **Module layer**: feature modules and their controllers (`src/modules/**`).
- **Database layer**: TypeORM entities/migrations/seeds (`src/databases/**`).

## Building module layers

A feature module typically contains:

1. **Controller**
   - Defines HTTP routes.
   - Example: `src/modules/users/user.controller.ts`.

2. **Repository abstraction**
   - Defines a module-level repository interface or base class.
   - Example: `src/modules/users/repository/user.repository.ts`.

3. **Repository adapter**
   - Binds the abstraction to a TypeORM implementation.
   - Example: `src/modules/users/repository/user.typeorm-adapter.ts`.

4. **Repository module**
   - Registers entities and provides the repository implementation.
   - Example: `src/modules/users/repository/user-repository.module.ts`.

5. **Feature module**
   - Composes controllers and repository module.
   - Example: `src/modules/users/user.module.ts`.

## Connecting module layer to database layer

Use a repository module to bind entities and repository implementations:

1. Register entities with TypeORM in the repository module:

```ts
// src/modules/users/repository/user-repository.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UsersTypeormEntity])],
  providers: [{ provide: UserRepository, useClass: UserTypeormAdapter }],
  exports: [UserRepository],
})
export class UserRepositoryModule {}
```

2. Implement the repository adapter to wrap the TypeORM repository:

```ts
// src/modules/users/repository/user.typeorm-adapter.ts
@Injectable()
export class UserTypeormAdapter extends UserRepository {
  constructor(@InjectRepository(UsersTypeormEntity) private readonly repo: Repository<UsersTypeormEntity>) {
    super(UsersTypeormEntity, repo.manager, repo.queryRunner);
  }
}
```

3. Define the entity in the database layer:

```ts
// src/databases/entities/users.typeorm-entity.ts
@Entity()
export class UsersTypeormEntity extends BaseTypeormEntity {
  // columns, indexes, etc.
}
```

This keeps the database-specific wiring inside the repository module while feature modules depend only on the abstract `UserRepository`.

## Connecting application layer to module layer

Import the feature module into the root `MainModule`:

```ts
// src/main.module.ts
@Module({ imports: [AppCtxModule.register(), TypeOrmModule.forRoot(typeormConfig), UserModule] })
export class MainModule {}
```

This makes the module’s controllers and providers available to the application.

## Configuration

### Environment variables

The app requires these database env vars (validated on bootstrap):

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

### TypeORM config

TypeORM is configured in `src/configs/typeorm/typeorm.config.ts` and loaded via `TypeOrmModule.forRoot(...)` in `MainModule`.

## Development

### Install dependencies

```bash
pnpm install
```

### Run the app

```bash
pnpm start:dev
```

### Database migrations

```bash
pnpm db:migration:generate <name>
pnpm db:migrate
pnpm db:migrate:revert
```

### Seeds

```bash
pnpm db:seed:create <name>
pnpm db:seed
```
