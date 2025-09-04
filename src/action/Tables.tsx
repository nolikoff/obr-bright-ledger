import
  Token
from "../metadataHelpers/TokenType";

import "../index.css";

import { 
  getPluginId,
} from "@/getPluginId";

import
  OBR, {
  Image,
  Player,
} from "@owlbear-rodeo/sdk";

import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";

import {
  Button,
} from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";

import {
  calculateNewHealth,
  calculateScaledHealthDiff,
} from "./healthCalculations";

import {
  Checkbox,
} from "@/components/ui/checkbox";

import {
  applyHealthDiffToItems,
  overwriteStats,
  DEFAULT_DAMAGE_SCALE,
  focusItem,
  getDamageScaleOption,
  getIncluded,
  handleTokenClicked,
  applyHealingValueToItems,
} from "./helpers";

import {
  cn,
} from "@/lib/utils";

import
  React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getNewStatValue,
  ItemMetadataName,
  isItemMetadataName,
  writeTokenValueToItem,
} from "@/statInputHelpers";

import
  StatStyledInput
from "./StatStyledInput";

import {
  Action,
  BulkEditorState,
} from "./types";

import
  Hidden
from "@/components/icons/Hidden";

import
  Visible
from "@/components/icons/Visible";

import
  HiddenHealth
from "@/components/icons/HiddenHealth";

import
  HealthBar
from "@/components/icons/HealthBar";

import
  HealthBarValues
from "@/components/icons/HealthBarValues";

import
  Swap
from "@/components/icons/Swap";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  SensorOptions,
  SensorDescriptor,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";

import {
  SmartMouseSensor,
} from "./SmartPointerSensor";

import {
  SortableTableRow,
} from "./SortableTableRow";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import
  ActionButton
from "./ActionButton";

import {
  ITEM_HEALTH_VISIBILITY_METADATA_ID,
  ITEM_GROUP_METADATA_ID,
} from "@/metadataHelpers/itemMetadataIds";

import {
  Input,
} from "@/components/ui/input";


