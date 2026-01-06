# Documentation Index

Welcome to the NestJS Skeleton documentation! This guide will help you understand the project architecture, learn the patterns used, and start building features.

> 💡 **Quick setup?** See the [main README](../README.md) for installation and development commands.

## 🎯 Quick Start

**New to the project?** Follow this learning path:

1. **Understand the Architecture** (15 min)
   - [Architecture Overview](architecture/overview.md) - Why this structure?
   - [Layer Breakdown](architecture/layers.md) - What each layer does

2. **Learn the Patterns** (30 min)
   - [CQRS Pattern Guide](guides/cqrs-pattern.md) - Commands vs Queries
   - [Domain-Driven Design](guides/domain-driven-design.md) - Entities and Value Objects
   - [Repository Pattern](guides/repository-pattern.md) - Data access abstraction

3. **Build Your First Feature** (2 hours)
   - [Creating a Module Tutorial](tutorials/creating-a-module.md) - Step-by-step guide
   - [Example: Todo Module](examples/todo-module/step-by-step.md) - Complete reference

4. **Reference Materials**
   - [Coding Conventions](reference/coding-conventions.md) - Project standards
   - [Folder Structure](reference/folder-structure.md) - Directory organization
   - [API Usage](reference/api-usage.md) - How to use the endpoints

---

## 📚 Documentation Sections

### Architecture

Understanding how the application is structured:

- **[Architecture Overview](architecture/overview.md)** - High-level architecture explanation
- **[Layer Breakdown](architecture/layers.md)** - Detailed layer responsibilities
- **[Data Flow](architecture/data-flow.md)** - Request/response flow through the system

### Guides

Conceptual guides to understand the patterns:

- **[CQRS Pattern](guides/cqrs-pattern.md)** - Command Query Responsibility Segregation
- **[Domain-Driven Design](guides/domain-driven-design.md)** - DDD concepts in this project
- **[Repository Pattern](guides/repository-pattern.md)** - Data access abstraction
- **[Getting Started](guides/getting-started.md)** - Environment setup and first run

### Tutorials

Step-by-step practical guides:

- **[Creating a Module](tutorials/creating-a-module.md)** - Build a complete feature module
- **[Adding Endpoints](tutorials/adding-endpoints.md)** - Add new API routes
- **[Database Operations](tutorials/database-operations.md)** - Migrations, entities, queries
- **[Testing](tutorials/testing.md)** - Writing and running tests (coming soon)

### Reference

Quick reference materials:

- **[Coding Conventions](reference/coding-conventions.md)** - Naming and structure rules
- **[Folder Structure](reference/folder-structure.md)** - Complete directory explanation
- **[API Usage](reference/api-usage.md)** - How to interact with the API

### Examples

Complete working examples:

- **[Todo Module](examples/todo-module/step-by-step.md)** - Full CRUD module implementation

---

## 🆘 Frequently Asked Questions

### General Questions

**Q: Where do I start if I'm new to NestJS?**
A: Start with the [NestJS official documentation](https://docs.nestjs.com/), then read our [Architecture Overview](architecture/overview.md) to understand how we structure projects.

**Q: Where do I start if I'm new to this project?**
A: Follow the Quick Start learning path above. Start with architecture, learn the patterns, then build something.

**Q: What if I don't understand DDD or CQRS?**
A: That's okay! Read our guides on [Domain-Driven Design](guides/domain-driven-design.md) and [CQRS Pattern](guides/cqrs-pattern.md). They're written for beginners.

### Development Questions

**Q: How do I add a new feature?**
A: Follow the [Creating a Module Tutorial](tutorials/creating-a-module.md) which walks you through creating a complete feature from scratch.

**Q: Where do I put my code?**
A: See [Folder Structure](reference/folder-structure.md) and [Coding Conventions](reference/coding-conventions.md) for detailed guidance.

**Q: How do I know if I should create a Command or a Query?**
A: If it changes data (create, update, delete), use a Command. If it only reads data, use a Query. See [CQRS Pattern Guide](guides/cqrs-pattern.md).

**Q: What's the difference between domain entities and TypeORM entities?**
A: Domain entities (`*.entity.ts`) contain business logic and are framework-agnostic. TypeORM entities (`*.typeorm-entity.ts`) are for database persistence. See [Layer Breakdown](architecture/layers.md).

### Database Questions

**Q: How do I add a new database table?**
A: Create a TypeORM entity, then run `pnpm db:migration:generate <name>`. See [Database Operations](tutorials/database-operations.md).

**Q: How do I query the database?**
A: Use the repository pattern. See [Repository Pattern Guide](guides/repository-pattern.md).

---

## 📖 Related Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Domain-Driven Design Book](https://www.domainlanguage.com/ddd/) by Eric Evans
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html) by Martin Fowler

---

## 🤝 Contributing to Documentation

Found something unclear? Please improve it!

1. Edit the relevant markdown file
2. Follow our documentation style:
   - Use clear, simple language
   - Include code examples
   - Add diagrams where helpful
3. Submit a pull request

---

**Need help?** Open an issue or reach out to the team.
