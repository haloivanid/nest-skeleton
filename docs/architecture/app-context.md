# Application Context (AppCtx)

The `AppCtxService` provides a way to access request-scoped information globally throughout the application without passing it down through function arguments. It uses Node.js `AsyncLocalStorage` to store context data that persists across asynchronous operations within a single request lifecycle.

## Why use AppCtx?

In a layered architecture (like Clean Architecture), we often need access to request-specific data—such as the Request ID (for logging), the current user's IP, or the authenticated Actor ID—in deep layers of the application (e.g., Domain or Infrastructure layers).

Passing this information through every method signature (`func(ctx, data)`) is cumbersome and couples business logic to infrastructure concerns. `AppCtxService` solves this by making the context available anywhere via dependency injection.

## Available Context Properties

The `IApplicationContext` interface defines what is available:

| Property        | Type            | Description                                        |
| --------------- | --------------- | -------------------------------------------------- |
| `requestId`     | `string`        | Unique UUID for the current request (for tracing)  |
| `ip`            | `string`        | The client's IP address                            |
| `userAgent`     | `string`        | The client's User-Agent string                     |
| `actorId`       | `string`        | Verified ID of the current user (if authenticated) |
| `requestedLang` | `RequestedLang` | Language preference (e.g. `EN`)                    |
| `timestamp`     | `number`        | Unix timestamp when the request started            |

## How it Works

1. **Middleware**: `AppCtxMiddleware` (globally registered) intercepts every request.
2. **Setup**: It calls `AppCtxService.run(() => next())` to initialize a new storage store for the request.
3. **Population**: It extracts headers (like `x-request-id`, `x-real-ip`) and populates the context.
4. **Access**: Any service can inject `AppCtxService` and access `this.appCtx.context`.

## Usage Example

### Injecting the Service

```typescript
import { Injectable } from '@nestjs/common';
import { AppCtxService } from '@libs/core/providers/app-ctx';

@Injectable()
export class MyService {
  constructor(private readonly appCtx: AppCtxService) {}

  doSomething() {
    const context = this.appCtx.context;

    console.log(`Processing request ${context.requestId} from IP ${context.ip}`);

    if (context.actorId) {
      console.log(`User is ${context.actorId}`);
    }
  }
}
```

### Safety Note

`AppCtxService.context` returns the current store. If called outside of an active request (e.g., during app bootstrap or in a background job not wrapped in `run`), it will return an empty object `{}` to prevent crashes, but properties will be `undefined`. Always verify existence if specific fields are critical.
