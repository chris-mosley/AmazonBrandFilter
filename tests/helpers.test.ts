import { describe, expect, test } from "@jest/globals";

import { defaultLocalStorageValue, defaultSyncStorageValue } from "utils/config";
import { extractSyncStorageSettingsObject } from "utils/helpers";

describe("extractSyncStorageSettingsObject", () => {
  test("object with local keys should be returned with sync keys only", () => {
    const sampleLocalValue = defaultLocalStorageValue;
    const sampleSyncValue = extractSyncStorageSettingsObject(sampleLocalValue);
    expect(sampleSyncValue).toMatchObject(defaultSyncStorageValue);
  });
});
