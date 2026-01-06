/**
 * Enhanced DeepConverter - A comprehensive utility for type-safe deep object conversion
 *
 * @module DeepConverter
 * @version 2.0.0
 *
 * Key improvements:
 * - Clarified autoWhen behavior and filter precedence
 * - Simplified adaptOrClone logic with explicit mode handling
 * - Optimized property processing with early filtering
 * - Enhanced type safety with stricter TypeScript support
 * - Comprehensive documentation with real-world examples
 */

/* ============================================================================
 * TYPE DEFINITIONS
 * ========================================================================== */

/**
 * Constructor class generic that returns an instance of type T
 * @template T - The class type to be instantiated
 */
type ClassCtor<T> = new () => T;

/**
 * Read-only record type for safe object manipulation
 */
type ReadonlyRecord = Readonly<Record<string, unknown>>;

/**
 * Property descriptor mapping type
 */
type DescMap = Record<PropertyKey, PropertyDescriptor>;

/**
 * Extracts keys that can be auto-assigned from From to To based on type compatibility
 *
 * @template From - Source type
 * @template To - Target type
 *
 * @example
 * ```typescript
 * type Source = { id: number; name: string; age: number };
 * type Target = { id: number; name: string; email: string };
 * // AutoAssignableKeys<Source, Target> = 'id' | 'name'
 * ```
 */
type AutoAssignableKeys<From, To> = { [K in keyof To & keyof From]: From[K] extends To[K] ? K : never }[keyof To &
  keyof From];

/**
 * Context available to type adapters during conversion
 *
 * @template From - Source type
 * @template To - Target type
 */
export type AdapterContext<From, To> = {
  /** Property name being processed */
  key: string;
  /** Source object (read-only) */
  src: Readonly<From>;
  /** Target object being built */
  out: To;
  /** Sample value from target property (if exists) */
  targetSample: unknown;
  /** Conversion mode: 'spec' for explicit specs, 'auto' for automatic conversion */
  mode: 'spec' | 'auto';
};

/**
 * Type adapter interface for handling custom type conversions
 *
 * Type adapters allow you to define custom conversion logic for specific types
 * or values. They're evaluated in order and the first matching adapter is used.
 *
 * @template From - Source type
 * @template To - Target type
 *
 * @example
 * ```typescript
 * // Adapter to convert Date objects to ISO strings
 * const dateToStringAdapter: TypeAdapter<User, UserDto> = {
 *   match: (value) => value instanceof Date,
 *   convert: (value) => (value as Date).toISOString()
 * };
 *
 * // Adapter to convert numbers to formatted currency strings
 * const currencyAdapter: TypeAdapter<Order, OrderDto> = {
 *   match: (value, ctx) =>
 *     typeof value === 'number' && ctx.key.includes('price'),
 *   convert: (value) => `$${(value as number).toFixed(2)}`
 * };
 * ```
 */
export type TypeAdapter<From, To> = {
  /**
   * Determines if this adapter should handle the given value
   * @param value - Value to check
   * @param ctx - Conversion context
   * @returns true if this adapter should handle the conversion
   */
  match: (value: unknown, ctx: AdapterContext<From, To>) => boolean;

  /**
   * Converts the value to the desired form
   * @param value - Value to convert
   * @param ctx - Conversion context
   * @returns Converted value
   */
  convert: (value: unknown, ctx: AdapterContext<From, To>) => unknown;
};

/* ============================================================================
 * UTILITY FUNCTIONS
 * ========================================================================== */

/**
 * Type-safe check for own properties (excludes prototype chain)
 *
 * @param obj - Object to check
 * @param key - Property name to look for
 * @returns true if object has own property with given key
 *
 * @example
 * ```typescript
 * const obj = { a: 1 };
 * hasOwn(obj, 'a');        // true
 * hasOwn(obj, 'toString'); // false (inherited from prototype)
 * ```
 */
function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Type-safe property setter
 *
 * @template T - Object type
 * @template K - Key type
 * @param obj - Target object
 * @param key - Property key
 * @param value - Value to set
 */
function setProp<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}

/**
 * Type-safe property getter
 *
 * @template T - Object type
 * @template K - Key type
 * @param obj - Source object
 * @param key - Property key
 * @returns Property value with correct type
 */
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

/**
 * Gets a sample value from target object for adapter reference
 *
 * @param out - Target object
 * @param key - Property key
 * @returns Property value if exists, undefined otherwise
 */
function getTargetSample(out: unknown, key: string): unknown {
  if (out === null || typeof out !== 'object') return undefined;
  const rec = out as Record<string, unknown>;
  return rec[key];
}

/**
 * Applies the first matching adapter to a value
 *
 * This function iterates through the adapter list and applies the first
 * adapter whose match function returns true. If no adapter matches,
 * the original value is returned unchanged.
 *
 * @template From - Source type
 * @template To - Target type
 * @param adapters - List of adapters to try
 * @param value - Value to convert
 * @param ctx - Conversion context
 * @returns Object with adaptation status and resulting value
 *
 * @example
 * ```typescript
 * const result = applyAdapters(
 *   [dateAdapter, numberAdapter],
 *   new Date(),
 *   context
 * );
 *
 * if (result.adapted) {
 *   console.log('Value was converted:', result.value);
 * } else {
 *   console.log('No adapter matched:', result.value);
 * }
 * ```
 */
