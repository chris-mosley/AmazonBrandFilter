export type Engine = "gecko" | "chromium";

export type StorageApiProps = "local" | "sync";
export interface StorageSettings {
  abfFirstRun: boolean;
  brandsCount: number;
  brandsMap: { [key: string]: boolean };
  brandsVersion: number;
  enabled: boolean;
  filterRefiner: boolean;
  lastMapRun: number;
  maxWordCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalBlockMap: any; // TODO: fix this
  refinerBypass: boolean;
  refinerMode: string;
  usePersonalBlock: boolean;
  useDebugMode: boolean;
}
