# Creating a Module: Step-by-Step Tutorial

This tutorial walks you through creating a complete feature module in the NestJS skeleton project. We'll build a "Tasks" module as a practical example.

**Time required**: ~2 hours  
**Prerequisites**: Basic TypeScript, understanding of [CQRS pattern](../guides/cqrs-pattern.md)

---

## What We'll Build

A task management feature with:

- ✅ Create task (POST /tasks)
- ✅ List tasks (GET /tasks)
- ✅ Get single task (GET /tasks/:id)
- ✅ Update task (PATCH /tasks/:id)
- ✅ Delete task (DELETE /tasks/:id)

---

## Step 1: Plan the Domain (5 min)

### Define the Task Entity

**Fields**:

- `id`: string (UUID)
- `title`: string (required)
- `description`: string (optional)
- `status`: enum ('todo', 'in_progress', 'done')
- `userId`: string (who created it)
- `createdAt`: Date
- `updatedAt`: Date
- `deletedAt`: Date | null (soft delete)

---

## Step 2: Create Directory Structure (2 min)

```bash
cd src/modules

# Create the complete structure
mkdir -p tasks/{domain,dto/{requests,responses},repository,services/{command,query,usecase},mapper}

# Create index files for barrel exports
touch tasks/domain/index.ts
touch tasks/dto/index.ts
touch tasks/dto/requests/index.ts
touch tasks/dto/responses/index.ts
touch tasks/repository/index.ts
touch tasks/services/command/index.ts
touch tasks/services/query/index.ts
touch tasks/services/usecase/index.ts
touch tasks/mapper/index.ts
touch tasks/index.ts
```

---

## Step 3: Define Types (5 min)

**File**: `src/modules/tasks/domain/task-entity.types.ts`

```typescript
import { DomainCreationPayload } from '@libs/core/domain';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskEntityFields {
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  deletedAt: Date | null;
}

export type TaskEntityCreationPayload = DomainCreationPayload<TaskEntityFields>;
```

---

## Step 4: Create Domain Entity (10 min)

**File**: `src/modules/tasks/domain/task.entity.ts`

```typescript
import { Entity, EntityFieldSchema } from '@libs/core/domain';
import { z } from 'zod';
import { TaskEntityCreationPayload, TaskEntityFields } from './task-entity.types';

export class Task extends Entity<TaskEntityFields, TaskEntityCreationPayload> {
  declare protected _id: string;

  protected getEntityFieldsSchema(): EntityFieldSchema<TaskEntityFields> {
    return z
      .object({
        title: z.string().min(1).max(255),
        description: z.string().max(1000).nullable(),
        status: z.enum(['todo', 'in_progress', 'done']),
        userId: z.string().uuid(),
        deletedAt: z.date().nullable(),
      })
      .strict();
  }

  static create(payload: TaskEntityCreationPayload): Task {
    const entity = new Task(payload);
    entity.logger.debug(JSON.stringify({ state: 'ENTITY_CREATION', payload: entity.toObject() }));
    return entity;
  }

  // Business logic methods
  markAsInProgress(): void {
    if (this._fields.status === 'done') {
      throw new Error('Cannot move completed task back to in progress');
    }
    this._fields.status = 'in_progress';
  }

  markAsDone(): void {
    this._fields.status = 'done';
  }
}
```

**File**: `src/modules/tasks/domain/index.ts`

```typescript
export * from './task.entity';
export * from './task-entity.types';
```

---

## Step 5: Create DTOs (10 min)

**File**: `src/modules/tasks/dto/requests/create-task.dto.ts`

```typescript
export class CreateTaskDto {
  title: string;
  description?: string;
  userId: string; // From JWT in real app
}
```

**File**: `src/modules/tasks/dto/requests/update-task.dto.ts`

```typescript
import { TaskStatus } from '@module/tasks/domain';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
```

**File**: `src/modules/tasks/dto/responses/task-response.dto.ts`

```typescript
import { TaskStatus } from '@module/tasks/domain';

export class TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Add barrel exports in each `index.ts`.

---

## Step 6: Create Database Entity (10 min)

**File**: `src/databases/entities/tasks.typeorm-entity.ts`

```typescript
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BaseTypeormEntity } from '@db/base';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

