import { isEmpty } from '@libs/utils';
import {
  AggregateRoot,
  BaseEntityFields,
  CommonEntityFields,
  DomainCreationPayload,
  EntityFieldSchema,
} from '@libs/core/domain';
import { fieldToPlainUtil } from '@libs/core/domain/utils/field-to-plain.util';

/**
 * Base class for all domain entities.
 * An entity is defined by its identity rather than its attributes.
 *
 * @template TFields - The type for the entity's fields
 * @template TCreationPayload - The type for the payload used to create the entity
 */
export abstract class Entity<
  TFields extends BaseEntityFields,
  TCreationPayload extends DomainCreationPayload<TFields>,
> extends AggregateRoot {
  /** The fields of the entity */
  protected readonly _fields: TFields;

  /** When the entity was created */
  protected _createdAt: Date;

  /** When the entity was last updated */
  protected _updatedAt: Date;

  /**
   * Returns the Zod schema for validating the entity's fields
   * This must be implemented by child classes
   */
  protected abstract getEntityFieldsSchema(): EntityFieldSchema<TFields>;

  /**
   * Creates a new entity instance
   * @param payload - The payload containing entity data
   * @throws {Error} If the payload is empty or invalid
   */
  constructor(payload: TCreationPayload) {
    if (isEmpty(payload)) {
      throw new Error('Entity creation payload cannot be empty');
    }

    super();

    this.setId(payload);
    this.setTimestamps(payload);
    this._fields = this.prepareFields(payload.fields);
  }

  static asIs<T extends BaseEntityFields = any, C extends DomainCreationPayload<T> = any>(
    value: unknown,
  ): value is Entity<T, C> {
    return value instanceof Entity;
  }

  /**
   * Returns a plain object representation of the entity
   */
  public toObject(): Readonly<Record<keyof (CommonEntityFields & TFields), any>> {
    return Object.freeze(
      fieldToPlainUtil<CommonEntityFields & TFields>({
        id: this.id,
        ...this._fields,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      }),
    );
  }

  /**
   * Gets the entity's ID
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Gets the entity's creation timestamp
   */
  public get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Gets the entity's last update timestamp
   */
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Sets the entity's ID from the payload
   * @param payload - The creation payload
   */
  private setId(payload: TCreationPayload): void {
    this._id = payload.id;
  }

  /**
   * Sets the entity's timestamps from the payload or uses the current time
   * @param payload - The creation payload
   */
  private setTimestamps(payload: TCreationPayload): void {
    const now = new Date();
    this._createdAt = payload.createdAt || now;
    this._updatedAt = payload.updatedAt || now;
  }

  /**
   * Validates and prepares the entity fields using the schema
   * @param fields - The raw fields to validate
   * @returns The validated and prepared fields
   * @throws {Error} If the fields don't match the schema
   */
  private prepareFields(fields: unknown): TFields {
    const schema = this.getEntityFieldsSchema();
    const result = schema.safeParse(fields);

    if (!result.success) {
      throw new Error(`Invalid entity fields: ${result.error.message}`);
    }

    return result.data;
  }
}
