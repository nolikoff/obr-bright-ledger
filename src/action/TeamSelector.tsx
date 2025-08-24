
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

import
  Swords
from "@/components/icons/Swords";

import
  MagnifyingGlass
from "@/components/icons/MagnifyingGlass";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { setSceneMode } from "./helpers";


export default function TeamSelector({
  appState,
  dispatch,
  playerRole,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  playerRole: "PLAYER" | "GM";
}): JSX.Element {
  return (
    <div>

    {playerRole === "GM" && (
      <div
        className="flex px-4 align-middle gap-2 items-center justify-center pb-2"
      >
        <div
          style={{
            display: "inline-block",
            flex: "1"
          }}
        >
          <Tabs
            defaultValue="COMPANIONS"
            className="w-full"
            style={{
              padding: "0px 0px 0px 0px",
            }}
          >
            <TabsList
              className="grid w-full grid-cols-2"
              style={{
                height: "34px",
              }}
            >
              <TabsTrigger
                style={{
                  height: "26px",
                }}
                value="COMPANIONS"
                onClick={() => {
                  dispatch({
                    type: "set-team",
                    team: "COMPANIONS",
                  })
                }}
              >
                Companions
              </TabsTrigger>
              <TabsTrigger
                style={{
                  height: "26px",
                }}
                value="STRANGERS"
                onClick={() => {
                  dispatch({
                    type: "set-team",
                    team: "STRANGERS",
                  })
                }}
              >
                Strangers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div style={{display: "inline-block"}}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                style={{
                  width: "34px",
                  height: "34px",
                }}
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
    )}
    </div>
  );
}