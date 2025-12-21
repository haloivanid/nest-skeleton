export class GetEnvUtils {
  static get<T = string>(key: string): T | undefined {
    return process.env[key] as unknown as T;
  }

  static getOrDefault<T = string>(key: string, defaultValue: T): T {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value as unknown as T;
  }

  // Optional: Add type-safe getters for common types
  static getNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  static getBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
  }
}
