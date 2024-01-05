import { StorageSettings } from "utils/types";

// eslint-disable-next-line max-len
export const latestReleaseUrl: string =
  "https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest";

// don't copy brandsMap for sync storage
export const defaultSyncStorageValue: Omit<StorageSettings, "brandsMap"> = {
  isFirstRun: false,
  brandsVersion: 0,
  brandsCount: 0,
  enabled: true,
  filterRefiner: false,
  refinerMode: "grey",
  refinerBypass: false,
  usePersonalBlock: false,
  useDebugMode: false,
  personalBlockMap: {},
  lastMapRun: null,
  maxWordCount: 0,
};

export const defaultLocalStorageValue: StorageSettings = {
  ...defaultSyncStorageValue,
  brandsMap: {},
};
