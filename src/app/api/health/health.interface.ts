/**
 * Health response interface
 */
export interface Health {
  ping: string;
  start: Date;
  uptime: number;
  uptime_formatted: string;
}
