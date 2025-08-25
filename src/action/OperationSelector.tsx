import
  OBR
from "@owlbear-rodeo/sdk";

import {
  useState,
} from "react";

import {
  Action,
  BulkEditorState,
} from "./types";

import {
  Button,
} from "@/components/ui/button";

import {
  getPluginId,
} from "@/getPluginId";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  TableCell,
} from "@/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import
  Camp
from "@/components/icons/Camp";

import
  Lightning
from "@/components/icons/Lightning";

import
  Leaf
from "@/components/icons/Leaf";

import
  Pencil
from "@/components/icons/Pencil";

import
  AllTokens
from "@/components/icons/AllTokens";

import
  SelectedTokens
from "@/components/icons/SelectedTokens";

import
  AddedTokens
from "@/components/icons/AddedTokens";

import
  Gear
from "@/components/icons/Gear";


import
  Token
from "@/metadataHelpers/TokenType";

import {
  ITEM_SHOW_ITEMS_METADATA_ID
} from "@/metadataHelpers/itemMetadataIds";
import { setSceneShowItems } from "@/metadataHelpers/sceneMetadataHelpers";


export default function OperationSelector({
  appState,
  dispatch,
  tokens,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
}): JSX.Element {
  return (
    <div
      className="flex gap-2"
      style={{
        padding: "15px 16px 8px 16px",
      }}
    >
      <Tabs defaultValue="NONE" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-[34px]">
          <TabsTrigger
            value="NONE"
            className="h-[26px]"
            onClick={() => {
              dispatch({
                type: "set-operation",
                operation: "NONE",
              });
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Camp />
              </TooltipTrigger>
              <TooltipContent>
                Home
              </TooltipContent>
            </Tooltip>
          </TabsTrigger>
          <TabsTrigger
            value="DAMAGE"
            className="h-[26px]"
            onClick={() => {
              dispatch({
                type: "set-operation",
                operation: "DAMAGE",
              });
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Lightning />
              </TooltipTrigger>
              <TooltipContent>
                Damage
              </TooltipContent>
            </Tooltip>
          </TabsTrigger>
          <TabsTrigger
            value="HEALING"
            className="h-[26px]"
            onClick={() => {
              dispatch({
                type: "set-operation",
                operation: "HEALING",
              });
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Leaf />
              </TooltipTrigger>
              <TooltipContent>
                Healing
              </TooltipContent>
            </Tooltip>
          </TabsTrigger>
            <TabsTrigger
              value="OVERWRITE"
              className="h-[26px]"
              onClick={() => {
                dispatch({
                  type: "set-operation",
                  operation: "OVERWRITE",
                });
              }}
            >
            <Tooltip>
              <TooltipTrigger>
                <Pencil />
              </TooltipTrigger>
              <TooltipContent>
                Overwrite
              </TooltipContent>
            </Tooltip>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ViewModeMenu
        appState={appState}
        tokens={tokens}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"icon"}
            variant={"ghost"}
            className="shrink-0 h-[34px] w-[34px]"
            onClick={ async () => {
              const themeMode = (await OBR.theme.getTheme()).mode;
              OBR.popover.open({
                id: getPluginId("settings"),
                url: `/src/settings/settings.html?themeMode=${themeMode}`,
                height: 514,
                width: 360,
                anchorPosition: { left: 588, top: 571 },
                anchorReference: "POSITION",
              });
            }}
          >
            <Gear />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          Settings
        </TooltipContent>
      </Tooltip>
    </div>
  );
}


function ViewModeMenu({
  appState,
  tokens,
}: {
  appState: BulkEditorState;
  tokens: Token[];
}): JSX.Element {

  const [open, setOpen] = useState(false);

  const renderMainIcon = () => {
    switch (appState.showItems) {
      case "ALL":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                style={{
                  width: "32px",
                  height: "32px",
                }}
                variant={"ghost"}
                size={"icon"}
              >
                <AllTokens />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              All Tokens
            </TooltipContent>
          </Tooltip>
        );
      case "SELECTED":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                style={{
                  width: "32px",
                  height: "32px",
                }}
                variant={"ghost"}
                size={"icon"}
              >
                <SelectedTokens />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Selected Tokens
            </TooltipContent>
          </Tooltip>
        );
      case "ADDED":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                style={{
                  width: "32px",
                  height: "32px",
                }}
                variant={"ghost"}
                size={"icon"}
              >
                <AddedTokens />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Added Tokens
            </TooltipContent>
          </Tooltip>
        );
    }
  };
  
  return (
    <TableCell
      className="align-top"
      style={{
        padding: "0px",
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            style={{
              width: "32px",
              height: "32px",
            }}
            variant={"ghost"}
            size={"icon"}
          >
            {renderMainIcon()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="center"
          sideOffset={-37}
          style={{ 
            height: "42px",
            width: "114px",
          }}
        >
          <TableCell
            className="items-center justify-center gap-1 p-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    // dispatch({
                    //   type: "set-show-items",
                    //   showItems: "ALL",
                    // });
                    updateTokensShowItems(tokens, "ALL");
                    setSceneShowItems("ALL");
                    setOpen(false);
                  }}
                >
                  {appState.showItems === "ALL" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <AllTokens />
                    </div>
                  ) : (
                    <AllTokens />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use All Tokens
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    // dispatch({
                    //   type: "set-show-items",
                    //   showItems: "SELECTED",
                    // });
                    updateTokensShowItems(tokens, "SELECTED");
                    setSceneShowItems("SELECTED");
                    setOpen(false);
                  }}
                >
                  {appState.showItems === "SELECTED" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <SelectedTokens />
                    </div>
                  ) : (
                    <SelectedTokens />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use Selected Tokens
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    // dispatch({
                    //   type: "set-show-items",
                    //   showItems: "ADDED",
                    // });
                    updateTokensShowItems(tokens, "ADDED");
                    setSceneShowItems("ADDED");
                    setOpen(false);
                  }}
                >
                  {appState.showItems === "ADDED" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <AddedTokens />
                    </div>
                  ) : (
                    <AddedTokens />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use Added Tokens
              </TooltipContent>
            </Tooltip>
          </TableCell>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

export async function updateTokensShowItems(
  tokens: Token[],
  newShowItems: "ALL" | "SELECTED" | "ADDED",
) {
  
  await OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
      for (let i = 0; i < items.length; i++) {

        if (items[i].id !== tokens[i].item.id) continue
        
        const newMetadata = {
          [ITEM_SHOW_ITEMS_METADATA_ID]: newShowItems,
        };

        let retrievedMetadata: any;
        if (items[i].metadata[getPluginId("metadata")]) {
          retrievedMetadata = JSON.parse(
            JSON.stringify(items[i].metadata[getPluginId("metadata")]),
          );
        }

        const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value
        items[i].metadata[getPluginId("metadata")] = combinedMetadata;
      }
    },
  );
}