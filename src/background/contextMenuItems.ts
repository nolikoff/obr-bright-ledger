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
  createGmMenu(themeMode, menuHeight);
  // createDamageToolContextItem(themeMode);
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
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
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
    shortcut: "Shift + S",
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: playerMenuHeight,
    },
  });
}

function createGmMenu(themeMode: "DARK" | "LIGHT", gmMenuHeight: number) {
  OBR.contextMenu.create({
    id: getPluginId("gm-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Bright Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
          ],
          roles: ["GM"],
          max: 1,
        },
      },
    ],
    shortcut: "Shift + S",
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: gmMenuHeight,
    },
  });
}
