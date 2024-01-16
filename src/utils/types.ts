export type Engine = "gecko" | "chromium";

export type StorageArea = "local" | "sync";
export type StorageMode = "normal" | "overwrite";

export interface StorageSettings {
  isFirstRun: boolean;
  brandsVersion: number | null;
  brandsCount: number | null;
  brandsMap: Record<string, boolean>;
  maxWordCount: number;
  enabled: boolean;
  filterRefiner: boolean;
  refinerMode: "grey" | "hide";
  refinerBypass: boolean;
  usePersonalBlock: boolean;
  personalBlockMap: Record<string, boolean>;
  useDebugMode: boolean;
  lastMapRun: number | null;
}

export type SyncStorageSettings = Omit<StorageSettings, "brandsMap" | "brandsCount" | "brandsVersion" | "maxWordCount">;

export interface PopupMessage {
  type: keyof StorageSettings;
  isChecked: boolean;
}

export interface BackgroundMessage {
  type: "storageChanged";
  area: StorageArea;
}
