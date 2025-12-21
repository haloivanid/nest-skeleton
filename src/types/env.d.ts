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
    PASSWORD_SALT?: string;
    SERVER_PORT?: string;
  }
}
