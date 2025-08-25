import
  OBR, {
  isImage, 
  Item,
} from "@owlbear-rodeo/sdk";

import {
  ITEM_HEALTH_METADATA_ID,
  ITEM_MAX_HEALTH_METADATA_ID,
  ITEM_TEMP_HEALTH_METADATA_ID,
  ITEM_ARMOR_CLASS_METADATA_ID,
  ITEM_HEALTH_VISIBILITY_METADATA_ID,
  ITEM_GROUP_METADATA_ID,
  ITEM_INDEX_METADATA_ID,
  ITEM_ADDED_METADATA_ID,
  ITEM_SHOW_ITEMS_METADATA_ID,
} from "./itemMetadataIds";

import
  Token 
from "./TokenType";

import {
  getPluginMetadata,
  readNumberFromObject,
  readGroupFromObject,
  readHealthVisibilityFromObject,
  readShowItemsFromObject,
  readAddedFromObject,
} from "./metadataHelpers";

import {
  writeTokenValueToItem,
} from "@/statInputHelpers";

// parse stats

export async function getSelectedItems(selection?: string[]): Promise<Item[]> {
  if (selection === undefined) selection = await OBR.player.getSelection();
  if (selection === undefined) return [];
  const selectedItems = await OBR.scene.items.getItems(selection);
  return selectedItems;
}

export function parseItems(items: Item[]): Token[] {
  const validItems = items.filter((item) => itemFilter(item));

  const Tokens: Token[] = [];
  for (const item of validItems) {
    const metadata = getPluginMetadata(item.metadata);

    const health = readNumberFromObject(metadata, ITEM_HEALTH_METADATA_ID);
    const maxHealth = readNumberFromObject(metadata, ITEM_MAX_HEALTH_METADATA_ID);
    const tempHealth = readNumberFromObject(metadata, ITEM_TEMP_HEALTH_METADATA_ID);
    const armorClass = readNumberFromObject(metadata, ITEM_ARMOR_CLASS_METADATA_ID);
    const healthVisibility = readHealthVisibilityFromObject(metadata, ITEM_HEALTH_VISIBILITY_METADATA_ID);
    const group = readGroupFromObject(metadata, ITEM_GROUP_METADATA_ID);
    const index = readNumberFromObject(metadata, ITEM_INDEX_METADATA_ID, -1)
    let added = readAddedFromObject(metadata, ITEM_ADDED_METADATA_ID);
    let showItems = readShowItemsFromObject(metadata, ITEM_SHOW_ITEMS_METADATA_ID);

    if(added === "undefined") {
      writeTokenValueToItem(item.id, ITEM_ADDED_METADATA_ID, false);
      added = false;
    }

    if(showItems === "undefined") {
      writeTokenValueToItem(item.id, ITEM_SHOW_ITEMS_METADATA_ID, "ALL");
      showItems = "ALL";
    }

    Tokens.push(
      tokenFactory(
        item,
        health,
        maxHealth,
        tempHealth,
        armorClass,
        healthVisibility,
        group,
        index,
        added,
        showItems,
      ),
    );
  }

  return Tokens;
}

/** Returns true for images on the mount and character layers */
export function itemFilter(item: Item) {
  return (
    isImage(item) && (item.layer === "CHARACTER" || item.layer === "MOUNT")
  );
}

export function getTokenStats(
  item: Item,
): [
  health: number,
  maxHealth: number,
  tempHealth: number,
  armorClass: number,
  healthVisibility: "HIDDEN" | "BAR" | "BAR-VALUE",
  group: "COMPANIONS" | "STRANGERS",
] {
  const metadata = getPluginMetadata(item.metadata);

  const health = readNumberFromObject(metadata, ITEM_HEALTH_METADATA_ID);
  const maxHealth = readNumberFromObject(metadata, ITEM_MAX_HEALTH_METADATA_ID);
  const tempHealth = readNumberFromObject(metadata, ITEM_TEMP_HEALTH_METADATA_ID);
  const armorClass = readNumberFromObject(metadata, ITEM_ARMOR_CLASS_METADATA_ID);
  const healthVisibility = readHealthVisibilityFromObject(metadata, ITEM_HEALTH_VISIBILITY_METADATA_ID);
  const group = readGroupFromObject(metadata, ITEM_GROUP_METADATA_ID);

  return [
    health,
    maxHealth,
    tempHealth,
    armorClass,
    healthVisibility,
    group,
  ];
}

export function tokenFactory(
  item: Item,
  health: number,
  maxHealth: number,
  tempHealth: number,
  armorClass: number,
  healthVisibility: "HIDDEN" | "BAR" | "BAR-VALUE",
  group: "COMPANIONS" | "STRANGERS",
  index: number,
  added: boolean,
  showItems: "ALL" | "SELECTED" | "ADDED",
): Token {
  return {
    item,
    health,
    maxHealth,
    tempHealth,
    armorClass,
    healthVisibility,
    group,
    index,
    added,
    showItems,
  };
}
