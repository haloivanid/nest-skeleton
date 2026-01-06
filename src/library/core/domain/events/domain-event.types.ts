import { DomainEvent } from '@libs/core/domain';

/**
 * Metadata associated with a domain event
 */
export interface DomainEventMetadata {
  /** Correlation ID for tracing related operations */
  correlationId: string;

  /** ID of the command/message that caused this event */
  causationId?: string;

  /** ID of the user who initiated the action that caused this event */
  userId?: string;

  /** When the event occurred (Unix timestamp in seconds) */
  occurredAt: number;

  /** Additional context-specific metadata */
  [key: string]: unknown;
}

/**
 * Type for the fields required to construct a domain event
 */
export type DomainEventFields<T extends { aggregateId: string; metadata: DomainEventMetadata }> = Omit<
  T,
  'id' | 'metadata'
> & {
  aggregateId: string;
  metadata: { correlationId: string; causationId?: string; userId?: string; occurredAt?: number };
};

/**
 * Log entry for tracking domain event publishing
 */
export interface DomainEventLog {
  /** Unique event identifier */
  eventId: string;

  /** Name of the event (class name) */
  eventName: string;

  /** ID of the aggregate that emitted the event */
  aggregateId: string;

  /** When the event was processed */
  timestamp: number;

  /** Processing status */
  status: 'pending' | 'published' | 'failed';

  /** Processing duration in milliseconds */
  duration: number;

  /** Any error that occurred during processing */
  error?: string;

  /** Additional metadata */
  metadata: Record<string, unknown>;
}

/**
 * Base interface for domain event handlers
 */
export interface DomainEventHandler<T extends DomainEvent> {
  /**
   * Handles a domain event
   * @param event The domain event to handle
   */
  handle(event: T): Promise<void>;
}

/**
 * Type for domain event handler functions
 */
export type DomainEventHandlerFunction<T extends DomainEvent> = (event: T) => Promise<void>;