function applyAdapters<From, To>(
  adapters: ReadonlyArray<TypeAdapter<From, To>> | undefined,
  value: unknown,
  ctx: AdapterContext<From, To>,
): { adapted: boolean; value: unknown } {
  if (!adapters || adapters.length === 0) {
    return { adapted: false, value };
  }

  for (let i = 0; i < adapters.length; i++) {
    const adapter = adapters[i];
    if (adapter.match(value, ctx)) {
      return { adapted: true, value: adapter.convert(value, ctx) };
    }
  }

  return { adapted: false, value };
}

/* ============================================================================
 * DEEP CLONE UTILITY
 * ========================================================================== */

/**
 * Utility class for deep cloning objects with circular reference handling
 *
 * This class provides a robust deep cloning mechanism that:
 * - Handles circular references
 * - Preserves object prototypes
 * - Clones special objects (Date, Map, Set, Arrays)
 * - Maintains property descriptors
 *
 * @example
 * ```typescript
 * const original = {
 *   a: 1,
 *   b: { c: 2 },
 *   date: new Date(),
 *   map: new Map([['key', 'value']])
 * };
 *
 * const cloned = DeepClone.clone(original);
 *
 * // Deep clone verification
 * console.log(original === cloned);           // false
 * console.log(original.b === cloned.b);       // false
 * console.log(original.date === cloned.date); // false
 *
 * // Circular reference handling
 * const circular: any = { a: 1 };
 * circular.self = circular;
 * const clonedCircular = DeepClone.clone(circular);
 * console.log(clonedCircular.self === clonedCircular); // true
 * ```
 */
export class DeepClone {
  /**
   * Clones an object deeply, preserving structure and handling special types
   *
   * @template T - Type of object to clone
   * @param input - Object to clone
   * @returns Deep clone of the input
   */
  static clone<T>(input: T): T {
    const seen = new WeakMap<object, unknown>();
    return this.cloneInternal(input, seen);
  }

  /**
   * Internal implementation of deep cloning with circular reference tracking
   *
   * @private
   * @template T - Type of object to clone
   * @param input - Object to clone
   * @param seen - WeakMap tracking already cloned objects
   * @returns Deep clone of the input
   */
  private static cloneInternal<T>(input: T, seen: WeakMap<object, unknown>): T {
    // Handle primitives and null
    if (input === null || typeof input !== 'object') {
      return input;
    }

    const obj = input as unknown as object;

    // Check for circular references
    if (seen.has(obj)) {
      return seen.get(obj) as T;
    }

    // Clone Date objects
    if (input instanceof Date) {
      const clonedDate = new Date(input.getTime());
      seen.set(obj, clonedDate);
      return clonedDate as unknown as T;
    }

    // Clone Arrays
    if (Array.isArray(input)) {
      const arr = input as unknown as ReadonlyArray<unknown>;
      const clonedArray: unknown[] = new Array(arr.length);
      seen.set(obj, clonedArray);

      for (let i = 0; i < arr.length; i++) {
        clonedArray[i] = this.cloneInternal(arr[i], seen);
      }

      return clonedArray as unknown as T;
    }

    // Clone Map objects
    if (input instanceof Map) {
      const map = input as unknown as Map<unknown, unknown>;
      const clonedMap = new Map<unknown, unknown>();
      seen.set(obj, clonedMap);

      for (const [key, value] of map.entries()) {
        clonedMap.set(this.cloneInternal(key, seen), this.cloneInternal(value, seen));
      }

      return clonedMap as unknown as T;
    }

    // Clone Set objects
    if (input instanceof Set) {
      const set = input as unknown as Set<unknown>;
      const clonedSet = new Set<unknown>();
      seen.set(obj, clonedSet);

      for (const value of set.values()) {
        clonedSet.add(this.cloneInternal(value, seen));
      }

      return clonedSet as unknown as T;
    }

    // Clone regular objects with prototype preservation
    const proto = Object.getPrototypeOf(input);
    const clonedObj = Object.create(proto) as object;
    seen.set(obj, clonedObj);

    const descriptors = Object.getOwnPropertyDescriptors(input as unknown as object) as unknown as DescMap;

    for (const key of Reflect.ownKeys(descriptors)) {
      const descriptor = descriptors[key];
      if (!descriptor) continue;

      if ('value' in descriptor) {
        const clonedValue = this.cloneInternal(descriptor.value as unknown, seen);
        Object.defineProperty(clonedObj, key, { ...descriptor, value: clonedValue });
      } else {
        // Preserve getters/setters without cloning
        Object.defineProperty(clonedObj, key, descriptor);
      }
    }

    return clonedObj as T;
  }
}

/* ============================================================================
 * FIELD SPECIFICATION TYPES
 * ========================================================================== */

