import type { Chart } from "./chart-types.ts";
export type Phase =
  | "idle"
  | "center"
  | "expand"
  | "directions"
  | "resonance"
  | "complete"
  | "interactive";
export interface Options {
  reducedMotion?: boolean;
  onPalaceSelect?: (palaceId: number) => void;
  onPhaseChange?: (phase: Phase) => void;
}
export interface PlayResult {
  status: "completed" | "skipped" | "reduced-motion" | "cancelled";
  chartId: string;
  elapsedMs: number;
}
export interface Scene {
  setChart(chart: Readonly<Chart>): void;
  play(
    chart: Readonly<Chart>,
    options?: { signal?: AbortSignal },
  ): Promise<PlayResult>;
  skip(): void;
  selectPalace(palaceId: number | null): void;
  setReducedMotion(reducedMotion: boolean): void;
  destroy(): void;
}
export type MountQimenFormation = (
  host: HTMLElement,
  options?: Options,
) => Scene;
export const SECTOR_ORDER = [9, 2, 7, 6, 1, 8, 3, 4] as const;
// On-screen angles: 0 right, 90 down, -90 up. South up, east left.
export const SECTOR_ANGLES = [-90, -45, 0, 45, 90, 135, 180, 225] as const;
export const TIMELINE = {
  durationMs: 6000,
  expandMs: 600,
  directionsMs: 1400,
  directionIntervalMs: 420,
  resonanceMs: 4800,
  completeMs: 5100,
  departureMs: 5800,
} as const;
