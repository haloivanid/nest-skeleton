import { Logger } from '@nestjs/common';
import { DomainEvent, DomainEventLog } from '@libs/core/domain';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { time } from '@libs/utils';

/**
 * Base class for all Aggregate Roots in the domain.
 * An aggregate root is a cluster of domain objects that can be treated as a single unit.
 * It serves as the entry point for all modifications to the aggregate and ensures
 * business rules and invariants are maintained.
 *
 * This implementation provides event sourcing capabilities and event publishing
 * through NestJS's EventEmitter2.
 */
export abstract class AggregateRoot {
  protected readonly logger = new Logger(this.constructor.name);
  private readonly _events: Map<string, DomainEvent> = new Map();
  private publishStatus: boolean = false;

  protected abstract _id: string;

  /**
   * Adds a domain event to the internal collection if it doesn't already exist.
   * @param event The domain event to add
   */
  protected addEvent(event: DomainEvent): void {
    if (!this._events.has(event.id)) {
      this._events.set(event.id, event);
    }
  }

  /**
   * Publishes all pending domain events through the provided event emitter.
   * This method is idempotent and thread-safe.
   * @param eventEmitter The EventEmitter2 instance to use for publishing events
   */
  public async publishEvents(eventEmitter: EventEmitter2) {
    if (this.publishStatus) {
      this.logger.warn('Publish operation already in progress');
      return;
    }

    try {
      this.publishStatus = true;
      const events = Array.from(this._events.values());

      for (const event of events) {
        await this.executor(event, eventEmitter);
      }

      this.clearEvents();
    } catch (error: any) {
      this.logger.error(`Error publishing events: ${error.message}`, error.stack);
      throw error;
    } finally {
      this.publishStatus = false;
    }
  }

  /**
   * Immediately publishes a single event without adding it to the internal collection.
   * Use this when you need to publish an event outside the normal aggregate transaction.
   * @param event The domain event to publish
   * @param eventEmitter The EventEmitter2 instance to use for publishing
   */
  public async publishEventImmediately(event: DomainEvent, eventEmitter: EventEmitter2) {
    await this.executor(event, eventEmitter);
  }

  /**
   * Clears all pending domain events from the internal collection.
   * Typically called after successful event publishing.
   */
  public clearEvents(): void {
    this._events.clear();
  }

  /**
   * Internal executor that handles the actual event publishing and logging.
   * @param event The domain event to process
   * @param emitter The EventEmitter2 instance to use for publishing
   */
  private async executor(event: DomainEvent, emitter: EventEmitter2) {
    const start = time().unix();
    const eventName = event.constructor.name;
    const aggregateId = this._id;
    const eventId = event.id;

    const log: DomainEventLog = {
      eventId,
      eventName,
      aggregateId,
      timestamp: time().unix(),
      status: 'pending',
      duration: 0,
      metadata: event.metadata || {},
    };

    try {
      this.logger.debug(`Publishing event: ${eventName} (${eventId})`);

      await emitter.emitAsync(eventName, event);

      log.status = 'published';
      log.duration = time().unix() - start;

      this.logger.log(`Event published successfully: ${eventName} in ${log.duration}ms`, { eventId, aggregateId });
    } catch (error: any) {
      log.status = 'failed';
      log.error = error.message;
      log.duration = time().unix() - start;

      this.logger.error(`Failed to publish event: ${eventName} - ${error.message}`, error.stack, {
        eventId,
        aggregateId,
      });

      throw error;
    } finally {
      this.logger.debug('Event publishing completed', {
        eventName,
        eventId,
        aggregateId,
        status: log.status,
        duration: log.duration,
      });
    }
  }
}
