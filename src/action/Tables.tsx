import Token from "../metadataHelpers/TokenType";
import "../index.css";
import OBR, { Image, Player } from "@owlbear-rodeo/sdk";
import Tippy from "@tippyjs/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import {
  calculateNewHealth,
  calculateScaledHealthDiff,
} from "./healthCalculations";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_DAMAGE_SCALE,
  focusItem,
  getDamageScaleOption,
  getIncluded,
  handleTokenClicked,
} from "./helpers";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import {
  getNewStatValue,
  InputName,
  isInputName,
  writeTokenValueToItem,
} from "@/statInputHelpers";
import StatStyledInput from "./StatStyledInput";
import { Action, BulkEditorState } from "./types";
import Hidden from "@/components/icons/Hidden";
import Shown from "@/components/icons/Shown";
import HiddenHealth from "@/components/icons/HiddenHealth";
import HealthBar from "@/components/icons/HealthBar";
import HitPoints from "@/components/icons/HitPoints";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import refreshAllHealthBars from "@/background/statAttachments";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

import { SmartMouseSensor } from "./SmartPointerSensor";
import { SortableTableRow } from "./SortableTableRow";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SceneTokensTable({
  appState,
  dispatch,
  tokens,
  setTokens,
  playerRole,
  playerSelection,
  handleDragEnd,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  handleDragEnd: (event: DragEndEvent) => void;
}): JSX.Element {
  const sensors = useSensors(
    useSensor(SmartMouseSensor, {
      activationConstraint: { distance: { y: 10 } },
    }),
  );

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

  return (
    <div>
      {appState.operation === "none" && playerRole === "GM" && (
        <DefaultGMSceneTokensTable
          appState={appState}
          dispatch={dispatch}
          tokens={tokens}
          setTokens={setTokens}
          playerRole={playerRole}
          playerSelection={playerSelection}
          handleDragEnd={handleDragEnd}
        />
      )}
    </div>
  );
}