/**
 * Specification for computing a field value dynamically
 *
 * Use this when the target field value needs to be calculated from
 * one or more source fields.
 *
 * @template From - Source type
 * @template Out - Output value type
 *
 * @example
 * ```typescript
 * // Compute full name from first and last name
 * const fullNameSpec: ComputeSpec<User, string> = {
 *   compute: (user) => `${user.firstName} ${user.lastName}`
 * };
 *
 * // Compute age from birth date
 * const ageSpec: ComputeSpec<User, number> = {
 *   compute: (user) => {
 *     const today = new Date();
 *     const birth = new Date(user.birthDate);
 *     return today.getFullYear() - birth.getFullYear();
 *   }
 * };
 * ```
 */
type ComputeSpec<From, Out> = {
  /**
   * Function to compute the field value
   * @param src - Source object (read-only)
   * @returns Computed value
   */
  compute: (src: Readonly<From>) => Out;
};

/**
 * Specification for direct field mapping
 *
 * Use this when the source and target types are compatible and
 * no transformation is needed.
 *
 * @template From - Source type
 * @template K - Source property key
 * @template Out - Output value type
 *
 * @example
 * ```typescript
 * // Map 'id' directly (same name and type)
 * const idSpec: DirectFromSpec<User, 'id', number> = {
 *   from: 'id'
 * };
 *
 * // Map 'emailAddress' to 'email' (compatible types)
 * const emailSpec: DirectFromSpec<User, 'emailAddress', string> = {
 *   from: 'emailAddress'
 * };
 * ```
 */
type DirectFromSpec<From, K extends keyof From, Out> = {
  /** Source property key */
  from: K;
} & (From[K] extends Out ? unknown : never);

/**
 * Specification for field mapping with transformation
 *
 * Use this when you need to transform the value during mapping.
 *
 * @template From - Source type
 * @template K - Source property key
 * @template Out - Output value type
 *
 * @example
 * ```typescript
 * // Convert Date to ISO string
 * const dateSpec: MapFromSpec<User, 'birthDate', string> = {
 *   from: 'birthDate',
 *   map: (date) => date.toISOString()
 * };
 *
 * // Format number as currency
 * const priceSpec: MapFromSpec<Product, 'price', string> = {
 *   from: 'price',
 *   map: (price) => `$${price.toFixed(2)}`
 * };
 *
 * // Convert array to comma-separated string
 * const tagsSpec: MapFromSpec<Post, 'tags', string> = {
 *   from: 'tags',
 *   map: (tags) => tags.join(', ')
 * };
 * ```
 */
type MapFromSpec<From, K extends keyof From, Out> = {
  /** Source property key */
  from: K;

  /**
   * Transformation function
   * @param value - Value from source property
   * @param src - Complete source object (for context)
   * @returns Transformed value
   */
  map: (value: Readonly<From>[K], src: Readonly<From>) => Out;
};

/**
 * Specification for nested object conversion
 *
 * Use this when a source field contains a nested object that needs
 * its own conversion logic.
 *
 * @template From - Source type
 * @template K - Source property key
 * @template Out - Output value type
 *
 * @example
 * ```typescript
 * // Convert nested address object
 * const addressSpec: NestedFromSpec<User, 'address', AddressDto> = {
 *   from: 'address',
 *   nested: addressConverter
 * };
 *
 * // Convert nested user profile
 * const profileSpec: NestedFromSpec<Account, 'profile', ProfileDto> = {
 *   from: 'profile',
 *   nested: profileConverter
 * };
 * ```
 */
type NestedFromSpec<From, K extends keyof From, Out> = {
  /** Source property key containing nested object */
  from: K;

  /** Converter for the nested object */
  nested: DeepConverter<From[K], Out>;
};

/**
 * Specification for array conversion
 *
 * Use this when a source field contains an array where each element
 * needs to be converted.
 *
 * @template From - Source type
 * @template K - Source property key
 * @template Out - Output array type
 *
 * @example
 * ```typescript
 * // Convert array of tag objects to strings
 * const tagsSpec: ArrayFromSpec<Post, 'tags', string[]> = {
 *   from: 'tags',
 *   array: tagToStringConverter
 * };
 *
 * // Convert array of comment objects to DTOs
 * const commentsSpec: ArrayFromSpec<Post, 'comments', CommentDto[]> = {
 *   from: 'comments',
 *   array: commentConverter
 * };
 * ```
 */
type ArrayFromSpec<From, K extends keyof From, Out> =
  From[K] extends ReadonlyArray<infer InElem>
    ? Out extends ReadonlyArray<infer OutElem>
      ? {
          /** Source property key containing array */
          from: K;

          /** Converter for array elements */
          array: DeepConverter<InElem, OutElem>;
        }
      : never
    : never;

