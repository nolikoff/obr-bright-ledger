import 
  OBR, { 
  Metadata,
} from "@owlbear-rodeo/sdk";

import { 
  getPluginId,
} from "@/getPluginId";

import {
  SCENE_DICE_ROLLS_METADATA_ID,
  SCENE_STATS_VISIBILITY_METADATA_ID,
  SCENE_SHOW_ITEMS_METADATA_ID,
} from "@/metadataHelpers/sceneMetadataIds";

import {
  safeObjectRead,
} from "@/metadataHelpers/metadataHelpers";

import {
  StampedDiceRoll,
} from "@/action/types";


// DICE ROLLS

export async function setSceneRolls(rolls: StampedDiceRoll[]) {

  const retrievedMetadata = await OBR.scene.getMetadata();

  const retrievedExtensionMetadata = retrievedMetadata[
    getPluginId("metadata")
  ] as Object | undefined;
  
  let combinedMetadata: { [key: string]: unknown } = {
    ...retrievedExtensionMetadata,
    ...{ [SCENE_DICE_ROLLS_METADATA_ID]: rolls },
  };

  for (const key of Object.keys(combinedMetadata)) {
    if (combinedMetadata[key] === undefined) delete combinedMetadata[key];
  }
  
  const settingsObject = { [getPluginId("metadata")]: combinedMetadata };
  
  OBR.scene.setMetadata(settingsObject);
}

export async function getRollsFromScene(sceneMetadata?: Metadata) : Promise<StampedDiceRoll[]> {
  if (sceneMetadata === undefined)
    sceneMetadata = await OBR.scene.getMetadata();

  const sceneExtensionMetadata = sceneMetadata[getPluginId("metadata")];
  const diceRolls = safeObjectRead(sceneExtensionMetadata, SCENE_DICE_ROLLS_METADATA_ID);

  if (diceRolls === undefined) return [];
  return isDiceRollArray(diceRolls) ? diceRolls : [];
}

function isDiceRollArray(rolls: unknown): rolls is StampedDiceRoll[] {
  if (!Array.isArray(rolls)) 
    return false;

  for (const roll of rolls) {
    if (typeof roll?.timeStamp !== "number")
      return false;
    if (typeof roll?.total !== "number")
      return false;
    if (typeof roll?.roll !== "string")
      return false;
    if (typeof roll?.playerName !== "string")
      return false;
    if (typeof roll?.playerId !== "string")
      return false;
    if (typeof roll?.playerColor !== "string")
      return false;
    if (typeof roll?.playerRole !== "string")
      return false;
    if (typeof roll?.visibility !== "string") 
      return false;
  }
  
  return true;
}

// STATS VISIBILITY

export async function setSceneStatsVisibility(statsVisibility: "BATTLE" | "EXPLORE") {
  const retrievedMetadata = await OBR.scene.getMetadata();

  const retrievedExtensionMetadata = retrievedMetadata[
    getPluginId("metadata")
  ] as Object | undefined;
  
  let combinedMetadata: { [key: string]: unknown } = {
    ...retrievedExtensionMetadata,
    ...{ [SCENE_STATS_VISIBILITY_METADATA_ID]: statsVisibility },
  };

  for (const key of Object.keys(combinedMetadata)) {
    if (combinedMetadata[key] === undefined) delete combinedMetadata[key];
  }
  
  const settingsObject = { [getPluginId("metadata")]: combinedMetadata };
  
  await OBR.scene.setMetadata(settingsObject);
}

export async function getStatsVisibilityFromScene(sceneMetadata?: Metadata) : Promise<"BATTLE" | "EXPLORE"> {
  if (sceneMetadata === undefined)
    sceneMetadata = await OBR.scene.getMetadata();

  const sceneExtensionMetadata = sceneMetadata[getPluginId("metadata")];
  const statsVisibility = safeObjectRead(sceneExtensionMetadata, SCENE_STATS_VISIBILITY_METADATA_ID);

  if (statsVisibility === undefined) return "EXPLORE";
  return isStatsVisibilityGood(statsVisibility) ? statsVisibility : "EXPLORE";
}

function isStatsVisibilityGood(statsVisibility: unknown): statsVisibility is "BATTLE" | "EXPLORE" {
  return typeof statsVisibility === "string" && ["BATTLE", "EXPLORE"].includes(statsVisibility);
}

// SHOW ITEMS

export async function setSceneShowItems(showItems: "ALL" | "SELECTED" | "ADDED") {
  const retrievedMetadata = await OBR.scene.getMetadata();

  const retrievedExtensionMetadata = retrievedMetadata[
    getPluginId("metadata")
  ] as Object | undefined;
  
  let combinedMetadata: { [key: string]: unknown } = {
    ...retrievedExtensionMetadata,
    ...{ [SCENE_SHOW_ITEMS_METADATA_ID]: showItems },
  };

  for (const key of Object.keys(combinedMetadata)) {
    if (combinedMetadata[key] === undefined) delete combinedMetadata[key];
  }
  
  const settingsObject = { [getPluginId("metadata")]: combinedMetadata };
  
  await OBR.scene.setMetadata(settingsObject);
}

export async function getShowItemsFromScene(sceneMetadata?: Metadata) : Promise<"ALL" | "SELECTED" | "ADDED"> {
  if (sceneMetadata === undefined)
    sceneMetadata = await OBR.scene.getMetadata();

  const sceneExtensionMetadata = sceneMetadata[getPluginId("metadata")];
  const showItems = safeObjectRead(sceneExtensionMetadata, SCENE_SHOW_ITEMS_METADATA_ID);

  if (showItems === undefined) return "ALL";
  return isShowItemsGood(showItems) ? showItems : "ALL";
}

function isShowItemsGood(showItems: unknown): showItems is "ALL" | "SELECTED" | "ADDED" {
  return typeof showItems === "string" && ["ALL", "SELECTED", "ADDED"].includes(showItems);
}