/**
 * Health response interface
 */
export interface IHealth {
  ping: string;
  start: Date;
  uptime: number;
  uptime_formatted: string;
}
