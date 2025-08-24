import {
  Action,
  BulkEditorState,
} from "./types";

import {
  Button,
} from "@/components/ui/button";

import
  Command
from "./Command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

import {
  calculateScaledHealthDiff,
} from "./healthCalculations";

import {
  useEffect,
  useState,
} from "react";

import
  DiceSVG
from "./DiceSVG";

import {
  setSceneRolls,
} from "./helpers";

import {
  Separator,
} from "@/components/ui/separator";

import
  OBR, {
  Player,
} from "@owlbear-rodeo/sdk";

import {
  Check,
} from "@/components/icons/Check";

import {
  Dices,
} from "@/components/icons/Dices";

import {
  Equal,
} from "@/components/icons/Equal";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import
  Trash
from "@/components/icons/Trash";

import
  DicePair
from "@/components/icons/DicePair";

import
  QuestionMark
from "@/components/icons/QuestionMark";

import
  LinkButton
from "@/settings/LinkButton";

export default function DiceRoller({
  appState,
  dispatch,
  playerName,
  playerId,
  playerColor,
  playerRole,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  playerName: string;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
}): JSX.Element {
  const [diceMenuOpen, setDiceMenuOpen] = useState(false);

  const [players, setPlayers] = useState<Array<Player>>([]);

  useEffect(() => {
      const initPlayerList = async () => {
          setPlayers(await OBR.party.getPlayers());
      };

      initPlayerList();
      return OBR.party.onChange((players) => {
          setPlayers(players);
      });
  }, []);

  const rolls: JSX.Element[] = appState.rolls
    .filter((roll) => {
      if (roll.visibility === "PUBLIC") return true;
      if (roll.visibility === "GM" && (playerRole === "GM" || roll.playerId === playerId)) return true;
      if (roll.visibility === "PRIVATE" && OBR.player.id === roll.playerId)
        return true;
      return false;
    })
    .map((roll) => {
      const rollString = roll.roll;
      const diceExpression = rollString.substring(0, rollString.indexOf(":"));
      const dieResults = rollString.substring(
        rollString.indexOf(":") + 1,
        rollString.indexOf(" ="),
      );
      
      const rollerName = (roll.playerId === OBR.player.id) ? playerName : (players.find((p) => p.id === roll.playerId)?.name??roll.playerName);
      const rollerColor = (roll.playerId === OBR.player.id) ? playerColor : (players.find((p) => p.id === roll.playerId)?.color??roll.playerColor);
      const rollerRole = (roll.playerId === OBR.player.id) ? playerRole : (players.find((p) => p.id === roll.playerId)?.role??roll.playerRole);
      
      return (
        <div
          key={roll.timeStamp}
          className="flex w-full flex-col gap-2 overflow-clip rounded-lg border border-mirage-300 bg-mirage-100 p-2 text-sm shadow-sm dark:border-none dark:bg-mirage-900"
        >
          <div className="">
            {roll.visibility === "GM" && (
              <div className="float-end pr-0.5">GM</div>
            )}
            {roll.visibility === "PRIVATE" && (
              <div className="float-end pr-0.5">Private</div>
            )}
            <p className="flex flex-wrap items-center gap-x-1">

              <span
                style={{
                  color: rollerColor,
                  fontSize: "8px", 
                }}
              >
                {rollerRole === "GM" ? '●' : '■'}
              </span>

              <span className="text-mirage-500 dark:text-mirage-400">
                {roll.playerId === OBR.player.id ? "You" : rollerName}
              </span>
              
              <span className="text-mirage-500 dark:text-mirage-400">
                {` rolled `}
              </span>
              <span>{`${diceExpression}`}</span>
            </p>
          </div>
          <Separator />
          <div className="flex w-full justify-center text-mirage-500 dark:text-mirage-400">{` ${dieResults}`}</div>
          <div className="flex w-full justify-between gap-2">
            <div className="flex w-full rounded-md border border-mirage-300 bg-slate-50 px-2 font-light dark:border-none dark:bg-mirage-950">
              <span className="ml-auto flex items-center justify-center text-2xl text-mirage-500 dark:text-mirage-400">
                <Equal />
              </span>
              <span className="ml-auto flex grow items-center justify-center text-lg">
                {`${roll.total}`}
              </span>
            </div>
            <Tooltip defaultOpen={false}>
              <TooltipTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="shrink-0"
                  onClick={() => {
                    const diceExpression = rollString.substring(
                      0,
                      rollString.indexOf(":"),
                    );
                    dispatch(
                      {
                        type: "add-roll",
                        diceExpression: diceExpression,
                        playerName: playerName,
                        playerId: playerId,
                        playerColor: playerColor,
                        playerRole: playerRole,
                        visibility: roll.visibility,
                        dispatch: dispatch,
                      }
                    );
                    // setDiceMenuOpen(false);
                  }}
                >
                  <Dices />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Roll Again</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"secondary"}
                  size={"icon"}
                  className="shrink-0"
                  onClick={() => {
                    dispatch({ type: "set-value", value: roll.total });
                    setDiceMenuOpen(false);
                  }}
                >
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use Roll</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    });

  return (
    <div
      className="space-y-2"
      style={{
        padding: "8px 16px 15px 16px"
      }}
    >
      <div className="flex gap-2">
        <Command
          dispatch={dispatch}
          playerName={playerName}
          playerId={playerId}
          playerColor={playerColor}
          playerRole={playerRole}
        ></Command>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-[34px] min-w-12 items-center justify-center rounded-md bg-mirage-50 p-2 text-lg dark:bg-mirage-900 ">
              {appState.animateRoll && (
                <div className={"absolute animate-inverse-bounce"}>
                  <DiceSVG />
                </div>
              )}
              {!appState.animateRoll && (
                <div>
                  {appState.value
                    ? calculateScaledHealthDiff(3, appState.value)
                    : "←"}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
              Last Roll Result
          </TooltipContent>
        </Tooltip>

        <Popover open={diceMenuOpen} onOpenChange={setDiceMenuOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  style={{
                    width: "34px",
                    height: "34px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                >
                  <DicePair />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
                Open Roll History
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            className="p-0"
            side="top"
            sideOffset={4}
            align="end"
            alignOffset={0}
            style={{ 
              height: playerRole === "GM" ? 467 : 376,
              width: playerRole === "GM" ? 358 : 288, 
            }}
          >
            <ScrollArea className="h-full px-4">
              <div className="flex flex-col gap-2" style={{padding: "10px 0px 12px 0px",}}>
                <button className="absolute size-0" name="root, does nothing" />
                <div className="flex items-center">
                  <h4 className="font-medium" style={{ marginRight: "auto" }}>
                    Scene Dice Roll History
                  </h4>
                  {playerRole === "GM" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          style={{
                            width: "32px",
                            height: "32px",
                          }}
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => {
                            setSceneRolls([]);
                          }}
                        >
                          <Trash/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                          Clear History
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {playerRole === "PLAYER" && (
                    <LinkButton
                      name="Go to Dice Roller Guide"
                      icon={<QuestionMark />}
                      href={
                        "https://dice-roller.github.io/documentation/guide/notation/"
                      }
                    />
                  )}
                </div>
                <Separator />
                {appState.rolls.length > 0 ? (
                  <div className="flex flex-col justify-start gap-2">
                    {rolls}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {playerRole === "PLAYER" 
                    ? "Your rolls and any public ones, made in this scene, will be available here." 
                    : "Your rolls and any not private ones, made in this scene, will be available here." }
                  </p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        
        {/* {appState.operation !== "NONE" && (
          <div className="ml-auto w-full md:w-fit">
            {getOperationButton(appState.operation)}
          </div>
        )} */}
      </div>
    </div>
  );
}
