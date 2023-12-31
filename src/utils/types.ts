export type Engine = "gecko" | "chromium";

export type StorageApiProps = "local" | "sync";

export interface StorageSettings {
  abfFirstRun: boolean;
  brandsMap: { [key: string]: boolean };
  brandsCount: number | null;
  brandsVersion: number | null;
  enabled: boolean;
  filterRefiner: boolean;
  refinerMode: "grey" | "hide";
  refinerBypass: boolean;
  lastMapRun: number;
  maxWordCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalBlockMap: any; // TODO: should not be any
  usePersonalBlock: boolean;
  useDebugMode: boolean;
}

export type PopupMessageType = keyof StorageSettings;

export interface PopupMessage {
  type: PopupMessageType;
  isChecked: boolean;
}
