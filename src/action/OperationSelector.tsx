import {
  Action,
  BulkEditorState,
} from "./types";

import {
  Button,
} from "@/components/ui/button";

import
  OBR
from "@owlbear-rodeo/sdk";

import {
  getPluginId,
} from "@/getPluginId";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import
  Camp
from "@/components/icons/Camp";

import
  Gear
from "@/components/icons/Gear";

import
  Lightning
from "@/components/icons/Lightning";

import
  Leaf
from "@/components/icons/Leaf";

import
  Pencil
from "@/components/icons/Pencil";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function OperationSelector({
  dispatch,
  playerRole,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  playerName: string;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
}): JSX.Element {
  return (
    <div>

    {playerRole === "GM" ? (
      <div
        className="flex gap-2"
        style={{
          padding: "15px 16px 8px 16px",
        }}
      >

        <>
        <Tabs
          defaultValue="NONE"
          className="w-full"
        >
          <TabsList
            className="grid w-full grid-cols-4"
            style={{
              height: "34px",
            }}
          >
            <TabsTrigger
              style={{
                height: "26px",
              }}
              value="NONE"
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
              style={{
                height: "26px",
              }}
              value="DAMAGE"
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
              style={{
                height: "26px",
              }}
              value="HEALING"
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
                style={{
                  height: "26px",
                }}
                value="OVERWRITE"
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
          <Tooltip>
          <TooltipTrigger asChild>
            <Button
              style={{
                width: "34px",
                height: "34px",
              }}
              size={"icon"}
              variant={"ghost"}
              className="shrink-0"
              onClick={async () => {
                const themeMode = (await OBR.theme.getTheme()).mode;
                OBR.popover.open({
                  id: getPluginId("settings"),
                  url: `/src/settings/settings.html?themeMode=${themeMode}`,
                  height: 514,
                  width: 360,
                  //anchorOrigin: { horizontal: "LEFT", vertical: "TOP" },
                  anchorPosition: { left: 585, top: 572 },
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
      </div>
    ) : (
      <div style={{paddingTop: "11px"}}></div>
    )}
    </div>
  );
}