/**
 * Union type of all possible field specifications
 *
 * This type allows you to specify how each field should be converted
 * using one of five strategies:
 * 1. Compute - Calculate value from source
 * 2. Direct - Map directly without transformation
 * 3. Map - Transform value during mapping
 * 4. Nested - Convert nested object
 * 5. Array - Convert array elements
 *
 * @template From - Source type
 * @template Out - Output value type
 *
 * @example
 * ```typescript
 * type User = {
 *   id: number;
 *   firstName: string;
 *   lastName: string;
 *   birthDate: Date;
 *   address: Address;
 *   tags: Tag[];
 * };
 *
 * type UserDto = {
 *   id: number;
 *   fullName: string;
 *   age: number;
 *   birthDate: string;
 *   address: AddressDto;
 *   tags: string[];
 * };
 *
 * const specs: Record<keyof UserDto, FieldSpec<User, any>> = {
 *   id: { from: 'id' },                                    // Direct
 *   fullName: {                                            // Compute
 *     compute: (u) => `${u.firstName} ${u.lastName}`
 *   },
 *   age: {                                                 // Compute
 *     compute: (u) => calculateAge(u.birthDate)
 *   },
 *   birthDate: {                                           // Map
 *     from: 'birthDate',
 *     map: (d) => d.toISOString()
 *   },
 *   address: {                                             // Nested
 *     from: 'address',
 *     nested: addressConverter
 *   },
 *   tags: {                                                // Array
 *     from: 'tags',
 *     array: tagConverter
 *   }
 * };
 * ```
 */
export type FieldSpec<From, Out> =
  | ComputeSpec<From, Out>
  | (keyof From extends infer K
      ? K extends keyof From
        ?
            | DirectFromSpec<From, K, Out>
            | MapFromSpec<From, K, Out>
            | NestedFromSpec<From, K, Extract<Out, object>>
            | ArrayFromSpec<From, K, Out>
        : never
      : never);

/**
 * Complete conversion specification mapping target fields to their specs
 *
 * @template From - Source type
 * @template To - Target type
 *
 * @example
 * ```typescript
 * const userSpec: ConverterSpec<User, UserDto> = {
 *   id: { from: 'id' },
 *   fullName: {
 *     compute: (user) => `${user.firstName} ${user.lastName}`
 *   },
 *   email: { from: 'emailAddress' },
 *   age: {
 *     from: 'birthDate',
 *     map: (date) => calculateAge(date)
 *   }
 * };
 * ```
 */
export type ConverterSpec<From, To> = { [P in keyof To]?: FieldSpec<From, To[P]> };

/* ============================================================================
 * CONVERTER OPTIONS
 * ========================================================================== */

/**
 * Configuration options for DeepConverter behavior
 *
 * These options control automatic property copying, cloning behavior,
 * and custom type adapters.
 *
 * @template From - Source type
 * @template To - Target type
 *
 * @example
 * ```typescript
 * // Basic auto-copy with cloning
 * const options1: DeepConverterOptions<User, UserDto> = {
 *   autoFromSameName: true,  // Copy matching property names
 *   autoClone: true          // Deep clone auto-copied values
 * };
 *
 * // Selective auto-copy with include list
 * const options2: DeepConverterOptions<User, UserDto> = {
 *   autoFromSameName: true,
 *   include: ['id', 'name', 'email']  // Only auto-copy these
 * };
 *
 * // Conditional auto-copy with custom logic
 * const options3: DeepConverterOptions<User, UserDto> = {
 *   autoFromSameName: true,
 *   autoWhen: (key, value) => {
 *     // Only auto-copy non-null primitive values
 *     return value !== null && typeof value !== 'object';
 *   }
 * };
 *
 * // With custom type adapters
 * const options4: DeepConverterOptions<User, UserDto> = {
 *   autoFromSameName: true,
 *   adapters: [
 *     {
 *       match: (v) => v instanceof Date,
 *       convert: (v) => (v as Date).toISOString()
 *     }
 *   ]
 * };
 * ```
 */
