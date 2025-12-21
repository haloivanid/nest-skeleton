export enum TEnvMode {
  DEV = 'dev',
  PRD = 'production',
  LOC = 'local',
}

export interface IEnvCofigs {
  SERVER_PORT: number;
  DEBUG: boolean;
  MODE: TEnvMode;
}
