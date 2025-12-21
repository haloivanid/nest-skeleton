import { config } from 'dotenv';
import { IEnvCofigs, TEnvMode } from './env.types';
import { isStringTruthy } from '@libs/utils';

const DEFAULT_PORT = 3000 as const;

/**
 * High-performance environment variable configuration manager.
 *
 * Optimized for memory efficiency and fast access with lazy initialization.
 * Uses direct reference to process.env instead of cloning for better performance.
 *
 * @example
 * ```typescript
 * // Initialize (optional, auto-initializes on first access)
 * EnvConfig.init();
 *
 * // Get required env variable
 * const apiKey = EnvConfig.get('API_KEY');
 *
 * // Get with default value
 * const port = EnvConfig.getOrDefault('PORT', 3000);
 *
 * // Access known/validated configs
 * const { DEBUG, MODE, SERVER_PORT } = EnvConfig.known;
 * ```
 */
export class EnvConfig {
  private static _env: Record<string, string> | null = null;
  private static _known: IEnvCofigs | null = null;

  private constructor() {}

  public static init(): void {
    if (this._env === null) {
      config({ quiet: true });
      this._env = process.env as Record<string, string>;
    }
  }

  /**
   * Retrieves an environment variable value.
   *
   * @param key - The environment variable name
   * @param throwAble - If true, throws error when key is not found (default: true)
   * @returns The environment variable value, or null if not found and throwAble is false
   *
   * @throws {Error} When key is not found and throwAble is true
   *
   * @example
   * ```typescript
   * // Throws error if API_KEY not found
   * const apiKey = EnvConfig.get('API_KEY');
   *
   * // Returns null if OPTIONAL_KEY not found
   * const optional = EnvConfig.get('OPTIONAL_KEY', false);
   * ```
   */
  public static get(key: string, throwAble = true): string | null {
    const env = this._env ?? (this._env = process.env as Record<string, string>);
    const value = env[key];

    if (value == undefined && throwAble) {
      throw new Error(`unknown ${key} in NodeJS.ProcessENv`);
    }

    return value ?? null;
  }

  /**
   * Retrieves an environment variable with type-safe default value.
   *
   * Automatically converts the value to match the type of the default value:
   * - String: Returns value as-is or default
   * - Number: Parses using fast unary + operator
   * - Boolean: Converts using isTruthy utility
   *
   * @template T - The type of the default value (string | number | boolean)
   * @param key - The environment variable name
   * @param defaultValue - The default value to return if key is not found
   * @returns The environment variable value converted to type T, or defaultValue
   *
   * @example
   * ```typescript
   * // String (most common, optimized fast path)
   * const host = EnvConfig.getOrDefault('HOST', 'localhost');
   *
   * // Number (uses fast unary + parsing)
   * const port = EnvConfig.getOrDefault('PORT', 3000);
   *
   * // Boolean (uses isTruthy conversion)
   * const debug = EnvConfig.getOrDefault('DEBUG', false);
   * ```
   */
  public static getOrDefault<T>(key: string, defaultValue: T): T {
    const env = this._env ?? (this._env = process.env as Record<string, string>);
    const value = env[key];

    if (!value) return defaultValue;

    if (typeof defaultValue === 'string') {
      return (value || defaultValue) as T;
    }

    if (typeof defaultValue === 'number') {
      const num = +value;
      return (num === num ? num : defaultValue) as T; // NaN check: NaN !== NaN
    }

    if (typeof defaultValue === 'boolean') {
      return isStringTruthy(value) as T;
    }

    return (value || defaultValue) as T;
  }

  /**
   * Gets pre-validated and cached common environment configurations.
   *
   * This getter lazily builds and caches the configuration object on first access.
   * Subsequent calls return the cached object for optimal performance.
   *
   * @returns {IEnvCofigs} Validated configuration object containing:
   * - DEBUG: boolean - Debug mode flag
   * - MODE: TEnvMode - Environment mode (LOC/DEV/PRD)
   * - SERVER_PORT: number - Server port number
   *
   * @example
   * ```typescript
   * const { DEBUG, MODE, SERVER_PORT } = EnvConfig.known;
   *
   * if (DEBUG) {
   *   console.log(`Server starting on port ${SERVER_PORT} in ${MODE} mode`);
   * }
   * ```
   */
  public static get known(): IEnvCofigs {
    return this._known ?? (this._known = this.buildKnownEnv());
  }

  /**
   * Builds the known environment configuration object.
   *
   * @private
   * @returns {IEnvCofigs} Validated configuration object
   *
   * @remarks
   * - Inlines mode determination to avoid extra function calls
   * - Uses fast unary + for number parsing
   * - Direct env access for optimal performance
   */
  private static buildKnownEnv(): IEnvCofigs {
    const env = this._env ?? (this._env = process.env as Record<string, string>);
    const mode = env.MODE ?? 'local';

    let envMode: TEnvMode;
    if (mode === 'dev' || mode === 'development') {
      envMode = TEnvMode.DEV;
    } else if (mode === 'prod' || mode === 'production') {
      envMode = TEnvMode.PRD;
    } else {
      envMode = TEnvMode.LOC;
    }

    return { DEBUG: isStringTruthy(env.DEBUG ?? 'false'), MODE: envMode, SERVER_PORT: +(env.PORT ?? DEFAULT_PORT) };
  }

  /**
   * Resets all cached environment data.
   *
   * Useful for testing scenarios where environment needs to be reconfigured.
   * Forces re-initialization on next access.
   *
   * @example
   * ```typescript
   * // In tests
   * beforeEach(() => {
   *   process.env.TEST_VAR = 'new-value';
   *   EnvConfig.reset(); // Clear cache to pick up new values
   * });
   * ```
   *
   * @remarks
   * - Clears both _env and _known caches
   * - Next access will trigger re-initialization
   * - Primarily intended for testing environments
   */
  public static reset(): void {
    this._env = null;
    this._known = null;
  }
}