export type DeepConverterOptions<From, To> = {
  /**
   * Enable automatic copying of properties with matching names
   *
   * When true, properties that exist in both source and target with
   * compatible types are automatically copied (subject to include/exclude
   * and autoWhen filters).
   *
   * @default false
   */
  autoFromSameName?: boolean;

  /**
   * Enable deep cloning for auto-copied values
   *
   * When true, auto-copied values are deep cloned to prevent shared references.
   * When false, values are copied by reference (shallow copy).
   *
   * Note: This only affects auto-copied properties. Properties specified
   * in the conversion spec always respect their spec configuration.
   *
   * @default true
   */
  autoClone?: boolean;

  /**
   * Whitelist of properties to include in auto-copy
   *
   * When specified, ONLY these properties are considered for auto-copy
   * (still subject to exclude and autoWhen filters).
   *
   * Filter precedence (highest to lowest):
   * 1. Spec-defined properties (always processed)
   * 2. Include list (if specified, only these are candidates)
   * 3. Exclude list (removes from candidates)
   * 4. autoWhen function (final filter on remaining candidates)
   *
   * @example
   * ```typescript
   * // Only auto-copy id, name, and email
   * include: ['id', 'name', 'email']
   * ```
   */
  include?: ReadonlyArray<AutoAssignableKeys<From, To>>;

  /**
   * Blacklist of properties to exclude from auto-copy
   *
   * When specified, these properties are never auto-copied.
   *
   * Note: exclude is applied AFTER include, so if both are specified,
   * a property must pass both filters to be auto-copied.
   *
   * @example
   * ```typescript
   * // Auto-copy all compatible properties except password and token
   * exclude: ['password', 'token']
   * ```
   */
  exclude?: ReadonlyArray<AutoAssignableKeys<From, To>>;

  /**
   * Custom filter function for fine-grained auto-copy control
   *
   * This function is called for each candidate property (after include/exclude
   * filtering) to make final decision about whether to auto-copy it.
   *
   * Filter precedence (highest to lowest):
   * 1. Spec-defined properties (always processed, autoWhen not called)
   * 2. Include list (if specified, only these are candidates)
   * 3. Exclude list (removes from candidates)
   * 4. autoWhen function (final filter on remaining candidates) ← YOU ARE HERE
   *
   * Use cases:
   * - Conditional copying based on value content
   * - Runtime validation of values
   * - Complex filtering logic based on multiple factors
   *
   * @param key - Property name being considered
   * @param rawValue - Value from source property
   * @param src - Complete source object (for context)
   * @param out - Target object being built (for context)
   * @returns true to auto-copy this property, false to skip it
   *
   * @example
   * ```typescript
   * // Only auto-copy non-null primitive values
   * autoWhen: (key, value) => {
   *   return value !== null && typeof value !== 'object';
   * }
   *
   * // Only auto-copy properties with truthy values
   * autoWhen: (key, value) => !!value
   *
   * // Conditional based on source state
   * autoWhen: (key, value, src) => {
   *   if (src.isPublic) return true;
   *   return !['privateField1', 'privateField2'].includes(key);
   * }
   * ```
   */
  autoWhen?: (key: AutoAssignableKeys<From, To>, rawValue: unknown, src: Readonly<From>, out: To) => boolean;

  /**
   * Custom type adapters for special conversion logic
   *
   * Adapters are evaluated in order and the first matching adapter
   * is used. They apply to both spec-defined and auto-copied properties.
   *
   * Use adapters when:
   * - Converting between incompatible types (Date ↔ string)
   * - Applying consistent transformations across multiple fields
   * - Handling special types (BigInt, Buffer, custom classes)
   *
   * @example
   * ```typescript
   * adapters: [
   *   // Convert all Date objects to ISO strings
   *   {
   *     match: (value) => value instanceof Date,
   *     convert: (value) => (value as Date).toISOString()
   *   },
   *
   *   // Convert BigInt to string
   *   {
   *     match: (value) => typeof value === 'bigint',
   *     convert: (value) => value.toString()
   *   },
   *
   *   // Convert price fields to formatted currency
   *   {
   *     match: (value, ctx) =>
   *       typeof value === 'number' && ctx.key.includes('price'),
   *     convert: (value) => `$${(value as number).toFixed(2)}`
   *   }
   * ]
   * ```
   */
  adapters?: ReadonlyArray<TypeAdapter<From, To>>;
};

/* ============================================================================
 * DEEP CONVERTER CLASS
 * ========================================================================== */

