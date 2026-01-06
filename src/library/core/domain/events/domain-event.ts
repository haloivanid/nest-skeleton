import { DomainEventMetadata } from '@libs/core/domain';
import { systemId } from '@libs/utils/uid';
import { time } from '@libs/utils/time';

/**
 * Base class for all domain events.
 * Domain events represent something that happened in the domain that domain experts care about.
 */
export abstract class DomainEvent {
  /** Unique identifier for this event */
  readonly id: string;

  /** The ID of the aggregate that this event belongs to */
  readonly aggregateId: string;

  /** Additional metadata about the event */
  readonly metadata: DomainEventMetadata;

  /**
   * Creates a new domain event
   * @param fields The fields required to create the event
   */
  protected constructor(fields: {
    aggregateId: string;
    metadata: { correlationId: string; causationId?: string; userId?: string; occurredAt?: number };
  }) {
    this.id = systemId();
    this.aggregateId = fields.aggregateId;
    this.metadata = {
      correlationId: fields.metadata.correlationId,
      causationId: fields.metadata?.causationId,
      userId: fields.metadata?.userId,
      occurredAt: fields.metadata?.occurredAt || time().unix(),
    };
  }

  /**
   * Returns the name of this event (the class name)
   */
  get eventName(): string {
    return this.constructor.name;
  }

  /**
   * Returns the event ID (same as id, but more explicit for logging)
   */
  get eventId(): string {
    return this.id;
  }
}
