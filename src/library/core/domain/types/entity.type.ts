import { z } from 'zod';
/**
 * Common fields that are automatically managed by the base Entity class
 */
export interface CommonEntityFields {
  /** Unique identifier for the entity */
  id: string;

  /** When the entity was created */
  createdAt: Date;

  /** When the entity was last updated */
  updatedAt: Date;
}

/**
 * Common fields that all entities should have
 */
export type BaseEntityFields = Record<Exclude<string, keyof CommonEntityFields>, any>;

/**
 * Payload for creating a new entity
 */
export interface DomainCreationPayload<T extends BaseEntityFields> {
  /** Unique identifier for the entity */
  id: string;

  /** When the entity was created */
  createdAt?: Date;

  /** When the entity was last updated */
  updatedAt?: Date;

  /** The fields of the entity */
  fields: T;
}

/**
 * Type for defining entity field schemas with Zod
 */
export type EntityFieldSchema<T> = z.ZodSchema<T>;
