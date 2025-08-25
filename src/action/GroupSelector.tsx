
import {
  Action,
  BulkEditorState,
} from "./types";

import {
  Button,
} from "@/components/ui/button";

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
  Swords
from "@/components/icons/Swords";

import
  MagnifyingGlass
from "@/components/icons/MagnifyingGlass";

import {
  setSceneMode,
} from "@/metadataHelpers/sceneMetadataHelpers";


export default function GroupSelector({
  appState,
  dispatch,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
}): JSX.Element {
  return (
    <div className="flex px-4 align-middle gap-2 items-center justify-center pb-2">
      <div className="inline-block flex-1">
        <Tabs
          defaultValue="COMPANIONS"
          className="w-full p-0"
        >
          <TabsList className="grid w-full grid-cols-2 h-[34px]">
            <TabsTrigger
              value="COMPANIONS"
              className="h-[26px]"
              onClick={() => {
                dispatch({
                  type: "set-group",
                  group: "COMPANIONS",
                })
              }}
            >
              Companions
            </TabsTrigger>
            <TabsTrigger
              value="STRANGERS"
              className="h-[26px]"
              onClick={() => {
                dispatch({
                  type: "set-group",
                  group: "STRANGERS",
                })
              }}
            >
              Strangers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="inline-block">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-[34px] w-[34px]"
              variant={"ghost"}
              size={"icon"}
              onClick={() => {
                setSceneMode(appState.mode === "BATTLE" ? "EXPLORE" : "BATTLE");
              }}
            >
              {appState.mode === "BATTLE" ? (
                <div className="text-primary-500 dark:text-primary-dark">
                  <Swords />
                </div> 
              ) : (
                <MagnifyingGlass />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {appState.mode === "BATTLE" ? "Battle Mode" : "Explore Mode"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}