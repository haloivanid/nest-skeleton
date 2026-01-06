declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    DEBUG?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
    DEFAULT_USER_PASSWORD?: string;
    SERVER_PORT?: string;
    JWT_SECRET: string;
    SALT_ROUND: string;
    PII_SECRET: string;
    PII_ACTIVE: string;
    HMAC_SECRET: string;
    MASTER_KEY: string;
    DERIVE_KEY: string;
  }
}