@Entity('tasks')
export class TasksTypeormEntity extends BaseTypeormEntity {
  readonly sortable: (keyof this)[] = ['title', 'createdAt', 'status'];

  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'enum', enum: ['todo', 'in_progress', 'done'], default: 'todo' })
  status: TaskStatus;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index({ where: 'deleted_at IS NOT NULL' })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
```

**Generate migration**:

```bash
pnpm db:migration:generate create-tasks-table
```

---

## Step 7: Create Repository (15 min)

**File**: `src/modules/tasks/repository/task.repository.ts`

```typescript
import { TasksTypeormEntity } from '@db/entities/tasks.typeorm-entity';
import { Repository } from 'typeorm';

export abstract class TaskRepository extends Repository<TasksTypeormEntity> {
  abstract findByUserId(userId: string): Promise<TasksTypeormEntity[]>;
  abstract findOneById(id: string): Promise<TasksTypeormEntity | null>;
}
```

**File**: `src/modules/tasks/repository/task.typeorm-adapter.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksTypeormEntity } from '@db/entities/tasks.typeorm-entity';
import { Repository } from 'typeorm';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskTypeormAdapter extends TaskRepository {
  constructor(
    @InjectRepository(TasksTypeormEntity)
    private readonly repo: Repository<TasksTypeormEntity>,
  ) {
    super(TasksTypeormEntity, repo.manager, repo.queryRunner);
  }

  async findByUserId(userId: string): Promise<TasksTypeormEntity[]> {
    return this.repo.find({ where: { userId, deletedAt: null }, order: { createdAt: 'DESC' } });
  }

  async findOneById(id: string): Promise<TasksTypeormEntity | null> {
    return this.repo.findOne({ where: { id, deletedAt: null } });
  }
}
```

**File**: `src/modules/tasks/repository/task-repository.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksTypeormEntity } from '@db/entities/tasks.typeorm-entity';
import { TaskRepository } from './task.repository';
import { TaskTypeormAdapter } from './task.typeorm-adapter';

@Module({
  imports: [TypeOrmModule.forFeature([TasksTypeormEntity])],
  providers: [{ provide: TaskRepository, useClass: TaskTypeormAdapter }],
  exports: [TaskRepository],
})
export class TaskRepositoryModule {}
```

---

## Step 8: Create Mapper (10 min)

**File**: `src/modules/tasks/mapper/task.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Task } from '@module/tasks/domain';
import { TasksTypeormEntity } from '@db/entities/tasks.typeorm-entity';
import { TaskResponseDto } from '@module/tasks/dto/responses/task-response.dto';

@Injectable()
export class TaskMapper {
  fromDomainToRepositoryEntity(task: Task): TasksTypeormEntity {
    const entity = new TasksTypeormEntity();
    const obj = task.toObject();

    entity.id = obj.id;
    entity.title = obj.title;
    entity.description = obj.description;
    entity.status = obj.status;
    entity.userId = obj.userId;
    entity.createdAt = obj.createdAt;
    entity.updatedAt = obj.updatedAt;
    entity.deletedAt = obj.deletedAt;

    return entity;
  }

