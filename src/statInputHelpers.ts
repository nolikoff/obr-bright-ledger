import
  OBR
from "@owlbear-rodeo/sdk";

import {
  getPluginId 
} from "./getPluginId";

import {
  ItemMetadataID,
  ITEM_HEALTH_METADATA_ID,
  ITEM_MAX_HEALTH_METADATA_ID,
  ITEM_TEMP_HEALTH_METADATA_ID,
  ITEM_ARMOR_CLASS_METADATA_ID,
  ITEM_HEALTH_VISIBILITY_METADATA_ID,
  ITEM_GROUP_METADATA_ID,
  ITEM_INDEX_METADATA_ID,
  ITEM_ADDED_METADATA_ID,
  ITEM_SHOW_ITEMS_METADATA_ID,
} from "./metadataHelpers/itemMetadataIds";

export type ItemMetadataName =
  | "HEALTH"
  | "MAX-HEALTH"
  | "TEMP-HEALTH"
  | "ARMOR-CLASS"
  | "HEALTH-VISIBILITY"
  | "GROUP"
  | "INDEX"
  | "ADDED"
  | "SHOW-ITEMS";

const itemMetadataNames: ItemMetadataName[] = [
  "HEALTH",
  "MAX-HEALTH",
  "TEMP-HEALTH",
  "ARMOR-CLASS",
  "HEALTH-VISIBILITY",
  "GROUP",
  "INDEX",
  "ADDED",
  "SHOW-ITEMS",
];

export function isItemMetadataName(id: string): id is ItemMetadataName {
  return itemMetadataNames.includes(id as ItemMetadataName);
}

export async function writeTokenValueToItem(
  itemId: string,
  metadataName: ItemMetadataName,
  value: 
    | number
    | boolean
    | "HIDDEN" | "BAR" | "BAR-VALUE"
    | "COMPANIONS" | "STRANGERS"
    | "ALL" | "SELECTED" | "ADDED",
) {
  const id = convertItemMetadataNameToMetadataId(metadataName);

  await OBR.scene.items.updateItems([itemId], (items) => {
    // Throw error if more than one token selected
    if (items.length > 1) {
      throw "Selection exceeded max length, expected 1, got: " + items.length;
    }
    
    // Modify item
    for (let item of items) {
      const itemMetadata = item.metadata[getPluginId("metadata")];
      item.metadata[getPluginId("metadata")] = {
        ...(typeof itemMetadata === "object" ? itemMetadata : {}),
        ...{ [id]: value },
      };
    }
  });
}

export function getNewStatValue(
  metadataName: ItemMetadataName,
  inputContent: string,
  previousValue: number,
): number {
  return restrictValueRange(
    convertItemMetadataNameToMetadataId(metadataName),
    inlineMath(inputContent, previousValue),
  );
}

function inlineMath(inputContent: string, previousValue: number): number {
  const newValue = parseFloat(inputContent);

  if (Number.isNaN(newValue)) return 0;
  if (inputContent.startsWith("+") || inputContent.startsWith("-")) {
    return Math.trunc(previousValue + Math.trunc(newValue));
  }

  return newValue;
}

function restrictValueRange(metadataID: ItemMetadataID, value: number): number {
  switch (metadataID) {
    case ITEM_HEALTH_METADATA_ID:
    case ITEM_MAX_HEALTH_METADATA_ID:
      if (value > 9999) {
        value = 9999;
      } else if (value < 0) {
        value = 0;
      }
      break;
    case ITEM_TEMP_HEALTH_METADATA_ID:
    case ITEM_ARMOR_CLASS_METADATA_ID:
      if (value > 999) {
        value = 999;
      } else if (value < 0) {
        value = 0;
      }
      break;
    default:
      break;
  }
  return value;
}

function convertItemMetadataNameToMetadataId(metadataName: ItemMetadataName): ItemMetadataID {
  switch (metadataName) {
    case "HEALTH":
      return ITEM_HEALTH_METADATA_ID;
    case "MAX-HEALTH":
      return ITEM_MAX_HEALTH_METADATA_ID;
    case "TEMP-HEALTH":
      return ITEM_TEMP_HEALTH_METADATA_ID;
    case "ARMOR-CLASS":
      return ITEM_ARMOR_CLASS_METADATA_ID;
    case "HEALTH-VISIBILITY":
      return ITEM_HEALTH_VISIBILITY_METADATA_ID;
    case "GROUP":
      return ITEM_GROUP_METADATA_ID;
    case "INDEX":
      return ITEM_INDEX_METADATA_ID;
    case "ADDED":
      return ITEM_ADDED_METADATA_ID;
    case "SHOW-ITEMS":
      return ITEM_SHOW_ITEMS_METADATA_ID;
  }
}