export function TokensTable({
  appState,
  dispatch,
  tokens,
  setTokens,
  playerName,
  playerId,
  playerColor,
  playerRole,
  playerSelection,
  players,
  handleDragEnd,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerName: string;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  players: Player[];
  handleDragEnd: (event: DragEndEvent) => void;
}): JSX.Element {

  const tokenFilter = (token: Token) =>
    (playerRole === "PLAYER" && playerId === token.item.createdUserId && token.item.visible) ||
    (playerRole === "GM" && appState.group === token.group &&
      (appState.showItems === "ALL" ||
      (appState.showItems === "SELECTED" && appState.mostRecentSelection.includes(token.item.id)) ||
      (appState.showItems === "ADDED" && token.added))
    );

  const filteredTokens = tokens.filter(tokenFilter);
  
  const sensors = useSensors(
    useSensor(SmartMouseSensor, {
      activationConstraint: { distance: { y: 10 } },
    }),
  );

  return (
    <>
      {playerRole === "GM" && appState.operation === "NONE" && (
        <GmDefaultTable
          appState={appState}
          tokens={filteredTokens}
          setTokens={setTokens}
          playerName={playerName}
          playerId={playerId}
          playerColor={playerColor}
          playerSelection={playerSelection}
          players={players}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
      {playerRole === "GM" && appState.operation === "DAMAGE" && (
        <GmDamageTable
          appState={appState}
          dispatch={dispatch}
          tokens={filteredTokens}
          playerId={playerId}
          playerColor={playerColor}
          playerRole={playerRole}
          playerSelection={playerSelection}
          players={players}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
      {playerRole === "GM" && appState.operation === "HEALING" && (
        <GmHealingTable
          appState={appState}
          dispatch={dispatch}
          tokens={filteredTokens}
          playerId={playerId}
          playerColor={playerColor}
          playerRole={playerRole}
          playerSelection={playerSelection}
          players={players}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
      {playerRole === "GM" && appState.operation === "OVERWRITE" && (
        <GmOverwriteTable
          appState={appState}
          dispatch={dispatch}
          tokens={filteredTokens}
          setTokens={setTokens}
          playerId={playerId}
          playerColor={playerColor}
          playerRole={playerRole}
          playerSelection={playerSelection}
          players={players}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
      {playerRole === "PLAYER" && appState.operation === "NONE" && (
        <PlayerDefaultTable
          tokens={filteredTokens}
          setTokens={setTokens}
          playerSelection={playerSelection}
          sensors={sensors}
        />
      )}
      {playerRole === "PLAYER" && appState.operation === "DAMAGE" && (
        <PlayerDamageTable
          appState={appState}
          dispatch={dispatch}
          tokens={filteredTokens}
          playerSelection={playerSelection}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
      {playerRole === "PLAYER" && appState.operation === "HEALING" && (
        <PlayerHealingTable
          appState={appState}
          dispatch={dispatch}
          tokens={filteredTokens}
          playerSelection={playerSelection}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}
    </>
  );
}

function GmDefaultTable({
  appState,
  tokens,
  setTokens,
  playerName,
  playerId,
  playerColor,
  playerSelection,
  players,
  handleDragEnd,
  sensors,
}: {
  appState: BulkEditorState;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerName: string;
  playerId: string;
  playerColor: string;
  playerSelection: string[];
  players: Player[];
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col items-center justify-start">
        <DndContext
          sensors={sensors}
          modifiers={[restrictToFirstScrollableAncestor]}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tokens.map((token) => token.item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table tabIndex={-1}>
              <TableBody>
                {tokens.length === 0 && (
                  <NoTokensMessage
                    playerRole={"GM"}
                    appState={appState}
                  />
                )}
                {tokens.map((token, index, arr) => {
                  const included = getIncluded(
                    token.item.id,
                    appState.includedItems,
                  );

                  const lineColor = playerId === token.item.createdUserId ? playerColor : players.find((p) => p.id === token.item.createdUserId)?.color ?? "transparent";
                  const lineStyle = playerId === token.item.createdUserId ? "dotted" : (players.find((p) => p.id === token.item.createdUserId)?.role === "GM" ? "dotted" : "solid");

                  return (
                    <SortableTableRow
                      key={token.item.id}
                      id={token.item.id}
                      onKeyDown={() => {}}
                    >
                      <div
                        style={{
                          padding: "10px 15px 10px 15px",
                        }} 
                      >
                        <TableCell className="p-0">
                          <div
                            style={{
                              height: "72px",
                              paddingRight: "16px",
                              borderLeft: "4px " + lineStyle + " " + lineColor,
                            }}
                          ></div>
                        </TableCell>

                        <TableCell className="p-0">
                          <div className="grid gap-2 align-middle">
                            <div className="flex items-center">
                              <TokenTableCell
                                token={token}
                                faded={!included && appState.operation !== "NONE"}
                                playerSelection={playerSelection}
                              />
                              
                              <VisibilityButton
                                token={token}
                              />
                              
                              <GroupButton
                                token={token}
                                setTokens={setTokens}
                              />
                            </div>
                            <OwnerSelector
                              token={token}
                              playerId={playerId}
                              playerName={playerName}
                              players={players}
                            />
                          </div>
                        </TableCell>
                              
                        <TableCell 
                          style={{
                            padding: "0px 21px 0px 21px",
                          }}
                        ></TableCell>

                        <HealthVisibilityMenu token={token} setTokens={setTokens} />

                        <TableCell className="p-0">
                          <div className="grid justify-items-stretch gap-2 grid-template-columns-[1fr 1fr]">
                            <div className="col-span-2 flex items-center">
                              <StatInput
                                parentValue={token.health}
                                name={"HEALTH"}
                                updateHandler={(target) =>
                                  updateTokenStat(
                                    token.item.id,
                                    target,
                                    token.health,
                                    setTokens,
                                  )
                                }
                              />
                              <div className="text-center w-[8px]">
                                /
                              </div>
                              <StatInput
                                parentValue={token.maxHealth}
                                name={"MAX-HEALTH"}
                                updateHandler={(target) =>
                                  updateTokenStat(
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
                              name={"TEMP-HEALTH"}
                              updateHandler={(target) =>
                                updateTokenStat(
                                  token.item.id,
                                  target,
                                  token.tempHealth,
                                  setTokens,
                                )
                              }
                            />
                            <StatInput
                              parentValue={token.armorClass}
                              name={"ARMOR-CLASS"}
                              updateHandler={(target) =>
                                updateTokenStat(
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
                      <div
                        className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                        style={{
                          margin: "0px 15px 0px 15px",
                          borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                        }}
                      >
                      </div>
                    </SortableTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
      <ScrollBar orientation="horizontal" forceMount />
    </ScrollArea>
  );
}

const damageMultipliers = [
  String.fromCharCode(0x2573),
  String.fromCharCode(0xd7) + String.fromCharCode(0xbc),
  String.fromCharCode(0xd7) + String.fromCharCode(0xbd),
  String.fromCharCode(0xd7) + 1,
  String.fromCharCode(0xd7) + 2,
];

function GmDamageTable({
  appState,
  dispatch,
  tokens,
  playerId,
  playerColor,
  playerRole,
  playerSelection,
  players,
  handleDragEnd,
  sensors,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  players: Player[];
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {

  const [damageValue, setDamageValue] = useState<number>(appState.value ? appState.value : 0);

  useEffect(() => {
    setDamageValue(appState.value
      ? appState.value
      ?? damageValue
      : 0
    );
  }, [appState.value]);

  const toValidInt = (value: string): number => {
    const valueNum = Math.trunc(parseFloat(value));
    if (Number.isNaN(valueNum)) return 0;
    return valueNum;
  };

  const allIncluded = (checked: boolean): Map<string, boolean> => {
    let newIncludedMap = new Map<string, boolean>(appState.includedItems);

    for (let i = 0; i < tokens.length; i++) {
      newIncludedMap = newIncludedMap.set(tokens[i].item.id, checked)
    }

    return newIncludedMap;
  };

  return (
    <>
      <div 
        className="text-mirage-500 dark:text-mirage-400 w-full"
        style={{
          padding: "0px 15px 0px 15px",
        }}
      >
        <Table tabIndex={-1}>
          <TableRow
            className="flex"
            style={{
              backgroundColor: "initial",
              paddingBottom: "8px",
              border: "none",
            }}
          >
            <CheckboxTableHead
              included={allChecked(tokens, appState.includedItems)}
              onCheckedChange={(checked) => {
                dispatch({
                  type: "set-included-items",
                  includedItems: allIncluded(checked),
                })
              }}
            />

            <TableCell style={{padding: "0px 39px 0px 39px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[80px] p-0">
                  Multiplier
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                Damage Multiplier
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 8px 0px 8px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[60px] p-0">
                  Damage
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                Damage to Apply
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 5px 0px 5px"}}></TableCell> 
             
            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[90px] p-0">
                  HP
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                New Hit Points
              </TooltipContent>
            </Tooltip>
            
          </TableRow>
        </Table>
      </div>

      <ScrollArea
        className="h-full"
        // style={{
        //   padding: "0px 15px 0px 15px",
        // }}
      >
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="w-full">
            <DndContext
              sensors={sensors}
              modifiers={[restrictToFirstScrollableAncestor]}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tokens.map((token) => token.item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table tabIndex={-1}>
                  <TableBody>
                    {tokens.length === 0 && (
                      <NoTokensMessage
                        playerRole={"GM"}
                        appState={appState}
                      />
                    )}
                    {tokens.map((token, index, arr) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

                      const tokenColor = (playerId === token.item.createdUserId) ? playerColor : (players.find((p) => p.id === token.item.createdUserId)?.color??"transparent");
                      const tokenRole = (playerId === token.item.createdUserId) ? playerRole : (players.find((p) => p.id === token.item.createdUserId)?.role??"PLAYER");

                      const option = getDamageScaleOption(
                        token.item.id,
                        appState.damageScaleOptions,
                      );

                      const scaledDamage = calculateScaledHealthDiff(
                        included ? option : 0,
                        damageValue,
                      );

                      const [newHealth, newTempHealth] = calculateNewHealth(
                        token.health,
                        token.maxHealth,
                        token.tempHealth,
                        -1 * scaledDamage,
                      );

                      const nextDamageOption = () => {
                        dispatch({
                          type: "set-damage-scale-options",
                          damageScaleOptions: new Map(appState.damageScaleOptions).set(
                            token.item.id,
                            option < damageMultipliers.length - 1 ? option + 1 : option,
                          ),
                        });
                      };

                      const resetDamageOption = () => {
                        dispatch({
                          type: "set-damage-scale-options",
                          damageScaleOptions: new Map(appState.damageScaleOptions).set(
                            token.item.id,
                            DEFAULT_DAMAGE_SCALE,
                          ),
                        });
                      };

                      const previousDamageOption = () => {
                        dispatch({
                          type: "set-damage-scale-options",
                          damageScaleOptions: new Map(appState.damageScaleOptions).set(
                            token.item.id,
                            option > 1 ? option - 1 : option,
                          ),
                        });
                      };

                      return (
                        <SortableTableRow
                          key={token.item.id}
                          id={token.item.id}
                          onKeyDown={()=>{}}
                        >
                          <div
                            // style={{
                            //   padding: "10px 4px 10px 0px",
                            // }}
                            style={{
                              padding: "10px 15px 10px 15px",
                            }}
                            className={cn(
                              "flex",
                              {
                                "opacity-60": !included,
                              },
                            )}
                          >        
                            <CheckboxTableCell
                              included={included}
                              onCheckedChange={(checked) =>
                                dispatch({
                                  type: "set-included-items",
                                  includedItems: appState.includedItems.set(
                                    token.item.id,
                                    checked,
                                  ),
                                })
                              }
                            />

                            <span
                              className="align-middle flex items-center justify-center"
                              style={{
                                width: "22px",
                                fontSize: "10px",
                                padding: "0px 6px 0px 8px",
                                color: tokenColor,
                              }}
                            >
                              {tokenRole === "GM" ? '●' : '■'}
                            </span>

                            <TokenTableCell
                              token={token}
                              faded={false}
                              playerSelection={playerSelection}
                            />
                            
                            <TableCell
                              style={{
                                padding: "0px 8px 0px 8px"
                              }}
                            >
                              <div className="flex max-w-32 items-center justify-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="size-5 min-w-5 rounded-md"
                                      tabIndex={-1}
                                      size={"icon"}
                                      variant={"secondary"}
                                      onClick={(e) => {
                                        previousDamageOption();
                                        e.stopPropagation();
                                      }}
                                    >
                                      ←
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Decrease
                                  </TooltipContent>
                                </Tooltip>
                                <Button
                                  className="flex h-8 p-0 w-[40px] items-center justify-center text-lg font-medium"
                                  tabIndex={-1}
                                  variant={"ghost"}
                                  onClick={(e) => {
                                    resetDamageOption();
                                    e.stopPropagation();
                                  }}
                                >
                                  {damageMultipliers[option]}
                                </Button>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="size-5 min-w-5 rounded-md"
                                      tabIndex={-1}
                                      size={"icon"}
                                      variant={"secondary"}
                                      onClick={(e) => {
                                        nextDamageOption();
                                        e.stopPropagation();
                                      }}
                                    >
                                      →
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Increase
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            
                            <div className="flex pl-2" 
                              style={{ 
                                gap: "10px",
                                // width: "136px",
                              }}
                            >
        
                              <div className="flex h-[32px] w-[60px] items-center justify-center rounded-md text-sm">
                                {scaledDamage}
                              </div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[90px] items-center justify-center rounded-md text-sm">
                                    {newHealth.toString() + (newTempHealth > 0 ? ` (${newTempHealth})` : "")}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={-5}>
                                  {token.health + (token.tempHealth > 0 ? ` (${token.tempHealth})` : "")}
                                </TooltipContent>
                              </Tooltip>
                  
                            </div>                          
                          </div>
                          <div
                            className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                            style={{
                              margin: "0px 15px 0px 15px",
                              borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                            }}
                          >
                          </div>
                        </SortableTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <ScrollBar orientation="horizontal" forceMount />
      </ScrollArea>

      <div
        className="flex w-full items-center gap-2"
        style={{
          padding: "8px 15px 0px 15px",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              // value={damageValue}
              value={
                damageValue > 9999
                ? 9999
                : (
                  damageValue >= 0
                  ? damageValue
                  : ""
                )
              }
              className="bg-mirage-50 dark:bg-mirage-900 h-[32px] text-center"
              style={{
                // width: `${Math.max(String(damageValue).length, 4)*14}px`,
                width: "60px",
              }}
              onChange = {(e) => 
                setDamageValue(toValidInt(e.target.value))
              }
            />
          </TooltipTrigger>
          <TooltipContent>
            Damage Roll
          </TooltipContent>
        </Tooltip>
        <ActionButton
          label={"Apply Damage"}
          buttonProps={{
            onClick: () => {
              applyHealthDiffToItems(
                -1 * damageValue,
                appState.includedItems,
                appState.damageScaleOptions,
                tokens,
              );
              dispatch({
                type: "set-included-items",
                includedItems: new Map(),
              });
            },
          }}
        ></ActionButton>
      </div>
    </>
  );
}

function GmHealingTable({
  appState,
  dispatch,
  tokens,
  playerId,
  playerColor,
  playerRole,
  playerSelection,
  players,
  handleDragEnd,
  sensors,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  players: Player[];
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {
  
  const [healingValue, setHealingValue] = useState<number>(appState.value ? appState.value : 0);

  useEffect(() => {
    setHealingValue(appState.value
      ? appState.value
      ?? healingValue
      : 0
    );
  }, [appState.value]);

  const toValidInt = (value: string): number => {
    const valueNum = Math.trunc(parseFloat(value));
    if (Number.isNaN(valueNum)) return 0;
    return valueNum;
  };

  const allIncluded = (checked: boolean): Map<string, boolean> => {
    let newIncludedMap = new Map<string, boolean>(appState.includedItems);

    for (let i = 0; i < tokens.length; i++) {
      newIncludedMap = newIncludedMap.set(tokens[i].item.id, checked)
    }

    return newIncludedMap;
  };

  return (
    <>
      <div 
        className="text-mirage-500 dark:text-mirage-400 w-full"
        style={{
          padding: "0px 15px 0px 15px",
        }}
      >
        <Table tabIndex={-1}>
          <TableRow
            className="flex"
            style={{
              backgroundColor: "initial",
              paddingBottom: "8px",
              border: "none",
            }}
          >
            <CheckboxTableHead
              included={allChecked(tokens, appState.includedItems)}
              onCheckedChange={(checked) => {
                dispatch({
                  type: "set-included-items",
                  includedItems: allIncluded(checked),
                })
              }}
            />

            <TableCell style={{padding: "0px 39px 0px 39px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[86px] p-0">
                  Type
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                Type of Hit Points for Healing
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 8px 0px 8px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[96px] p-0">
                  HP / Max
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                New Hit Points / Hit Points Maximum
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 5px 0px 5px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[48px] p-0">
                  Temp
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                New Temporary Hit Points
              </TooltipContent>
            </Tooltip>

          </TableRow>
        </Table>
      </div>

      <ScrollArea
        className="h-full"
        // style={{
        //   padding: "0px 15px 0px 15px",
        // }}
      >
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="w-full">
            <DndContext
              sensors={sensors}
              modifiers={[restrictToFirstScrollableAncestor]}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tokens.map((token) => token.item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table tabIndex={-1}>
                  <TableBody>
                    {tokens.length === 0 && (
                      <NoTokensMessage
                        playerRole={"GM"}
                        appState={appState}
                      />
                    )}
                    {tokens.map((token, index, arr) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

                      const tokenColor = (playerId === token.item.createdUserId) ? playerColor : (players.find((p) => p.id === token.item.createdUserId)?.color??"transparent");
                      const tokenRole = (playerId === token.item.createdUserId) ? playerRole : (players.find((p) => p.id === token.item.createdUserId)?.role??"PLAYER");

                      const healing = included ? healingValue : 0;

                      const [healingOption, setHealingOption] = useState<"HP" | "TEMP-HP">("HP");

                      let newHealth = healingOption === "HP" ? token.health + healing : token.health;
                      if (newHealth > token.maxHealth) newHealth = token.maxHealth;

                      let newTempHealth = healingOption === "TEMP-HP" ? token.tempHealth + healing : token.tempHealth;                     
                      if (newTempHealth > 999) newTempHealth = 999; 

                      return (
                        <SortableTableRow
                          key={token.item.id}
                          id={token.item.id}
                          onKeyDown={()=>{}}
                        >
                          <div
                            // style={{
                            //   padding: "10px 4px 10px 0px",
                            // }}
                            style={{
                              padding: "10px 15px 10px 15px",
                            }}
                            className={cn(
                              "flex",
                              {
                                "opacity-60": !included,
                              },
                            )}
                          >        
                            <CheckboxTableCell
                              included={included}
                              onCheckedChange={(checked) =>
                                dispatch({
                                  type: "set-included-items",
                                  includedItems: appState.includedItems.set(
                                    token.item.id,
                                    checked,
                                  ),
                                })
                              }
                            />

                            <span
                              className="align-middle flex items-center justify-center"
                              style={{
                                width: "22px",
                                fontSize: "10px",
                                padding: "0px 6px 0px 8px",
                                color: tokenColor,
                              }}
                            >
                              {tokenRole === "GM" ? '●' : '■'}
                            </span>

                            <TokenTableCell
                              token={token}
                              faded={false}
                              playerSelection={playerSelection}
                            />
                            
                            <TableCell
                              className="flex items-center align-middle justify-center"
                              style={{
                                padding: "0px 8px 0px 8px"
                              }}
                            >
                                <Select
                                  value={healingOption}
                                  onValueChange={async (value) => {
                                    if(value == "HP" || value == "TEMP-HP") setHealingOption(value);
                                    dispatch({
                                      type: "set-healing-options",
                                      healingOptions: new Map(appState.healingOptions).set(
                                        token.item.id,
                                        value === "HP" ? true : false,
                                      ),
                                    });
                                  }}
                                >
                                  <SelectTrigger
                                    className="h-[28px]"
                                    style={{
                                      width: "86px",
                                      fontSize: "12px",
                                      lineHeight: "12px"
                                    }}
                                  >
                                    <SelectValue/>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem key="HP" value="HP">HP</SelectItem>
                                      <SelectItem key="TEMP-HP" value="TEMP-HP">Temp HP</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                            </TableCell>
                            
                            <div className="flex pl-2" 
                              style={{ 
                                gap: "10px",
                                // width: "136px",
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[96px] items-center justify-center rounded-md text-sm">
                                    {`${newHealth} / ${token.maxHealth}`}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={-5}>
                                  {`${token.health} / ${token.maxHealth}`}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[48px] items-center justify-center rounded-md text-sm">
                                    {`(${newTempHealth})`}
                                  </div>
                                 </TooltipTrigger>
                                <TooltipContent sideOffset={-5}>
                                  {`(${token.tempHealth})`}
                                </TooltipContent>
                              </Tooltip>
                            </div>                          
                          </div>
                          <div
                            className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                            style={{
                              margin: "0px 15px 0px 15px",
                              borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                            }}
                          >
                          </div>
                        </SortableTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <ScrollBar orientation="horizontal" forceMount />
      </ScrollArea>

      <div
        className="flex w-full items-center gap-2"
        style={{
          padding: "8px 15px 0px 15px",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              // value={healingValue}
              value={
                healingValue > 9999
                ? 9999
                : (
                  healingValue >= 0
                  ? healingValue
                  : ""
                )
              }
              className="bg-mirage-50 dark:bg-mirage-900 h-[32px] text-center"
              style={{
                // width: `${Math.max(String(healingValue).length, 4)*14}px`,
                width: "60px",
              }}
              onChange = {(e) =>
                setHealingValue(toValidInt(e.target.value))
              }
            />
          </TooltipTrigger>
          <TooltipContent>
            Hit Points for Healing
          </TooltipContent>
        </Tooltip>
        <ActionButton
          label={"Apply Healing"}
          buttonProps={{
            onClick: () => {
              applyHealingValueToItems(
                healingValue,
                appState.includedItems,
                appState.healingOptions,
                tokens,
              );
              dispatch({
                type: "set-included-items",
                includedItems: new Map(),
              });
            },
          }}
        ></ActionButton>
      </div>
    </>
  );
}

function GmOverwriteTable({
  appState,
  dispatch,
  tokens,
  setTokens,
  playerId,
  playerColor,
  playerRole,
  playerSelection,
  players,
  handleDragEnd,
  sensors,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  players: Player[];
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {

  const toValidIntString = (value: string): string => {
    const valueNum = Math.trunc(parseFloat(value));
    if (Number.isNaN(valueNum)) return "";
    return valueNum.toString();
  };

  const allIncluded = (checked: boolean): Map<string, boolean> => {
    let newIncludedMap = new Map<string, boolean>(appState.includedItems);

    for (let i = 0; i < tokens.length; i++) {
      newIncludedMap = newIncludedMap.set(tokens[i].item.id, checked)
    }

    return newIncludedMap;
  };

  return (
    <>
      <div
        className="text-mirage-500 dark:text-mirage-400"
        style={{
          padding: "0px 15px 0px 15px",
        }}
      >
        <Table tabIndex={-1}>
          <TableRow
            className="flex"
            style={{
              backgroundColor: "initial",
              paddingBottom: "8px",
              border: "none",
            }}
          >
            <CheckboxTableHead
              included={allChecked(tokens, appState.includedItems)}
              onCheckedChange={(checked) => {
                dispatch({
                  type: "set-included-items",
                  includedItems: allIncluded(checked),
                })
              }}
            />

            <TableCell style={{padding: "0px 111px 0px 111px"}}></TableCell>


            <VisibilityOverwriteMenu
              appState={appState}
              tokens={tokens}
            />

            <GroupOverwriteButton
              appState={appState}
              dispatch={dispatch}
              tokens={tokens}
            />

            <HealthVisibilityOverwriteMenu
              appState={appState}
              tokens={tokens}
            />
            
          </TableRow>
        </Table>
      </div>

      <ScrollArea className="h-full">
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="w-full">
            <DndContext
              sensors={sensors}
              modifiers={[restrictToFirstScrollableAncestor]}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tokens.map((token) => token.item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table tabIndex={-1}>
                  <TableBody>
                    {tokens.length === 0 && (
                      <NoTokensMessage
                        playerRole={"GM"}
                        appState={appState}
                      />
                    )}
                    {tokens.map((token, index, arr) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

                      const tokenColor = (playerId === token.item.createdUserId) ? playerColor : (players.find((p) => p.id === token.item.createdUserId)?.color??"transparent");
                      const tokenRole = (playerId === token.item.createdUserId) ? playerRole : (players.find((p) => p.id === token.item.createdUserId)?.role??"PLAYER");


                      return (
                        <SortableTableRow
                          key={token.item.id}
                          id={token.item.id}
                          onKeyDown={ () => {} }
                        >
                          <div
                            className={cn(
                              "flex",
                              {
                                "opacity-60": !included,
                              },
                            )}
                            // style={{
                            //   padding: "10px 4px 10px 4px",
                            // }}
                            style={{
                              padding: "10px 15px 10px 15px",
                            }}
                          >        
                            <CheckboxTableCell
                              included={included}
                              onCheckedChange={(checked) =>
                                dispatch({
                                  type: "set-included-items",
                                  includedItems: appState.includedItems.set(
                                    token.item.id,
                                    checked,
                                  ),
                                })
                              }
                            />

                            <span
                              className="align-middle flex items-center justify-center"
                              style={{
                                width: "22px",
                                fontSize: "10px",
                                padding: "0px 6px 0px 8px",
                                color: tokenColor,
                              }}
                            >
                              {tokenRole === "GM" ? '●' : '■'}
                            </span>

                            <TokenTableCell
                              token={token}
                              faded={false}
                              playerSelection={playerSelection}
                            />

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1px 4px 1px 4px",
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {token.item.visible ? (
                                    <Visible width="14px" height="14px"/>
                                  ) : (
                                    <Hidden width="14px" height="14px"/>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {token.item.visible ? "Visible" : "Hidden"}
                                </TooltipContent>
                              </Tooltip>

                              {token.healthVisibility === "HIDDEN" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HiddenHealth width="14px" height="14px"/>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    "Hidden Health"
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {token.healthVisibility === "BAR" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HealthBar width="14px" height="14px"/>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    "Health Bar"
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {token.healthVisibility === "BAR-VALUE" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HealthBarValues width="14px" height="14px"/>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    "Health Bar with Values"
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <TokenStatsQuartet
                              token={token}
                              setTokens={setTokens}
                            />

                          </div>
                          <div
                            className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                            style={{
                              margin: "0px 15px 0px 15px",
                              borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                            }}
                          >
                          </div>
                        </SortableTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <ScrollBar orientation="horizontal" forceMount />
      </ScrollArea>
      <TableCell
        style={{
          padding: "8px 15px 0px 15px",
        }}
      >
        <div 
          className="flex gap-2"
        >
          <div
            className="flex items-center justify-between"
          >
            <StatStyledInput
              name="HEALTH"
              inputProps={{
                value:
                  parseFloat(appState.statOverwrites.hitPoints) > 9999
                  ? "9999"
                  : (
                    parseFloat(appState.statOverwrites.hitPoints) >= 0
                    ? appState.statOverwrites.hitPoints
                    : ""
                  ),
                onChange: (e) =>
                  dispatch({
                    type: "set-hit-points-overwrite",
                    hitPointsOverwrite: e.target.value,
                  }),
                onBlur: (e) =>
                  dispatch({
                    type: "set-hit-points-overwrite",
                    hitPointsOverwrite: toValidIntString(e.target.value),
                  }),
                className: "w-full h-[34px]",
                placeholder: "",
              }}
            />
            <div
              style={{
                textAlign: "center",
                width: "8px",
              }}
            >
              {"/"}
            </div>
            <StatStyledInput
              name="MAX-HEALTH"
              inputProps={{
                value:
                  parseFloat(appState.statOverwrites.maxHitPoints) > 9999
                  ? "9999"
                  : (
                    parseFloat(appState.statOverwrites.maxHitPoints) >= 0
                    ? appState.statOverwrites.maxHitPoints
                    : ""
                  ),
                onChange: (e) =>
                  dispatch({
                    type: "set-max-hit-points-overwrite",
                    maxHitPointsOverwrite: e.target.value,
                  }),
                onBlur: (e) =>
                  dispatch({
                    type: "set-max-hit-points-overwrite",
                    maxHitPointsOverwrite: toValidIntString(e.target.value),
                  }),
                className: "w-full h-[34px]",
                placeholder: "",
              }}
            />
          </div>
          <StatStyledInput
            name="TEMP-HEALTH"
            inputProps={{
              value:
                parseFloat(appState.statOverwrites.tempHitPoints) > 999
                ? "999"
                : (
                  parseFloat(appState.statOverwrites.tempHitPoints) >= 0
                  ? appState.statOverwrites.tempHitPoints
                  : ""
                ),
              onChange: (e) =>
                dispatch({
                  type: "set-temp-hit-points-overwrite",
                  tempHitPointsOverwrite: e.target.value,
                }),
              onBlur: (e) =>
                dispatch({
                  type: "set-temp-hit-points-overwrite",
                  tempHitPointsOverwrite: toValidIntString(e.target.value),
                }),
              className: "w-full h-[34px]",
              placeholder: "",
            }}
          />
          <StatStyledInput
            name="ARMOR-CLASS"
            inputProps={{
              value:
                parseFloat(appState.statOverwrites.armorClass) > 999
                ? "999"
                : (
                  parseFloat(appState.statOverwrites.armorClass) >= 0
                  ? appState.statOverwrites.armorClass
                  : ""
                ),
              onChange: (e) =>
                dispatch({
                  type: "set-armor-class-overwrite",
                  armorClassOverwrite: e.target.value,
                }),
              onBlur: (e) =>
                dispatch({
                  type: "set-armor-class-overwrite",
                  armorClassOverwrite: toValidIntString(e.target.value),
                }),
              className: "w-full h-[34px]",
              placeholder: "",
            }}
          />
          <ActionButton
            label={"Overwrite"}
            buttonProps={{
              onClick: () => {
                overwriteStats(
                  appState.statOverwrites,
                  appState.includedItems,
                  tokens,
                );
                dispatch({ 
                  type: "clear-stat-overwrites" 
                });
                dispatch({
                  type: "set-included-items",
                  includedItems: new Map(),
                });
              },
            }}
          ></ActionButton>
        </div>
      </TableCell>
    </>
  );
}

function PlayerDefaultTable({
  tokens,
  setTokens,
  playerSelection,
  sensors,
}: {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerSelection: string[];
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col items-center justify-start gap-2">
        <div className="w-full">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToFirstScrollableAncestor]}
            collisionDetection={closestCenter}
          >
            <Table tabIndex={-1}>
              <TableBody>
                {tokens.length === 0 && (
                  <NoTokensMessage
                    playerRole={"PLAYER"}
                  />
                )}
                {tokens.map((token, index, arr) => {
                  return (
                    <SortableTableRow
                      key={token.item.id}
                      id={token.item.id}
                      onKeyDown={() => {}}
                    >
                      <div
                        style={{
                          padding: "10px 15px 10px 15px",
                        }} 
                      >        
                        <TokenTableCell
                          token={token}
                          faded={false}
                          playerSelection={playerSelection}
                        />

                        <TableCell style={{ padding: "0px 0px 0px 2px"}}></TableCell>

                        <TokenStatsQuartet
                          token={token}
                          setTokens={setTokens}
                          width="59px"
                        />

                      </div>
                      <div
                        className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                        style={{
                          margin: "0px 15px 0px 15px",
                          borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                        }}
                      ></div>
                    </SortableTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DndContext>
          </div>
      </div>
      <ScrollBar orientation="horizontal" forceMount />
    </ScrollArea>
  );
}

function PlayerDamageTable({
  appState,
  dispatch,
  tokens,
  playerSelection,
  handleDragEnd,
  sensors,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  playerSelection: string[];
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {

  const [damageValue, setDamageValue] = useState<number>(appState.value ? appState.value : 0);

  useEffect(() => {
    setDamageValue(appState.value
      ? appState.value
      ?? damageValue
      : 0
    );
  }, [appState.value]);

  const toValidInt = (value: string): number => {
    const valueNum = Math.trunc(parseFloat(value));
    if (Number.isNaN(valueNum)) return 0;
    return valueNum;
  };

  const allIncluded = (checked: boolean): Map<string, boolean> => {
    let newIncludedMap = new Map<string, boolean>(appState.includedItems);

    for (let i = 0; i < tokens.length; i++) {
      newIncludedMap = newIncludedMap.set(tokens[i].item.id, checked)
    }

    return newIncludedMap;
  };

  return (
    <>
      <div 
        className="text-mirage-500 dark:text-mirage-400 w-full"
        style={{
          padding: "0px 15px 0px 15px",
        }}
      >
        <Table tabIndex={-1}>
          <TableRow
            className="flex"
            style={{
              backgroundColor: "initial",
              paddingBottom: "8px",
              border: "none",
            }}
          >
            <CheckboxTableHead
              included={allChecked(tokens, appState.includedItems)}
              onCheckedChange={(checked) => {
                dispatch({
                  type: "set-included-items",
                  includedItems: allIncluded(checked),
                })
              }}
            />

            <TableCell style={{padding: "0px 29px 0px 29px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[80px] p-0">
                  Multiplier
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                Damage Multiplier
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 5px 0px 5px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead
                  className="flex items-center align-middle justify-center h-[32px] p-0"
                  style={{
                    width: "52px",
                  }}
                >
                  Damage
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                Damage to Apply
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 5px 0px 5px"}}></TableCell> 
             
            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead
                  className="flex items-center align-middle justify-center h-[32px] p-0"
                  style={{
                    width: "80px",
                  }}
                >
                  HP
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                New Hit Points
              </TooltipContent>
            </Tooltip>
            
          </TableRow>
        </Table>
      </div>

      <ScrollArea
        className="h-full"
        // style={{
        //   padding: "0px 15px 0px 15px",
        // }}
      >
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="w-full">
            <DndContext
              sensors={sensors}
              modifiers={[restrictToFirstScrollableAncestor]}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tokens.map((token) => token.item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table tabIndex={-1}>
                  <TableBody>
                    {tokens.length === 0 && (
                      <NoTokensMessage
                        playerRole={"PLAYER"}
                      />
                    )}
                    {tokens.map((token, index, arr) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

                      const option = getDamageScaleOption(
                        token.item.id,
                        appState.damageScaleOptions,
                      );

                      const scaledDamage = calculateScaledHealthDiff(
                        included ? option : 0,
                        damageValue,
                      );

                      const [newHealth, newTempHealth] = calculateNewHealth(
                        token.health,
                        token.maxHealth,
                        token.tempHealth,
                        -1 * scaledDamage,
                      );

                      const nextDamageOption = () => {
                        dispatch({
                          type: "set-damage-scale-options",
                          damageScaleOptions: new Map(appState.damageScaleOptions).set(
                            token.item.id,
                            option < damageMultipliers.length - 1 ? option + 1 : option,
                          ),
                        });
                      };

                      const resetDamageOption = () => {
                        dispatch({
                          type: "set-damage-scale-options",
                          damageScaleOptions: new Map(appState.damageScaleOptions).set(
                            token.item.id,
                            DEFAULT_DAMAGE_SCALE,
                          ),
                        });
                      };

                      const previousDamageOption = () => {
                        dispatch({
                          type: "set-damage-scale-options",
                          damageScaleOptions: new Map(appState.damageScaleOptions).set(
                            token.item.id,
                            option > 1 ? option - 1 : option,
                          ),
                        });
                      };

                      return (
                        <SortableTableRow
                          key={token.item.id}
                          id={token.item.id}
                          onKeyDown={()=>{}}
                        >
                          <div
                            // style={{
                            //   padding: "10px 4px 10px 0px",
                            // }}
                            style={{
                              padding: "10px 15px 10px 15px",
                            }}
                            className={cn(
                              "flex",
                              {
                                "opacity-60": !included,
                              },
                            )}
                          >        
                            <CheckboxTableCell
                              included={included}
                              onCheckedChange={(checked) =>
                                dispatch({
                                  type: "set-included-items",
                                  includedItems: appState.includedItems.set(
                                    token.item.id,
                                    checked,
                                  ),
                                })
                              }
                            />

                            <TableCell style={{ padding: "0px 0px 0px 8px"}}></TableCell>

                            <TokenTableCell
                              token={token}
                              faded={false}
                              playerSelection={playerSelection}
                            />
                            
                            <TableCell
                              style={{
                                padding: "0px 5px 0px 2px"
                              }}
                            >
                              <div className="flex max-w-32 items-center justify-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="size-5 min-w-5 rounded-md"
                                      tabIndex={-1}
                                      size={"icon"}
                                      variant={"secondary"}
                                      onClick={(e) => {
                                        previousDamageOption();
                                        e.stopPropagation();
                                      }}
                                    >
                                      ←
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Decrease
                                  </TooltipContent>
                                </Tooltip>
                                <Button
                                  className="flex h-8 p-0 items-center justify-center text-lg font-medium"
                                  style={{
                                    width: "40px",
                                    fontSize: "16px"
                                  }}
                                  tabIndex={-1}
                                  variant={"ghost"}
                                  onClick={(e) => {
                                    resetDamageOption();
                                    e.stopPropagation();
                                  }}
                                >
                                  {damageMultipliers[option]}
                                </Button>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="size-5 min-w-5 rounded-md"
                                      tabIndex={-1}
                                      size={"icon"}
                                      variant={"secondary"}
                                      onClick={(e) => {
                                        nextDamageOption();
                                        e.stopPropagation();
                                      }}
                                    >
                                      →
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Increase
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            
                            <div className="flex" 
                              style={{ 
                                gap: "10px",
                                paddingLeft: "5px",
                                // width: "136px",
                              }}
                            >
        
                              <div
                                className="flex h-[32px] items-center justify-center rounded-md text-sm"
                                style={{
                                  width: "52px",
                                }}
                              >
                                {scaledDamage}
                              </div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex h-[32px] items-center justify-center rounded-md text-sm"
                                    style={{
                                      width: "80px",
                                    }}
                                  >
                                    {newHealth.toString() + (newTempHealth > 0 ? ` (${newTempHealth})` : "")}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={-5}>
                                  {token.health + (token.tempHealth > 0 ? ` (${token.tempHealth})` : "")}
                                </TooltipContent>
                              </Tooltip>
                  
                            </div>                          
                          </div>
                          <div
                            className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                            style={{
                              margin: "0px 15px 0px 15px",
                              borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                            }}
                          >
                          </div>
                        </SortableTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <ScrollBar orientation="horizontal" forceMount />
      </ScrollArea>

      <div
        className="flex w-full items-center gap-2"
        style={{
          padding: "8px 15px 0px 15px",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              // value={damageValue}
              value={
                damageValue > 9999
                ? 9999
                : (
                  damageValue >= 0
                  ? damageValue
                  : ""
                )
              }
              className="bg-mirage-50 dark:bg-mirage-900 h-[32px] text-center"
              style={{
                // width: `${Math.max(String(damageValue).length, 4)*14}px`,
                width: "60px",
              }}
              onChange = {(e) => 
                setDamageValue(toValidInt(e.target.value))
              }
            />
          </TooltipTrigger>
          <TooltipContent>
            Damage Roll
          </TooltipContent>
        </Tooltip>
        <ActionButton
          label={"Apply Damage"}
          buttonProps={{
            onClick: () => {
              applyHealthDiffToItems(
                -1 * damageValue,
                appState.includedItems,
                appState.damageScaleOptions,
                tokens,
              );
              dispatch({
                type: "set-included-items",
                includedItems: new Map(),
              });
            },
          }}
        ></ActionButton>
      </div>
    </>
  );
}

function PlayerHealingTable({
  appState,
  dispatch,
  tokens,
  playerSelection,
  handleDragEnd,
  sensors,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  playerSelection: string[];
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}): JSX.Element {
  
  const [healingValue, setHealingValue] = useState<number>(appState.value ? appState.value : 0);

  useEffect(() => {
    setHealingValue(appState.value
      ? appState.value
      ?? healingValue
      : 0
    );
  }, [appState.value]);

  const toValidInt = (value: string): number => {
    const valueNum = Math.trunc(parseFloat(value));
    if (Number.isNaN(valueNum)) return 0;
    return valueNum;
  };

  const allIncluded = (checked: boolean): Map<string, boolean> => {
    let newIncludedMap = new Map<string, boolean>(appState.includedItems);

    for (let i = 0; i < tokens.length; i++) {
      newIncludedMap = newIncludedMap.set(tokens[i].item.id, checked)
    }

    return newIncludedMap;
  };

  return (
    <>
      <div 
        className="text-mirage-500 dark:text-mirage-400 w-full"
        style={{
          padding: "0px 15px 0px 15px",
        }}
      >
        <Table tabIndex={-1}>
          <TableRow
            className="flex"
            style={{
              backgroundColor: "initial",
              paddingBottom: "8px",
              border: "none",
            }}
          >
            <CheckboxTableHead
              included={allChecked(tokens, appState.includedItems)}
              onCheckedChange={(checked) => {
                dispatch({
                  type: "set-included-items",
                  includedItems: allIncluded(checked),
                })
              }}
            />

            <TableCell style={{padding: "0px 29px 0px 29px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[86px] p-0">
                  Type
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                Type of Hit Points for Healing
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 5px 0px 5px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[86px] p-0">
                  HP / Max
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                New Hit Points / Hit Points Maximum
              </TooltipContent>
            </Tooltip>

            <TableCell style={{padding: "0px 5px 0px 5px"}}></TableCell> 

            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="flex items-center align-middle justify-center h-[32px] w-[40px] p-0">
                  Temp
                </TableHead>
              </TooltipTrigger>
              <TooltipContent sideOffset={-3}>
                New Temporary Hit Points
              </TooltipContent>
            </Tooltip>

          </TableRow>
        </Table>
      </div>

      <ScrollArea
        className="h-full"
        // style={{
        //   padding: "0px 15px 0px 15px",
        // }}
      >
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="w-full">
            <DndContext
              sensors={sensors}
              modifiers={[restrictToFirstScrollableAncestor]}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tokens.map((token) => token.item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table tabIndex={-1}>
                  <TableBody>
                    {tokens.length === 0 && (
                      <NoTokensMessage
                        playerRole={"PLAYER"}
                      />
                    )}
                    {tokens.map((token, index, arr) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

                      const healing = included ? healingValue : 0;

                      const [healingOption, setHealingOption] = useState<"HP" | "TEMP-HP">("HP");

                      let newHealth = healingOption === "HP" ? token.health + healing : token.health;
                      if (newHealth > token.maxHealth) newHealth = token.maxHealth;

                      let newTempHealth = healingOption === "TEMP-HP" ? token.tempHealth + healing : token.tempHealth;
                      if (newTempHealth > 999) newTempHealth = 999;   

                      return (
                        <SortableTableRow
                          key={token.item.id}
                          id={token.item.id}
                          onKeyDown={()=>{}}
                        >
                          <div
                            // style={{
                            //   padding: "10px 4px 10px 0px",
                            // }}
                            style={{
                              padding: "10px 15px 10px 15px",
                            }}
                            className={cn(
                              "flex",
                              {
                                "opacity-60": !included,
                              },
                            )}
                          >        
                            <CheckboxTableCell
                              included={included}
                              onCheckedChange={(checked) =>
                                dispatch({
                                  type: "set-included-items",
                                  includedItems: appState.includedItems.set(
                                    token.item.id,
                                    checked,
                                  ),
                                })
                              }
                            />

                            <TableCell style={{ padding: "0px 0px 0px 8px"}}></TableCell>

                            <TokenTableCell
                              token={token}
                              faded={false}
                              playerSelection={playerSelection}
                            />
                            
                            <TableCell
                              className="flex items-center align-middle justify-center"
                              style={{
                                padding: "0px 5px 0px 2px"
                              }}
                            >
                                <Select
                                  value={healingOption}
                                  onValueChange={async (value) => {
                                    if(value == "HP" || value == "TEMP-HP") setHealingOption(value);
                                    dispatch({
                                      type: "set-healing-options",
                                      healingOptions: new Map(appState.healingOptions).set(
                                        token.item.id,
                                        value === "HP" ? true : false,
                                      ),
                                    });
                                  }}
                                >
                                  <SelectTrigger
                                    className="h-[28px]"
                                    style={{
                                      width: "86px",
                                      fontSize: "12px",
                                      lineHeight: "12px"
                                    }}
                                  >
                                    <SelectValue/>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem key="HP" value="HP">HP</SelectItem>
                                      <SelectItem key="TEMP-HP" value="TEMP-HP">Temp HP</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                            </TableCell>
                            
                            <div className="flex" 
                              style={{ 
                                gap: "10px",
                                paddingLeft: "5px",
                                // width: "136px",
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[86px] items-center justify-center rounded-md text-sm">
                                    {`${newHealth} / ${token.maxHealth}`}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={-5}>
                                  {`${token.health} / ${token.maxHealth}`}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[40px] items-center justify-center rounded-md text-sm">
                                    {`(${newTempHealth})`}
                                  </div>
                                 </TooltipTrigger>
                                <TooltipContent sideOffset={-5}>
                                  {`(${token.tempHealth})`}
                                </TooltipContent>
                              </Tooltip>
                            </div>                          
                          </div>
                          <div
                            className="border-mirage-300 transition-colors hover:bg-mirage-50/70 dark:border-mirage-800"
                            style={{
                              margin: "0px 15px 0px 15px",
                              borderBottomWidth: index !== arr.length - 1 ? "1px" : "none",
                            }}
                          >
                          </div>
                        </SortableTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <ScrollBar orientation="horizontal" forceMount />
      </ScrollArea>

      <div
        className="flex w-full items-center gap-2"
        style={{
          padding: "8px 15px 0px 15px",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              // value={healingValue}
              value={
                healingValue > 9999
                ? 9999
                : (
                  healingValue >= 0
                  ? healingValue
                  : ""
                )
              }
              className="bg-mirage-50 dark:bg-mirage-900 h-[32px] text-center"
              style={{
                // width: `${Math.max(String(healingValue).length, 4)*14}px`,
                width: "60px",
              }}
              onChange = {(e) =>
                setHealingValue(toValidInt(e.target.value))
              }
            />
          </TooltipTrigger>
          <TooltipContent>
            Hit Points for Healing
          </TooltipContent>
        </Tooltip>
        <ActionButton
          label={"Apply Healing"}
          buttonProps={{
            onClick: () => {
              applyHealingValueToItems(
                healingValue,
                appState.includedItems,
                appState.healingOptions,
                tokens,
              );
              dispatch({
                type: "set-included-items",
                includedItems: new Map(),
              });
            },
          }}
        ></ActionButton>
      </div>
    </>
  );
}

function NoTokensMessage({
  playerRole,
  appState = false,
}: {
  playerRole: "PLAYER" | "GM";
  appState?: BulkEditorState | false;
}): JSX.Element {
  return (
    <div
      style={{
        padding: "10px 15px 10px 15px",
      }} 
    >       
      {playerRole === "GM" ? (
        <p className="text-muted-foreground text-sm">
          { appState && appState.showItems === "ALL" && (
            <>
              This group has no tokens right now.<br/>
              When you add a
              <span style={{ fontStyle: "italic"}}>
                { appState.group === "COMPANIONS" ? " Companions " : " Strangers " }
              </span>
              token to the map or move a token to 
              <span style={{ fontStyle: "italic"}}>
                { appState.group === "COMPANIONS" ? " Companions" : " Strangers" }
              </span>
              , it will appear here.
            </>
          )}
          { appState && appState.showItems === "SELECTED" && (
            <>
              This group has no tokens right now.<br/>
              When you select a
              <span style={{ fontStyle: "italic"}}>
                { appState.group === "COMPANIONS" ? " Companions " : " Strangers " }
              </span>
              token on the map or move a selected token to 
              <span style={{ fontStyle: "italic"}}>
                { appState.group === "COMPANIONS" ? " Companions" : " Strangers" }
              </span>
              , it will appear here.
            </>
          )}
          { appState && appState.showItems === "ADDED" && (
            <>
              This group has no tokens right now.<br/>
              When you add a
              <span style={{ fontStyle: "italic"}}>
                { appState.group ===  "COMPANIONS" ? " Companions " : " Strangers " }
              </span>
              token to the view or move an added token to 
              <span style={{ fontStyle: "italic"}}>
                { appState.group === "COMPANIONS" ? " Companions" : " Strangers" }
              </span>
              , it will appear here.
            </>
          )}
        </p>
      ) : (   
        <p className="text-muted-foreground text-sm">
          You don’t own any tokens yet. <br/>
          When you become the owner of a token, it will appear here.
        </p>
      )}
    </div>
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
      className="h-8 w-8"
      src={(token.item as Image).image.url}
    ></img>
  );

  return (
    <TableCell 
      style={{
        padding: "0px 8px 0px 0px",
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <button
              className={cn(
                "size-8 font-medium outline-none",
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
        <TooltipContent side="right">
          {token.item.name}
        </TooltipContent>
      </Tooltip>
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
    <TableCell
      className="flex items-center justify-center align-middle"
      style={{
        padding: "7px 8px 7px 0px"
      }}
    >
      <Tooltip>
        <TooltipTrigger>
          <Checkbox
            checked={included}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") onCheckedChange(checked);
            }}
          />
        </TooltipTrigger>
        <TooltipContent>
            Select
        </TooltipContent>
      </Tooltip>
    </TableCell>
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
    <TableCell
      className="flex items-center justify-center align-middle"
      style={{
        padding: "0px 0px 0px 0px"
      }}
    >
      <Tooltip>
        <TooltipTrigger>
          <Checkbox
            checked={included}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") {
                onCheckedChange(checked);
              }
            }}
          />
        </TooltipTrigger>
        <TooltipContent>
            Select All
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

function OwnerSelector({
  token,
  playerId,
  playerName,
  players,
}: {
  token: Token;
  playerId: string;
  playerName: string;
  players: Player[];
}): JSX.Element {
  
  return (
    <TableCell 
      style={{
        padding: "0px 0px 0px 0px",
      }}
    >
      <Select
        value={token.item.createdUserId}
        onValueChange={async (value) => {
          await OBR.scene.items.updateItems([token.item], (items) => {
            items.forEach((item) => {
              item.createdUserId = value;
            });
          });
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger
              className="h-[32px]"

              style={{
                width: "128px",
              }}
            >
              <SelectValue />
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            Token Owner
          </TooltipContent>
        </Tooltip>
        <SelectContent>
          <SelectGroup>
            <SelectItem key={playerId} value={OBR.player.id}>{playerName}</SelectItem>
            {players.map((player) => {
              return (
                <SelectItem key={player.id} value={player.id}>
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

function VisibilityButton({
  token,
}: {
  token: Token;
}): JSX.Element {
  return (
    <TableCell 
      style={{
        height: "32px",
        padding: "0px 8px 0px 8px",
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            style={{
              width: "32px",
              height: "32px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() =>
              updateTokenVisibility(token)
            }
          >
            {token.item.visible ? (
              <Visible width="22px" height="22px"/>
            ) : (
              <Hidden width="22px" height="22px"/>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {token.item.visible ? "Visible" : "Hidden"}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

async function updateTokenVisibility(
  token: Token,
) {

  await OBR.scene.items.updateItems([token.item], (items) => {
    items.forEach((item) => {
      item.visible = !item.visible;
    });
  });
}

function VisibilityOverwriteMenu({
  appState,
  tokens,
}: {
  appState: BulkEditorState;
  tokens: Token[];
}): JSX.Element {

  const [open, setOpen] = useState(false);
  
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    hoverTimer.current = setTimeout(() => setOpen(true), 250);
  };

  const handleLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    leaveTimer.current = setTimeout(() => setOpen(false), 150);
  };
  
  return (
    <TableCell
      className="items-center justify-center"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        padding: "0px 0px 0px 0px",
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
              width: "32px",
              height: "32px",
            }}
            variant={"secondary"}
            size={"icon"}
          >
            <Visible width="20px" height="20px"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={handleEnter}  // keep open if mouse enters popup
          onMouseLeave={handleLeave}  // close only when leaving popup too
          align="start"
          sideOffset={-37}
          alignOffset={-5}
          // style={{ 
          //   height: "42px",
          //   width: "78px",
          // }}
          style={{ 
            height: "78px",
            width: "42px",
          }}
        >
          {/* <TableCell
            className="items-center justify-center gap-1 p-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensVisibility(
                      appState.includedItems,
                      tokens,
                      true,
                    );
                  }}
                >
                  <Visible width="20px" height="20px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Show Token
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensVisibility(
                      appState.includedItems,
                      tokens,
                      false,
                    );
                  }}
                >
                  <Hidden width="20px" height="20px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Hide Token
              </TooltipContent>
            </Tooltip>
          </TableCell> */}
          <TableCell
            className="items-center justify-center gap-1 p-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensVisibility(
                      appState.includedItems,
                      tokens,
                      true,
                    );
                  }}
                >
                  <Visible width="20px" height="20px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Show Token
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensVisibility(
                      appState.includedItems,
                      tokens,
                      false,
                    );
                  }}
                >
                  <Hidden width="20px" height="20px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Hide Token
              </TooltipContent>
            </Tooltip>
          </TableCell>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

export async function updateCheckboxedTokensVisibility(
  includedItems: Map<string, boolean>,
  tokens: Token[],
  newVisibility: boolean,
) {
  await OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
      for (let i = 0; i < items.length; i++) {
        const included = getIncluded(tokens[i].item.id, includedItems);

        if (items[i].id !== tokens[i].item.id) continue;

        if(included) items[i].visible = newVisibility;
      }
    },
  );
}

function HealthVisibilityMenu({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {

  const [open, setOpen] = useState(false);
  
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    hoverTimer.current = setTimeout(() => setOpen(true), 250);
  };

  const handleLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    leaveTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const renderMainIcon = () => {
    switch (token.healthVisibility) {
      case "HIDDEN":
        return (
          <HiddenHealth width="21px" height="21px"/>
        );
      case "BAR":
        return (
          <HealthBar width="21px" height="21px"/>
        );
      case "BAR-VALUE":
        return (
          <HealthBarValues width="21px" height="21px"/>
        );
    }
  };
  
  return (
    <TableCell
      className="align-top"
      style={{
        padding: "0px 8px 0px 8px",
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
              width: "32px",
              height: "32px",

              outline: "none",
              boxShadow: "none",
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
          onMouseEnter={handleEnter}  // keep open if mouse enters popup
          onMouseLeave={handleLeave}  // close only when leaving popup too
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
                  onClick={() => 
                    updateTokenHealthVisibility(token.item.id, "HIDDEN", setTokens)
                  }
                >
                  {token.healthVisibility === "HIDDEN" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <HiddenHealth width="21px" height="21px"/>
                    </div>
                  ) : (
                    <HiddenHealth width="21px" height="21px"/>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Hide Health Bar
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
                  onClick={() => 
                    updateTokenHealthVisibility(token.item.id, "BAR", setTokens)
                  }
                >
                  {token.healthVisibility === "BAR" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <HealthBar width="21px" height="21px"/>
                    </div>
                  ) : (
                    <HealthBar width="21px" height="21px"/>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Show Health Bar
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
                  onClick={() => 
                    updateTokenHealthVisibility(token.item.id, "BAR-VALUE", setTokens)
                  }
                >
                  {token.healthVisibility === "BAR-VALUE" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <HealthBarValues width="21px" height="21px"/>
                    </div>
                  ) : (
                    <HealthBarValues width="21px" height="21px"/>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Show Health Bar with Values
              </TooltipContent>
            </Tooltip>
          </TableCell>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

async function updateTokenHealthVisibility(
  itemId: string,
  newValue: "HIDDEN" | "BAR" | "BAR-VALUE", 
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name: ItemMetadataName = "HEALTH-VISIBILITY";
  if (!isItemMetadataName(name)) throw "Error: invalid input name.";

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: newValue } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, newValue);
}

function HealthVisibilityOverwriteMenu({
  appState,
  tokens,
}: {
  appState: BulkEditorState;
  tokens: Token[];
}): JSX.Element {

  const [open, setOpen] = useState(false);
  
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    hoverTimer.current = setTimeout(() => setOpen(true), 250);
  };

  const handleLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    leaveTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <TableCell
      className="align-top"
      style={{
        padding: "0px 0px 0px 0px",
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
              width: "32px",
              height: "32px",
            }}
            variant={"secondary"}
            size={"icon"}
          >
            <HealthBar width="19px" height="19px"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={handleEnter}  // keep open if mouse enters popup
          onMouseLeave={handleLeave}  // close only when leaving popup too
          // align="center"
          align="end"
          alignOffset={-5}
          // sideOffset={-37}
          sideOffset={-73}
          // style={{ 
          //   height: "42px",
          //   width: "114px",
          // }}
          style={{ 
            height: "114px",
            width: "42px",
          }}
        >
          {/* <TableCell
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
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "HIDDEN");
                  }}
                >
                  <HiddenHealth width="19px" height="19px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Hide Health Bar
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "BAR");
                  }}
                >
                  <HealthBar  width="19px" height="19px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Show Health Bar
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "BAR-VALUE");
                  }}
                >
                  <HealthBarValues  width="19px" height="19px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Show Health Bar with Values
              </TooltipContent>
            </Tooltip>
          </TableCell> */}
          <TableCell
            className="items-center justify-center gap-1 p-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "BAR-VALUE");
                  }}
                >
                  <HealthBarValues  width="19px" height="19px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Show Health Bar with Values
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "BAR");
                  }}
                >
                  <HealthBar  width="19px" height="19px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Show Health Bar
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"secondary"}
                  size={"icon"}
                  onClick={() => {
                    updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "HIDDEN");
                  }}
                >
                  <HiddenHealth width="19px" height="19px"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Hide Health Bar
              </TooltipContent>
            </Tooltip>
          </TableCell>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

export async function updateCheckboxedTokensHealthVisibility(
  includedItems: Map<string, boolean>,
  tokens: Token[],
  newHealthVisibility: "HIDDEN" | "BAR" | "BAR-VALUE",
) {
  await OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
      for (let i = 0; i < items.length; i++) {
        const included = getIncluded(tokens[i].item.id, includedItems);

        if (items[i].id !== tokens[i].item.id) continue;
        
        const newMetadata = {
          [ITEM_HEALTH_VISIBILITY_METADATA_ID]: included ? newHealthVisibility : tokens[i].healthVisibility,
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

function GroupButton({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {
  return (
    <TableCell 
      style={{
        height: "32px",
        padding: "0px 0px 0px 8px",
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            style={{
              width: "32px",
              height: "32px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() =>
              updateTokenGroup(token.item.id, token.group, setTokens)
            }
          >
            <Swap width="21px" height="21px"/>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {token.group === "COMPANIONS" ? "Move to Strangers" : "Move to Companions"}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

async function updateTokenGroup(
  itemId: string,
  previousValue: "COMPANIONS" | "STRANGERS",
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name: ItemMetadataName = "GROUP";
  if (!isItemMetadataName(name)) throw "Error: invalid input name.";

  const value = previousValue === "COMPANIONS" ? "STRANGERS" : "COMPANIONS";

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}

function GroupOverwriteButton({
  appState,
  dispatch,
  tokens,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
}): JSX.Element {
  return (
    <TableCell
      className="items-center justify-center"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        padding: "0px 8px 0px 8px",
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            style={{
              width: "32px",
              height: "32px",
            }}
            variant={"secondary"}
            size={"icon"}
            onClick={() => {
              updateCheckboxedTokensGroup(
                appState.includedItems,
                tokens,
              );
              dispatch({
                type: "set-included-items",
                includedItems: new Map(
                  tokens.map((token) => [token.item.id, false]),
                ),
              });
            }}
          >
            <Swap width="19" height="19"/>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Move to Another Group
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

export async function updateCheckboxedTokensGroup(
  includedItems: Map<string, boolean>,
  tokens: Token[],
) {
  await OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
      for (let i = 0; i < items.length; i++) {
        const included = getIncluded(tokens[i].item.id, includedItems);

        if (items[i].id !== tokens[i].item.id) continue;
        
        const newGroup = tokens[i].group === "COMPANIONS" ? "STRANGERS" : "COMPANIONS";

        const newMetadata = {
          [ITEM_GROUP_METADATA_ID]: included ? newGroup : tokens[i].group,
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

function StatInput({
  parentValue,
  updateHandler,
  name,
  className = "",
  width = "53px",
  height = "32px",
}: {
  parentValue: number;
  updateHandler: (target: HTMLInputElement) => void;
  name: ItemMetadataName;
  className?: string;
  width?: string;
  height?: string;
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
      width={width}
      height={height}
      inputProps={{
        className: className ? className : "",
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

function updateTokenStat(
  itemId: string,
  target: HTMLInputElement,
  previousValue: number,
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name = target.name;
  if (!isItemMetadataName(name)) throw "Error: invalid input name.";

  const value = getNewStatValue(name, target.value, previousValue);

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}

function TokenStatsQuartet({
  token,
  setTokens,
  width = "53px",
  height = "32px",
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  width?: string;
  height?: string;
}): JSX.Element {
  return (
    <TableCell 
      style={{
        padding: "0px 0px 0px 6px",
      }}
    >
      <div className="flex gap-2">
        <div className="flex items-center justify-between">
          <StatInput
            width={width}
            height={height}
            parentValue={token.health}
            name={"HEALTH"}
            updateHandler={(target) =>
              updateTokenStat(
                token.item.id,
                target,
                token.health,
                setTokens,
              )
            }
          />
          <div className="text-center w-[8px]">
            /
          </div>
          <StatInput
            width={width}
            height={height}
            parentValue={token.maxHealth}
            name={"MAX-HEALTH"}
            updateHandler={(target) =>
              updateTokenStat(
                token.item.id,
                target,
                token.maxHealth,
                setTokens,
              )
            }
          />
        </div>
        <StatInput
          width={width}
          height={height}
          parentValue={token.tempHealth}
          name={"TEMP-HEALTH"}
          updateHandler={(target) =>
            updateTokenStat(
              token.item.id,
              target,
              token.tempHealth,
              setTokens,
            )
          }
        />
        <StatInput
          width={width}
          height={height}
          parentValue={token.armorClass}
          name={"ARMOR-CLASS"}
          updateHandler={(target) =>
            updateTokenStat(
              token.item.id,
              target,
              token.armorClass,
              setTokens,
            )
          }
        />
      </div>
    </TableCell>
  );
}

const allChecked = (
  tokens: Token[],
  map: Map<string, boolean>,
): boolean | "indeterminate" => {
  let allChecked = true;
  let noneChecked = true;

  if (tokens.length === 0) return false;

  for (const token of tokens) {
    const included = getIncluded(token.item.id, map);
    if (included === false) allChecked = false;
    if (included === true) noneChecked = false;
  }
  
  if (allChecked) return true;
  if (noneChecked) return false;
  return "indeterminate";
};
