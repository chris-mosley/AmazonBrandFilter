export type Engine = "gecko" | "chromium";
export type GuiLocation = "popup" | "dashboard";
export type StorageArea = "local" | "sync";
export type StorageMode = "normal" | "overwrite";

export interface StorageSettings {
  isFirstRun: boolean;
  brandsVersion: number | null;
  brandsCount: number | null;
  brandsMap: Record<string, boolean>;
  searchDepth: number;
  seenBrands: Record<string, SeenBrand>;
  seenBrandCount: number | null;
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
  filterWithRefiner: boolean;
  showKnownBrands: boolean;
  showSeenBrands: boolean;
}

export type SeenBrand = {
  hide: boolean;
};

export type SyncStorageSettings = Omit<
  StorageSettings,
  "brandsMap" | "brandsCount" | "brandsVersion" | "currentDepts" | "maxWordCount"
>;

export type PopupMessageType = keyof StorageSettings;

export interface PopupMessage {
  type: PopupMessageType;
  isChecked: boolean;
}