/**
 * Main converter class for type-safe deep object conversion
 *
 * DeepConverter provides a flexible and type-safe way to convert objects from
 * one type to another, with support for:
 * - Explicit field specifications (compute, map, nested, array)
 * - Automatic property copying with filtering
 * - Custom type adapters
 * - Deep cloning with circular reference handling
 * - Nested object and array conversions
 *
 * @template From - Source object type
 * @template To - Target object type
 *
 * @example
 * ```typescript
 * // ===== Example 1: Basic Conversion =====
 * type User = {
 *   id: number;
 *   firstName: string;
 *   lastName: string;
 *   email: string;
 * };
 *
 * type UserDto = {
 *   id: number;
 *   fullName: string;
 *   email: string;
 * };
 *
 * const converter = DeepConverter.withFactory<User, UserDto>({
 *   spec: {
 *     id: { from: 'id' },
 *     fullName: {
 *       compute: (user) => `${user.firstName} ${user.lastName}`
 *     },
 *     email: { from: 'email' }
 *   }
 * });
 *
 * const user: User = {
 *   id: 1,
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com'
 * };
 *
 * const dto = converter.convert(user);
 * // Result: { id: 1, fullName: 'John Doe', email: 'john@example.com' }
 *
 * // ===== Example 2: With Auto-Copy =====
 * const autoConverter = DeepConverter.withFactory<User, UserDto>({
 *   spec: {
 *     fullName: {
 *       compute: (user) => `${user.firstName} ${user.lastName}`
 *     }
 *   },
 *   options: {
 *     autoFromSameName: true,  // Auto-copy id and email
 *     include: ['id', 'email']
 *   }
 * });
 *
 * // ===== Example 3: With Nested Objects and Arrays =====
 * type Address = { street: string; city: string };
 * type AddressDto = { fullAddress: string };
 *
 * type UserWithAddress = User & {
 *   address: Address;
 *   tags: string[];
 * };
 *
 * type UserDtoWithAddress = UserDto & {
 *   address: AddressDto;
 *   tagCount: number;
 * };
 *
 * const addressConverter = DeepConverter.withFactory<Address, AddressDto>({
 *   spec: {
 *     fullAddress: {
 *       compute: (addr) => `${addr.street}, ${addr.city}`
 *     }
 *   }
 * });
 *
 * const fullConverter = DeepConverter.withFactory<UserWithAddress, UserDtoWithAddress>({
 *   spec: {
 *     fullName: {
 *       compute: (user) => `${user.firstName} ${user.lastName}`
 *     },
 *     address: {
 *       from: 'address',
 *       nested: addressConverter
 *     },
 *     tagCount: {
 *       compute: (user) => user.tags.length
 *     }
 *   },
 *   options: {
 *     autoFromSameName: true,
 *     include: ['id', 'email']
 *   }
 * });
 *
 * // ===== Example 4: With Type Adapters =====
 * type UserWithDates = User & {
 *   createdAt: Date;
 *   updatedAt: Date;
 * };
 *
 * type UserDtoWithDates = UserDto & {
 *   createdAt: string;
 *   updatedAt: string;
 * };
 *
 * const dateConverter = DeepConverter.withFactory<UserWithDates, UserDtoWithDates>({
 *   spec: {
 *     fullName: {
 *       compute: (user) => `${user.firstName} ${user.lastName}`
 *     }
 *   },
 *   options: {
 *     autoFromSameName: true,
 *     adapters: [
 *       {
 *         match: (value) => value instanceof Date,
 *         convert: (value) => (value as Date).toISOString()
 *       }
 *     ]
 *   }
 * });
 *
 * // ===== Example 5: With Conditional Auto-Copy =====
 * const selectiveConverter = DeepConverter.withFactory<User, UserDto>({
 *   spec: {
 *     fullName: {
 *       compute: (user) => `${user.firstName} ${user.lastName}`
 *     }
 *   },
 *   options: {
 *     autoFromSameName: true,
 *     autoWhen: (key, value) => {
 *       // Only auto-copy non-empty strings and positive numbers
 *       if (typeof value === 'string') return value.length > 0;
 *       if (typeof value === 'number') return value > 0;
 *       return true;
 *     }
 *   }
 * });
 * ```
 */
export class DeepConverter<From, To> {
  private readonly create: () => To;
  private readonly spec: ConverterSpec<From, To>;
  private readonly options: DeepConverterOptions<From, To>;
  private readonly specKeySet: ReadonlySet<string>;
  private readonly includeSet?: ReadonlySet<string>;
  private readonly excludeSet?: ReadonlySet<string>;

  /**
   * Private constructor - use static factory methods instead
   *
   * @param create - Factory function to create target instance
   * @param spec - Conversion specification
   * @param options - Converter options
   */
  private constructor(create: () => To, spec: ConverterSpec<From, To>, options?: DeepConverterOptions<From, To>) {
    this.create = create;
    this.spec = spec;
    this.options = options ?? {};

    // Pre-compute spec keys for faster lookups
    this.specKeySet = new Set(Object.keys(spec));

    // Pre-compute include/exclude sets for O(1) lookups
    if (this.options.include && this.options.include.length > 0) {
      this.includeSet = new Set(this.options.include.map((k) => String(k)));
    }

    if (this.options.exclude && this.options.exclude.length > 0) {
      this.excludeSet = new Set(this.options.exclude.map((k) => String(k)));
    }
  }

  /**
   * Creates a converter using a class constructor
   *
   * Use this when your target type is a class with a no-argument constructor.
   *
   * @template From - Source type
   * @template To - Target type
   * @param ctor - Target class constructor
   * @param forOpts - Configuration options
   * @param forOpts.spec - Conversion specification
   * @param forOpts.options - Converter options
   * @returns Configured DeepConverter instance
   *
   * @example
   * ```typescript
   * class UserDto {
   *   id!: number;
   *   fullName!: string;
   *   email!: string;
   * }
   *
   * const converter = DeepConverter.for(UserDto, {
   *   spec: {
   *     id: { from: 'id' },
   *     fullName: {
   *       compute: (user) => `${user.firstName} ${user.lastName}`
   *     },
   *     email: { from: 'email' }
   *   },
   *   options: {
   *     autoFromSameName: true
   *   }
   * });
   *
   * const dto = converter.convert(user);
   * console.log(dto instanceof UserDto); // true
   * ```
   */
  static for<From, To>(
    ctor: ClassCtor<To>,
    forOpts: { spec?: ConverterSpec<From, To>; options?: DeepConverterOptions<From, To> } = {},
  ): DeepConverter<From, To> {
    return new DeepConverter<From, To>(() => new ctor(), forOpts.spec ?? {}, forOpts.options);
  }

