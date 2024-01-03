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
  usePersonalBlock: boolean;
  personalBlockMap: Record<string, boolean>;
  useDebugMode: boolean;
  lastMapRun: number;
  maxWordCount: number;
}

export type PopupMessageType = keyof StorageSettings;

export interface PopupMessage {
  type: PopupMessageType;
  isChecked: boolean;
}
