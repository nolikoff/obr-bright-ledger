import
  OBR
from "@owlbear-rodeo/sdk";

import {
  getPluginId,
} from "../getPluginId";

import
  menuIcon
from "@/menuIcon";

import {
  Settings,
} from "@/metadataHelpers/settingMetadataHelpers";

import {
  ITEM_ADDED_METADATA_ID,
} from "@/metadataHelpers/itemMetadataIds";

import {
  readBooleanFromObject,
} from "@/metadataHelpers/metadataHelpers";

const NAME_HEIGHT = 40;
const STATS_HEIGHT = 84;
// const BOTTOM_PADDING = 12;
const BOTTOM_PADDING = 0;


export default async function createContextMenuItems(
  settings: Settings,
  themeMode: "DARK" | "LIGHT",
) {
  let menuHeight = STATS_HEIGHT + BOTTOM_PADDING;
  if (settings.nameTags) menuHeight += NAME_HEIGHT;

  createPlayerMenu(themeMode, menuHeight);

  createGmAddTokenButton();

  createGmMenu(themeMode, menuHeight);
}

function createGmAddTokenButton() {
  OBR.contextMenu.create({
    id: getPluginId("gm-add-remove-token-button"),
    icons: [
      {
        icon: menuIcon,
        label: "Add to Bright View",
        filter: {
          every: [
            { key: ["metadata", "com.onrender.obr-bright-ledger/metadata", "SHOW-ITEMS"], value: "ADDED", coordinator: "&&" },
            { key: ["metadata", "com.onrender.obr-bright-ledger/metadata", "ADDED"], value: false, coordinator: "&&" },
            { key: "type", value: "IMAGE", coordinator: "&&" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
          ],
          permissions: ["UPDATE"],
          roles: ["GM"],
        },
      },
      {
        icon: menuIcon,
        label: "Remove from Bright View",
        filter: {
          every: [
            { key: ["metadata", "com.onrender.obr-bright-ledger/metadata", "SHOW-ITEMS"], value: "ADDED", coordinator: "&&" },
            { key: ["metadata", "com.onrender.obr-bright-ledger/metadata", "ADDED"], value: true, coordinator: "&&" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
          ],
          permissions: ["UPDATE"],
          roles: ["GM"],
        },
      },
    ],
    onClick(context) {
      OBR.scene.items.updateItems(context.items, (items) => {
        for (let item of items) {
          const itemMetadata = item.metadata[getPluginId("metadata")];
          const added = readBooleanFromObject(itemMetadata, ITEM_ADDED_METADATA_ID);

          item.metadata[getPluginId("metadata")] = {
            ...(typeof itemMetadata === "object" ? itemMetadata : {}),
            ...{ [ITEM_ADDED_METADATA_ID]: !added },
          };
        }
      });
    },
  });
}

function createGmMenu(
  themeMode: "DARK" | "LIGHT", 
  gmMenuHeight: number,
) {
  OBR.contextMenu.create({
    id: getPluginId("gm-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Bright Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE", coordinator: "&&" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT", coordinator: "||" },
          ],
          roles: ["GM"],
          max: 1,
        },
      },
    ],
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: gmMenuHeight,
    },
  });
}

function createPlayerMenu(
  themeMode: "DARK" | "LIGHT",
  playerMenuHeight: number,
) {
  OBR.contextMenu.create({
    id: getPluginId("player-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Bright Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE", coordinator: "&&" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT", coordinator: "||" },
            {
              key: [
                "metadata",
                "com.onrender.obr-bright-ledger/metadata",
                "hide",
              ],
              value: true,
              operator: "!=",
            },
          ],
          permissions: ["UPDATE"],
          roles: ["PLAYER"],
          max: 1,
        },
      },
    ],
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: playerMenuHeight,
    },
  });
}