  /**
   * Creates a converter using a factory function
   *
   * Use this when:
   * - Target type is a plain object (not a class)
   * - You need custom initialization logic
   * - You want to provide default values
   *
   * @template From - Source type
   * @template To - Target type
   * @param factoryOpts - Configuration options
   * @param factoryOpts.factory - Factory function (default: returns empty object)
   * @param factoryOpts.spec - Conversion specification
   * @param factoryOpts.options - Converter options
   * @returns Configured DeepConverter instance
   *
   * @example
   * ```typescript
   * // Plain object with defaults
   * const converter1 = DeepConverter.withFactory<User, UserDto>({
   *   factory: () => ({
   *     id: 0,
   *     fullName: '',
   *     email: '',
   *     createdAt: new Date()
   *   }),
   *   spec: {
   *     id: { from: 'id' },
   *     fullName: {
   *       compute: (user) => `${user.firstName} ${user.lastName}`
   *     },
   *     email: { from: 'email' }
   *   }
   * });
   *
   * // No factory (empty object)
   * const converter2 = DeepConverter.withFactory<User, UserDto>({
   *   spec: {
   *     id: { from: 'id' },
   *     fullName: {
   *       compute: (user) => `${user.firstName} ${user.lastName}`
   *     }
   *   },
   *   options: {
   *     autoFromSameName: true
   *   }
   * });
   * ```
   */
  static withFactory<From, To>(
    factoryOpts: { factory?: () => To; spec?: ConverterSpec<From, To>; options?: DeepConverterOptions<From, To> } = {},
  ): DeepConverter<From, To> {
    return new DeepConverter<From, To>(
      factoryOpts.factory ?? (() => ({}) as To),
      factoryOpts.spec ?? {},
      factoryOpts.options,
    );
  }

  /**
   * Converts a source object to target type
   *
   * This is the main entry point for conversion. It creates a new target
   * instance and applies all specified transformations and auto-copy rules.
   *
   * @param src - Source object to convert
   * @returns Converted target object
   *
   * @example
   * ```typescript
   * const user: User = {
   *   id: 1,
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   email: 'john@example.com'
   * };
   *
   * const dto = converter.convert(user);
   * console.log(dto);
   * // { id: 1, fullName: 'John Doe', email: 'john@example.com' }
   * ```
   */
  convert(src: Readonly<From>): To {
    const seen = new WeakMap<object, unknown>();
    return this.convertInternal(src, seen);
  }

  /**
   * Internal conversion with circular reference tracking
   *
   * @private
   * @param src - Source object
   * @param seen - Circular reference tracker
   * @returns Converted object
   */
  private convertInternal(src: Readonly<From>, seen: WeakMap<object, unknown>): To {
    // Handle objects (including arrays, Date, Map, Set, etc.)
    if (src !== null && typeof src === 'object') {
      const obj = src as unknown as object;

      // Check for circular references
      if (seen.has(obj)) {
        return seen.get(obj) as To;
      }

      // Create target instance early to handle circular references
      const out = this.create();
      seen.set(obj, out);

      // Apply conversions: spec first, then auto-copy
      this.applySpec(src, out, seen);
      this.applyAutoSameName(src, out);

      return out;
    }

    // Handle primitive values (unlikely case for objects, but safe)
    const out = this.create();
    this.applySpec(src, out, seen);
    this.applyAutoSameName(src, out);
    return out;
  }

  /**
   * Applies adapter or clones value based on mode
   *
   * IMPROVED: Simplified mode handling with explicit logic for each case
   *
   * Behavior by mode:
   * - 'spec': Always try adapters first, then deep clone
   * - 'auto': Try adapters first, then respect autoClone option
   *
   * @private
   * @param mode - Conversion mode
   * @param key - Property name
   * @param raw - Raw value to process
   * @param src - Source object
   * @param out - Target object
   * @returns Processed value
   */
  private adaptOrClone(mode: 'spec' | 'auto', key: string, raw: unknown, src: Readonly<From>, out: To): unknown {
    const targetSample = getTargetSample(out, key);

    // Try adapters first (applies to both modes)
    const { adapted, value } = applyAdapters(this.options.adapters, raw, { key, src, out, targetSample, mode });

    if (adapted) {
      return value;
    }

    // No adapter matched - handle based on mode
    if (mode === 'spec') {
      // Spec-defined properties: always deep clone for safety
      return DeepClone.clone(raw);
    } else {
      // Auto-copied properties: respect autoClone option
      // Default is true (deep clone), but can be disabled for performance
      const shouldClone = this.options.autoClone !== false;
      return shouldClone ? DeepClone.clone(raw) : raw;
    }
  }

