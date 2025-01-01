export type Engine = "gecko" | "chromium";
export type GuiLocation = "popup" | "dashboard";
export type StorageArea = "local" | "sync";
export type StorageMode = "normal" | "overwrite";

export interface StorageSettings {
  isFirstRun: boolean;
  brandsVersion: number | null;
  brandsCount: number | null;
  brandsMap: Record<string, boolean>;
  deptMap: Record<string, boolean>;
  currentDepts: Record<string, boolean>;
  knownDepts: Record<string, boolean>;
  deptCount: number | null;
  showAllDepts: boolean;
  deptFilter: boolean;
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

export type SyncStorageSettings = Omit<
  StorageSettings,
  "brandsMap" | "brandsCount" | "brandsVersion" | "currentDepts" | "maxWordCount"
>;

export type PopupMessageType = keyof StorageSettings;

export interface PopupMessage {
  type: PopupMessageType;
  isChecked: boolean;
}
