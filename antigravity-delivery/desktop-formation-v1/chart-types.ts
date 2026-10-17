export type PalaceMap = Record<string, string | null>;
export interface ChartInput {
  dateTime: string;
  timeZone: "Asia/Taipei";
  conventionVersion?: string;
}
export interface CalendarFacts {
  pillars: { year: string; month: string; day: string; hour: string };
  solarTerm: string;
  yuan: string;
  dun: "yang" | "yin";
  ju: number;
  fuTou: string;
}
export interface ChartFacts extends CalendarFacts {
  earth: PalaceMap;
  heaven: PalaceMap;
  stars: PalaceMap;
  doors: PalaceMap;
  gods: PalaceMap;
  hostedEarth: Record<string, string[]>;
  hostedHeaven: Record<string, string[]>;
  duty: {
    star: string;
    starPalace: number;
    door: string;
    doorPalace: number;
    rawOrigin: number;
    rawStarDestination: number;
    rawDoorDestination: number;
  };
  xunShou: string;
  hiddenStem: string;
}
export interface Palace {
  id: number;
  name: string;
  direction: string;
  element: string;
  earth: string;
  heaven: string | null;
  star: string | null;
  door: string | null;
  god: string | null;
  hostedEarth: string[];
  hostedHeaven: string[];
}
export interface Chart {
  schemaVersion: "chart-v1";
  id: string;
  input: ChartInput;
  conventionVersion: string;
  facts: ChartFacts;
  palaces: Palace[];
  calendarSource: {
    model: string;
    tableVersion: string;
    termUTC: string;
    modelDifferenceSecondsTT: number;
    authorityScope: string;
  };
  verification: {
    engineering: "E2_METHOD_CROSS_CHECK";
    e3Count: 0;
    independentPersonnelReview: false;
    historicalP0: "BLOCKED";
  };
  warnings: string[];
}
export type CalculationResult =
  | { status: "ok"; chart: Chart }
  | {
      status: "uncertain";
      code: "SOLAR_TERM_UNCERTAIN";
      message: string;
      intervals: { term: string; from: string; to: string }[];
    }
  | { status: "invalid"; code: string; message: string };
