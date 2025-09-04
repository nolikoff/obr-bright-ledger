import {
  Action,
  BulkEditorState,
  StampedDiceRoll,
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
  useState,
  useRef,
} from "react";

import
  DiceSVG
from "./DiceSVG";

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

import {
  setSceneRolls,
} from "@/metadataHelpers/sceneMetadataHelpers";

export default function DiceRoller({
  appState,
  dispatch,
  playerName,
  playerId,
  playerColor,
  playerRole,
  players,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  playerName: string;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  players: Player[];
}): JSX.Element {
  const [diceMenuOpen, setDiceMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: 0,
          behavior: "smooth", // change to "smooth" if you want animation
        });
      }
    }
  };

  const rollFilter = (roll: StampedDiceRoll) => {
    if (roll.visibility === "PUBLIC") return true;
    if (roll.visibility === "GM" && (playerRole === "GM" || playerId === roll.playerId)) return true;
    if (roll.visibility === "PRIVATE" && playerId === roll.playerId) return true;
    if (roll.visibility === "DAMAGE" && (playerRole === "GM" || playerId === roll.playerId)) return true;
    if (roll.visibility === "HEALING" && (playerRole === "GM" || playerId === roll.playerId)) return true;
    return false;
  };

  const rolls: JSX.Element[] = appState.rolls
    .filter(rollFilter)
    .map((roll) => {
      const rollString = roll.roll;
      const diceExpression = rollString.substring(0, rollString.indexOf(":"));
      const dieResults = rollString.substring(
        rollString.indexOf(":") + 1,
        rollString.indexOf(" ="),
      );
      
      const rollerName = (roll.playerId === playerId) ? playerName : (players.find((p) => p.id === roll.playerId) ?.name ?? roll.playerName);
      const rollerColor = (roll.playerId === playerId) ? playerColor : (players.find((p) => p.id === roll.playerId) ?.color ?? roll.playerColor);
      const rollerRole = (roll.playerId === playerId) ? playerRole : (players.find((p) => p.id === roll.playerId) ?.role ?? roll.playerRole);
      
      return (
        <div
          key={roll.timeStamp}
          className="flex w-full flex-col gap-2 overflow-clip rounded-lg border border-mirage-300 bg-mirage-100 p-2 text-sm shadow-sm dark:border-none dark:bg-mirage-900"
        >
          <div>
            {roll.visibility === "GM" && (
              <div className="float-end pr-0.5">
                GM
              </div>
            )}
            {roll.visibility === "PRIVATE" && (
              <div className="float-end pr-0.5">
                Private
              </div>
            )}
            {roll.visibility === "DAMAGE" && (
              <div className="float-end pr-0.5">
                Damage
              </div>
            )}
            {roll.visibility === "HEALING" && (
              <div className="float-end pr-0.5">
                Healing
              </div>
            )}
            <p className="flex flex-wrap items-center gap-x-1">
              <span
                style={{
                  color: rollerColor,
                  // fontSize: rollerRole === "GM" ? "12px" : "8px", 
                }}
              >
                {rollerRole === "GM" ? (
                  <svg width="7" height="7">
                    <circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" />
                  </svg>
                ): (
                  <svg width="7" height="7">
                    <rect x="0.5" y="0.5" width="6" height="6" fill="currentColor" />
                  </svg>
                )}
                {/* {rollerRole === "GM" ? '●' : '■'} */}
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
          <div className="flex w-full justify-center text-mirage-500 dark:text-mirage-400">
            {` ${dieResults}`}
          </div>
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
                    scrollToTop();
                  }}
                >
                  <Dices />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Roll Again
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"secondary"}
                  size={"icon"}
                  className="shrink-0"
                  onClick={() => {
                    dispatch({ 
                      type: "set-value",
                      value: roll.total
                    });
                    setDiceMenuOpen(false);
                  }}
                >
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Use Roll
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
        padding: "8px 15px 15px 15px"
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
                  className="h-[34px] w-[34px]"
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
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={4}
            align="end"
            alignOffset={0}
            style={{ 
              height: playerRole === "GM" ? 460 : 310,
              width: playerRole === "GM" ? 352 : 308, 
            }}
          >
            <div className="px-4 pt-2 pb-2">
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4
                      className="font-medium"
                      style={{
                        marginRight: "auto",
                      }}
                    >
                      Dice Roll History
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    New roll appears at the top
                  </TooltipContent>
                </Tooltip>
                
                <div className="gap-2 flex">
                  <LinkButton
                    name="Go to Dice Roller Guide"
                    icon={<QuestionMark />}
                    href={
                      "https://dice-roller.github.io/documentation/guide/notation/"
                    }
                  />
                
                  {playerRole === "GM" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="h-[32px] w-[32px]"
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => {
                            setSceneRolls([]);
                          }}
                        >
                          <Trash/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Clear History
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-48px)] px-4" ref={scrollRef}>
              <div
                className="flex flex-col gap-2"
                style={{
                  padding: "0px 0px 12px 0px",
                }}
              >
                {appState.rolls.filter(rollFilter).length > 0 ? (
                  <div className="flex flex-col justify-start gap-2">
                    {rolls}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {playerRole === "PLAYER" 
                    ? "Your rolls and any public ones, made in this scene, will appear here." 
                    : "Your rolls and any not private ones, made in this scene, will appear here." }
                  </p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