function DefaultGMSceneTokensTable({
  appState,
  dispatch,
  tokens,
  setTokens,
  playerRole,
  playerSelection,
  handleDragEnd,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  handleDragEnd: (event: DragEndEvent) => void;
}): JSX.Element {
  const sensors = useSensors(
    useSensor(SmartMouseSensor, {
      activationConstraint: { distance: { y: 10 } },
    }),
  );

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

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      collisionDetection={closestCenter}
      onDragEnd={playerRole === "GM" ? handleDragEnd : () => {}}
    >
      <SortableContext
        items={playerRole === "GM" ? tokens.map((token) => token.item.id) : []}
        strategy={verticalListSortingStrategy}
      >
        <Table tabIndex={-1}>
          <TableBody>
            {tokens.map((token) => {
              const included = getIncluded(
                token.item.id,
                appState.includedItems,
              );

              const handleKeyDown = (
                event: React.KeyboardEvent<HTMLTableRowElement>,
              ) => {
                switch (event.code) {
                  case "ArrowLeft":
                    previousDamageOption();
                    break;
                  case "ArrowRight":
                    nextDamageOption();
                    break;
                  case "KeyR":
                    resetDamageOption();
                    break;
                }
              };

              return (
                <SortableTableRow
                  key={token.item.id}
                  id={token.item.id}
                  onKeyDown={handleKeyDown}
                >
                  <div
                    style={{
                      marginTop: "8px",
                      marginBottom: "8px",
                    }} 
                  >
                    <TableCell>
                      <div 
                        style={{
                          height: "72px",
                          paddingRight: "16px",
                          borderLeft: "4px solid " + (players.find((p) => p.id === token.item.createdUserId)?.color ?? "transparent"),
                      ></div>
                    </TableCell>

                    <TableCell>
                      <div
                        className="grid gap-2 align-middle"
                      >
                        <div 
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <TokenTableCell
                            token={token}
                            faded={!included && appState.operation !== "none"}
                            playerSelection={playerSelection}
                          />
                          <TableCell></TableCell>
                          <VisibilityButton token={token} setTokens={setTokens} />
                        </div>
                        <OwnerSelector token={token} setTokens={setTokens} />
                      </div>
                    </TableCell>
                          
                    <TableCell></TableCell>

                    <HealthBarMenu token={token} setTokens={setTokens} />

                    <TableCell>
                      <div 
                        className="grid justify-items-stretch gap-2 grid-template-columns-[1fr 1fr]"
                      >
                        <div
                          className="col-span-2 flex items-center"
                        >
                          <StatInput
                            parentValue={token.health}
                            name={"health"}
                            updateHandler={(target) =>
                              handleStatUpdate(
                                token.item.id,
                                target,
                                token.health,
                                setTokens,
                              )
                            }
                          />
                          <div
                            style={{
                              textAlign: "center",
                              width: "8px",
                            }}
                          >
                            {"/"}
                          </div>
                          <StatInput
                            parentValue={token.maxHealth}
                            name={"maxHealth"}
                            updateHandler={(target) =>
                              handleStatUpdate(
                                token.item.id,
                                target,
                                token.maxHealth,
                                setTokens,
                              )
                            }
                          />
                        </div>
                        <StatInput
                          parentValue={token.tempHealth}
                          name={"tempHealth"}
                          updateHandler={(target) =>
                            handleStatUpdate(
                              token.item.id,
                              target,
                              token.tempHealth,
                              setTokens,
                            )
                          }
                        />
                        <StatInput
                          parentValue={token.armorClass}
                          name={"armorClass"}
                          updateHandler={(target) =>
                            handleStatUpdate(
                              token.item.id,
                              target,
                              token.armorClass,
                              setTokens,
                            )
                          }
                        />
                      </div>
                    </TableCell>
                  </div>
                </SortableTableRow>
              );
            })}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}


function AccessButton({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {
  return (
    <TableCell className="py-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            name={
              token.hideStats
                ? "Make Stats Visible to Players"
                : "Hide Stats from players"
            }
            onClick={() =>
              handleHiddenUpdate(token.item.id, token.hideStats, setTokens)
            }
          >
            {token.hideStats ? (
              <div className="text-primary-500 dark:text-primary-dark">
                <Hidden />
              </div>
            ) : (
              <Shown />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {token.hideStats ? "Dungeon Master Only" : "Player Editable"}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

function VisibilityButton({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {
  return (
    <TableCell className="py-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            name={
              token.hideStats
                ? "Show"
                : "Hide"
            }
            onClick={() =>
              handleVisibilityUpdate(token.item.id, token.hideStats, setTokens)
            }
          >
            {token.hideStats ? (
              <div className="text-primary-500 dark:text-primary-dark">
                <Hidden />
              </div>
            ) : (
              <Shown />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {token.hideStats ? "Hidden" : "Shown"}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

function OwnerSelector({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {

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
  
  return (
    <TableCell>
      <Select
        className="w-[128px]"
        value={token.item.createdUserId}
        onValueChange={async (value) => {
          await OBR.scene.items.updateItems([token.item], (items) => {
            items.forEach((item) => {
              item.createdUserId = value;
            });
          });
        }}
      >
        <SelectTrigger className="w-[128px] h-[32px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={OBR.player.id}>GM</SelectItem>
            {players.map((player) => {
              return (
                <SelectItem value={player.id}>
                    {player.name}
                </SelectItem>
              );
          })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </TableCell>
  );
}

function HealthBarMenu({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  
  const [selected, setSelected] = useState<"hidden health" | "health bar" | "hit points">("hidden health");

  const renderMainIcon = () => {
    switch (selected) {
      case "hidden health":
        return <HiddenHealth />;
      case "health bar":
        return <HealthBar />;
      case "hit points":
        return <HitPoints />;
    }
  };

  const handleSelect = (
    value: "hidden health" | "health bar" | "hit points"
  ) => {
    setSelected(value);
    setOpen(false);
  };
  
  return (
    <TableCell className="py-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
          >
            {renderMainIcon()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="center"
          sideOffset={-41}
          style={{ 
            height: "46px",
            width: "124px",
          }}
        >
          <TableCell
            className="items-center justify-center gap-1 p-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => 
                handleSelect("hidden health")
              }
            >  
              {selected === "hidden health" ? (
                <div className="text-primary-500 dark:text-primary-dark">
                  <HiddenHealth />
                </div>
              ) : (
                <HiddenHealth />
              )}
            </Button>
            
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => 
                handleSelect("health bar")
              }
            >
              {selected === "health bar" ? (
                <div className="text-primary-500 dark:text-primary-dark">
                  <HealthBar />
                </div>
              ) : (
                <HealthBar />
              )}
            </Button>
            
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => 
                handleSelect("hit points")
              }
            >
              {selected === "hit points" ? (
                <div className="text-primary-500 dark:text-primary-dark">
                  <HitPoints />
                </div>
              ) : (
                <HitPoints />
              )}
            </Button>
          </TableCell>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

function TokenTableCell({
  token,
  faded,
  playerSelection,
}: {
  token: Token;
  faded: boolean;
  playerSelection: string[];
}): JSX.Element {
  const image = (
    <img
      className="min-h-8 min-w-8"
      src={(token.item as Image).image.url}
    ></img>
  );
  return (
    <TableCell>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <button
              className={cn(
                "size-8 font-medium outline-none sm:size-8",
                {
                  "opacity-60": faded,
                },
                {
                  "outline-image dark:outline-image": playerSelection.includes(
                    token.item.id,
                  ),
                },
              )}
              onClick={(e) =>
                handleTokenClicked(token.item.id, !(e.shiftKey || e.ctrlKey))
              }
              onDoubleClick={() => focusItem(token.item.id)}
              tabIndex={-1}
            >
              {image}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{token.item.name}</TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

async function handleHiddenUpdate(
  itemId: string,
  previousValue: boolean,
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name: InputName = "hideStats";
  if (!isInputName(name)) throw "Error: invalid input name.";

  const value = !previousValue;

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      // console.log(prevTokens[i]);
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}

async function handleVisibilityUpdate(
  itemId: string,
  previousValue: boolean,
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name: InputName = "hideStats";
  if (!isInputName(name)) throw "Error: invalid input name.";

  const value = !previousValue;

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      // console.log(prevTokens[i]);
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}


function handleStatUpdate(
  itemId: string,
  target: HTMLInputElement,
  previousValue: number,
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name = target.name;
  if (!isInputName(name)) throw "Error: invalid input name.";

  const value = getNewStatValue(name, target.value, previousValue);

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      // console.log(prevTokens[i]);
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}

function StatInput({
  parentValue,
  updateHandler,
  name,
}: {
  parentValue: number;
  updateHandler: (target: HTMLInputElement) => void;
  name: InputName;
}): JSX.Element {
  const [value, setValue] = useState<string>(parentValue.toString());
  let ignoreBlur = false;

  // Update value when the tracker value changes in parent
  const [valueInputUpdateFlag, setValueInputUpdateFlag] = useState(false);
  if (valueInputUpdateFlag) {
    setValue(parentValue.toString());
    setValueInputUpdateFlag(false);
  }
  useEffect(() => setValueInputUpdateFlag(true), [parentValue]);

  // Update tracker in parent element
  const runUpdateHandler = (
    e:
      | React.FocusEvent<HTMLInputElement, Element>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    updateHandler(e.target as HTMLInputElement);
    setValueInputUpdateFlag(true);
  };

  // Select text on focus
  const selectText = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    event.target.select();
  };

  return (
    <StatStyledInput
      name={name}
      inputProps={{
        // className: "w-full",
        value: value,
        onChange: (e) => setValue(e.target.value),
        onBlur: (e) => {
          if (!ignoreBlur) runUpdateHandler(e);
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            ignoreBlur = true;
            (e.target as HTMLInputElement).blur();
            ignoreBlur = false;
            setValue(parentValue.toString());
          }
        },
        onFocus: selectText,
        onClick: (e) => e.stopPropagation(),
      }}
    ></StatStyledInput>
  );
}

function CheckboxTableHead({
  included,
  onCheckedChange,
}: {
  included: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <TableCell>
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => {
          if (typeof checked === "boolean") onCheckedChange(checked);
        }}
      />
    </TableCell>
  );
}

function CheckboxTableCell({
  included,
  onCheckedChange,
}: {
  included: boolean;
  onCheckedChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <TableCell>
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => {
          if (typeof checked === "boolean") onCheckedChange(checked);
        }}
      />
    </TableCell>
  );
}

const multipliers = [
  String.fromCharCode(0x2573),
  String.fromCharCode(0xd7) + String.fromCharCode(0xbc),
  String.fromCharCode(0xd7) + String.fromCharCode(0xbd),
  String.fromCharCode(0xd7) + 1,
  String.fromCharCode(0xd7) + 2,
];

const allChecked = (
  tokens: Token[],
  map: Map<string, boolean>,
): boolean | "indeterminate" => {
  let allChecked = true;
  let noneChecked = true;
  for (const token of tokens) {
    const included = getIncluded(token.item.id, map);
    if (included === false) allChecked = false;
    if (included === true) noneChecked = false;
  }
  if (allChecked) return true;
  if (noneChecked) return false;
  return "indeterminate";
};