  /**
   * Applies conversion specification to target object
   *
   * Processes all fields defined in the spec using their respective
   * conversion strategies (compute, direct, map, nested, array).
   *
   * @private
   * @param src - Source object
   * @param out - Target object being built
   * @param seen - Circular reference tracker
   */
  private applySpec(src: Readonly<From>, out: To, seen: WeakMap<object, unknown>): void {
    const specRecord = this.spec as ReadonlyRecord;

    for (const key of Object.keys(specRecord)) {
      // Skip inherited properties
      if (!hasOwn(specRecord as object, key)) continue;

      const fieldSpec = specRecord[key];

      // Strategy 1: ComputeSpec - compute value from source
      if (this.isComputeSpec<From, unknown>(fieldSpec)) {
        const value = fieldSpec.compute(src);
        setProp(out, key as keyof To, value as To[keyof To]);
        continue;
      }

      // All other strategies require 'from' property
      if (!this.isFromSpec(fieldSpec)) continue;

      const fromKey = fieldSpec.from;
      const raw = getProp(src as unknown as From & object, fromKey) as unknown;

      // Strategy 2: ArrayFromSpec - convert array elements
      if (this.isArraySpec(fieldSpec)) {
        const arr = raw as ReadonlyArray<unknown>;
        const mapped: unknown[] = new Array(arr.length);

        for (let i = 0; i < arr.length; i++) {
          mapped[i] = fieldSpec.array.convertInternal(arr[i] as never, seen);
        }

        setProp(out, key as keyof To, mapped as unknown as To[keyof To]);
        continue;
      }

      // Strategy 3: NestedFromSpec - convert nested object
      if (this.isNestedSpec(fieldSpec)) {
        const value = fieldSpec.nested.convertInternal(raw as never, seen);
        setProp(out, key as keyof To, value as To[keyof To]);
        continue;
      }

      // Strategy 4: MapFromSpec - transform with map function
      if (this.isMapSpec<From, unknown>(fieldSpec)) {
        const value = fieldSpec.map(raw as never, src);
        setProp(out, key as keyof To, value as To[keyof To]);
        continue;
      }

      // Strategy 5: DirectFromSpec - direct mapping with adapter/clone
      const value = this.adaptOrClone('spec', key, raw, src, out);
      setProp(out, key as keyof To, value as To[keyof To]);
    }
  }

  /**
   * Applies automatic same-name property copying
   *
   * IMPROVED: Optimized with early filtering and clear precedence
   *
   * Filter precedence (highest to lowest):
   * 1. Skip if already in spec
   * 2. Skip if not own property of source
   * 3. Apply to include filter (if specified)
   * 4. Apply to exclude filter (if specified)
   * 5. Apply autoWhen filter (if specified)
   *
   * @private
   * @param src - Source object
   * @param out - Target object being built
   */
  private applyAutoSameName(src: Readonly<From>, out: To): void {
    // Early exit if auto-copy is disabled
    if (!this.options.autoFromSameName) return;

    // Only process if source is an object
    if (src === null || typeof src !== 'object') return;

    const srcRecord = src as unknown as ReadonlyRecord;

    // Optimize: Only check source keys since we're copying from source
    for (const key of Object.keys(srcRecord)) {
      // Filter 1: Skip spec-defined properties (highest precedence)
      if (this.specKeySet.has(key)) continue;

      // Filter 2: Skip non-own properties
      if (!hasOwn(srcRecord as unknown as object, key)) continue;

      // Filter 3: Include list (whitelist)
      if (this.includeSet && !this.includeSet.has(key)) continue;

      // Filter 4: Exclude list (blacklist)
      if (this.excludeSet?.has(key)) continue;

      const raw = srcRecord[key];

      // Filter 5: Custom autoWhen predicate (lowest precedence)
      if (this.options.autoWhen) {
        const allow = this.options.autoWhen(key as AutoAssignableKeys<From, To>, raw, src, out);
        if (!allow) continue;
      }

      // All filters passed - apply conversion
      (out as Record<string, unknown>)[key] = this.adaptOrClone('auto', key, raw, src, out);
    }
  }

  /* ==========================================================================
   * TYPE GUARDS
   * ======================================================================== */

  /**
   * Type guard for ComputeSpec
   * @private
   */
  private isComputeSpec<F, O>(x: unknown): x is ComputeSpec<F, O> {
    if (x === null || typeof x !== 'object') return false;
    return hasOwn(x, 'compute') && typeof (x as ReadonlyRecord)['compute'] === 'function';
  }

  /**
   * Type guard for specs with 'from' property
   * @private
   */
  private isFromSpec(x: unknown): x is { from: keyof From } {
    if (x === null || typeof x !== 'object') return false;
    return hasOwn(x, 'from');
  }

  /**
   * Type guard for MapFromSpec
   * @private
   */
  private isMapSpec<F, O>(x: unknown): x is MapFromSpec<F, keyof F, O> {
    if (x === null || typeof x !== 'object') return false;
    return hasOwn(x, 'map') && typeof (x as ReadonlyRecord)['map'] === 'function';
  }

  /**
   * Type guard for NestedFromSpec
   * @private
   */
  private isNestedSpec(x: unknown): x is NestedFromSpec<From, keyof From, object> {
    if (x === null || typeof x !== 'object') return false;
    return hasOwn(x, 'nested') && typeof (x as ReadonlyRecord)['nested'] === 'object';
  }

  /**
   * Type guard for ArrayFromSpec
   * @private
   */
  private isArraySpec(x: unknown): x is { from: keyof From; array: DeepConverter<unknown, object> } {
    if (x === null || typeof x !== 'object') return false;
    return hasOwn(x, 'array') && typeof (x as ReadonlyRecord)['array'] === 'object';
  }
}
