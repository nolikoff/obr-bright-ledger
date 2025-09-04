import
  OBR
from "@owlbear-rodeo/sdk";

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
  Gear
from "@/components/icons/Gear";

import {
  setSceneStatsVisibility,
} from "@/metadataHelpers/sceneMetadataHelpers";

import
  PinOn
from "@/components/icons/PinOn";

import
  PinOff
from "@/components/icons/PinOff";


export default function OperationSelector({
  appState,
  dispatch,
  playerRole,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  playerRole: "PLAYER" | "GM";
}): JSX.Element {

  return (
    <div
      className="flex gap-2"
      style={{
        padding: "15px 15px 8px 15px",
      }}
    >
      <Tabs 
        value={appState.operation}
        className="w-full"
      >
        {playerRole === "GM" && (
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
        )}

        {playerRole === "PLAYER" && (
          <TabsList className="grid w-full grid-cols-3 h-[34px]">
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
          </TabsList>
        )}
      </Tabs>
      
      { playerRole === "GM" && (
        <>
          <div className="inline-block">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-[34px] w-[34px]"
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    setSceneStatsVisibility(appState.statsVisibility === "BATTLE" ? "EXPLORE" : "BATTLE");
                  }}
                >
                  {appState.statsVisibility === "BATTLE" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <PinOn />
                    </div> 
                  ) : (
                    <PinOff />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {appState.statsVisibility === "BATTLE" ? "Visible Stats" : "Hidden Stats"}
              </TooltipContent>
            </Tooltip>
          </div>
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
                    anchorPosition: { left: 580, top: 571 },
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
        </>
      )}
    </div>
  );
}