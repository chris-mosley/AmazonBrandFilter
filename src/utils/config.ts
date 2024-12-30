import { StorageSettings, SyncStorageSettings } from "utils/types";

export const latestReleaseUrl: string =
  "https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest";
export const brandsUrl: string = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";

// don't copy brandsMap for sync storage
export const defaultSyncStorageValue: SyncStorageSettings = {
  isFirstRun: false,
  deptMap: {},
  enabled: true,
  knownDepts: {},
  deptCount: 0,
  filterRefiner: false,
  refinerMode: "grey",
  refinerBypass: false,
  usePersonalBlock: false,
  useDebugMode: false,
  personalBlockMap: {},
  lastMapRun: null,
};

export const defaultLocalStorageValue: StorageSettings = {
  ...defaultSyncStorageValue,
  currentDepts: { Unknown: true },
  brandsMap: {},
  brandsVersion: 0,
  brandsCount: 0,
  maxWordCount: 0,
};