  fromDomainToResponse(task: Task): TaskResponseDto {
    const obj = task.toObject();

    return {
      id: obj.id,
      title: obj.title,
      description: obj.description,
      status: obj.status,
      userId: obj.userId,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
```

---

## Step 9: Create Commands & Use Cases (20 min)

**File**: `src/modules/tasks/services/command/create-task.command.ts`

```typescript
import { CreateTaskDto } from '@module/tasks/dto/requests/create-task.dto';

export class CreateTaskCommand {
  constructor(public readonly dto: CreateTaskDto) {}
}
```

**File**: `src/modules/tasks/services/usecase/create-task.use-case.ts`

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../command/create-task.command';
import { Task, TaskEntityCreationPayload } from '@module/tasks/domain';
import { TaskRepository } from '@module/tasks/repository';
import { TaskMapper } from '@module/tasks/mapper';
import { TaskResponseDto } from '@module/tasks/dto/responses/task-response.dto';
import { entityId } from '@libs/utils/uid';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(CreateTaskCommand)
export class CreateTaskUseCase implements ICommandHandler<CreateTaskCommand, TaskResponseDto> {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskMapper: TaskMapper,
  ) {}

  async execute(command: CreateTaskCommand): Promise<TaskResponseDto> {
    const payload: TaskEntityCreationPayload = {
      id: entityId(),
      fields: {
        title: command.dto.title,
        description: command.dto.description || null,
        status: 'todo',
        userId: command.dto.userId,
        deletedAt: null,
      },
    };

    const task = Task.create(payload);

    await this.taskRepository.save(this.taskMapper.fromDomainToRepositoryEntity(task));

    return this.taskMapper.fromDomainToResponse(task);
  }
}
```

---

## Step 10: Create Queries (15 min)

**File**: `src/modules/tasks/services/query/list-tasks.query.ts`

```typescript
export class ListTasksQuery {
  constructor(public readonly userId: string) {}
}
```

**File**: `src/modules/tasks/services/usecase/list-tasks.use-case.ts`

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListTasksQuery } from '../query/list-tasks.query';
import { TaskRepository } from '@module/tasks/repository';
import { TaskResponseDto } from '@module/tasks/dto/responses/task-response.dto';

@QueryHandler(ListTasksQuery)
export class ListTasksUseCase implements IQueryHandler<ListTasksQuery, TaskResponseDto[]> {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: ListTasksQuery): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findByUserId(query.userId);

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }
}
```

---

## Step 11: Create Controller (10 min)

**File**: `src/modules/tasks/task.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskDto } from './dto/requests/create-task.dto';
import { UpdateTaskDto } from './dto/requests/update-task.dto';
import { CreateTaskCommand } from './services/command/create-task.command';
import { ListTasksQuery } from './services/query/list-tasks.query';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    return this.commandBus.execute(new CreateTaskCommand(dto));
  }

  @Get()
  async list(/* @CurrentUser() user: User */) {
    // For now, hardcode userId. Later get from JWT
    const userId = 'user-123';
    return this.queryBus.execute(new ListTasksQuery(userId));
  }

  // Add update, get by ID, delete methods similarly
}
```

---

## Step 12: Create Module (5 min)

**File**: `src/modules/tasks/task.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TaskRepositoryModule } from './repository/task-repository.module';
import { TaskController } from './task.controller';
import { CreateTaskUseCase } from './services/usecase/create-task.use-case';
import { ListTasksUseCase } from './services/usecase/list-tasks.use-case';
import { TaskMapper } from './mapper/task.mapper';

@Module({
  imports: [TaskRepositoryModule],
  controllers: [TaskController],
  providers: [CreateTaskUseCase, ListTasksUseCase, TaskMapper],
  exports: [TaskRepositoryModule],
})
export class TaskModule {}
```

**File**: `src/main.module.ts` - Add import:

```typescript
  imports: [
    // ... existing imports
    TaskModule, // Add this
  ],
```

---

## Step 13: Run Migration & Test (10 min)

```bash
# Run migration
pnpm db:migrate

# Start server
pnpm start:dev

# Test with curl
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Task","userId":"user-123"}'

curl http://localhost:3000/tasks
```

---

## Summary

You've created:

- ✅ Domain entity with validation
- ✅ TypeORM entity with migration
- ✅ Repository pattern with abstraction
- ✅ CQRS commands and queries
- ✅ Use cases with business logic
- ✅ Controller with HTTP endpoints
- ✅ Complete module registration

**Total files created**: ~20 files  
**Lines of code**: ~400-500 lines

---

## Next Steps

- Add update and delete operations
- Add authentication (get userId from JWT)
- Add pagination to list endpoint
- Add filtering and search
- Add unit tests
- Add validation decorators to DTOs

---

## Common Issues

**Migration fails**: Check database connection in `.env`  
**TypeORM entity not found**: Ensure it's imported in repository module  
**Handler not found**: Check it's provided in module  
**Validation errors**: Check Zod schema in domain entity

---

## Learn More

- [CQRS Pattern Guide](../guides/cqrs-pattern.md)
- [Architecture Overview](../architecture/overview.md)
- [Coding Conventions](../reference/coding-conventions.md)
