import
  OBR
from "@owlbear-rodeo/sdk";

import {
  getPluginId,
} from "../getPluginId";

import {
  SettingMetadataId,
  SETTINGS_BAR_AT_TOP_METADATA_ID,
  SETTINGS_OFFSET_METADATA_ID,
  SETTINGS_COMPANIONS_SEGMENTS_METADATA_ID,
  SETTINGS_STRANGERS_SEGMENTS_METADATA_ID,
  SETTINGS_NAME_TAGS_METADATA_ID,
} from "./settingMetadataIds";

import {
  readBooleanFromObject,
  readNumberFromObject,
} from "./metadataHelpers";

export type SettingsSaveLocation = "ROOM" | "SCENE";

export async function updateSettingMetadata(
  key: SettingMetadataId,
  value: number | boolean | undefined,
  saveLocation: SettingsSaveLocation,
) {
  // get saved metadata
  let retrievedMetadata;
  if (saveLocation === "SCENE")
    retrievedMetadata = await OBR.scene.getMetadata();
  else retrievedMetadata = await OBR.room.getMetadata();

  const retrievedExtensionMetadata = retrievedMetadata[
    getPluginId("metadata")
  ] as Object | undefined;

  // combine metadata
  let combinedMetadata: { [key: string]: unknown } = {
    ...retrievedExtensionMetadata,
    ...{ [key]: value },
  };

  // Remove keys that hold undefined values
  for (const key of Object.keys(combinedMetadata)) {
    if (combinedMetadata[key] === undefined) delete combinedMetadata[key];
  }

  const settingsObject = { [getPluginId("metadata")]: combinedMetadata };

  //write metadata to save location
  if (saveLocation === "SCENE") OBR.scene.setMetadata(settingsObject);
  else OBR.room.setMetadata(settingsObject);
}

export type Settings = {
  [index: string]: number | boolean | undefined;
  verticalOffset: number;
  barAtTop: boolean;
  companionsSegments: number;
  strangersSegments: number;
  nameTags: boolean;
};

export function parseSettings(metadata: unknown): Settings {
  return {
    verticalOffset: readNumberFromObject(metadata, SETTINGS_OFFSET_METADATA_ID),
    barAtTop: readBooleanFromObject(metadata, SETTINGS_BAR_AT_TOP_METADATA_ID),
    companionsSegments: readNumberFromObject(metadata, SETTINGS_COMPANIONS_SEGMENTS_METADATA_ID),
    strangersSegments: readNumberFromObject(metadata, SETTINGS_STRANGERS_SEGMENTS_METADATA_ID),
    nameTags: readBooleanFromObject(metadata, SETTINGS_NAME_TAGS_METADATA_ID),
  };
}