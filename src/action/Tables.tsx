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
} from "./helpers";

import {
  cn,
} from "@/lib/utils";

import
  React, {
  useEffect,
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
  ChangeGroup
from "@/components/icons/ChangeGroup";

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
      {playerRole === "PLAYER" && (
        <PlayerTable
          tokens={filteredTokens}
          setTokens={setTokens}
          playerSelection={playerSelection}
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
    <ScrollArea className="h-full sm:px-4">
      <div className="flex flex-col items-center justify-start gap-2">
        <div>
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
                  {tokens.map((token) => {
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
                            padding: "10px 4px 10px 4px",
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

  return (
    <>
      <OperationPanel
        appState={appState}
        dispatch={dispatch}
        tokens={tokens}
      />

      <ScrollArea className="h-full px-4">
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
                    {tokens.map((token) => {
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
                            style={{
                              padding: "10px 4px 10px 4px",
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

                            <TokenInfoQuartet
                              token={token}
                              playerId={playerId}
                              playerColor={playerColor}
                              playerRole={playerRole}
                              playerSelection={playerSelection}
                              players={players}
                            />
                            
                            <TableCell
                              style={{
                                padding: "0px 8px 0px 18px"
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
                                <Tooltip>
                                  <TooltipTrigger asChild>
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
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Damage Multiplier
                                  </TooltipContent>
                                </Tooltip>
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
                                gap: "6px",
                                // width: "136px",
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[42px] items-center justify-center rounded-md text-sm">
                                    {scaledDamage}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Damage
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-[32px] w-[80px] min-w-12 items-center justify-center rounded-md text-sm">
                                    {newHealth.toString() + (newTempHealth > 0 ? ` (${newTempHealth})` : "")}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  New Hit Points
                                </TooltipContent>
                              </Tooltip>
                            </div>                          
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

      <div className="flex w-full items-center gap-2 px-4 pt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              value={damageValue}
              className="bg-mirage-50 dark:bg-mirage-900 h-[32px] text-center"
              style={{
                width: `${Math.max(String(damageValue).length, 4)*14}px`,
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

  return (
    <>
      <OperationPanel
        appState={appState}
        dispatch={dispatch}
        tokens={tokens}
      />

      <ScrollArea className="h-full px-4">
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
                    {tokens.map((token) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

                      return (
                        <SortableTableRow
                          key={token.item.id}
                          id={token.item.id}
                          onKeyDown={()=>{}}
                        >
                          <div
                            style={{
                              padding: "10px 4px 10px 4px",
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
                             
                            <TokenInfoQuartet
                              token={token}
                              playerId={playerId}
                              playerColor={playerColor}
                              playerRole={playerRole}
                              playerSelection={playerSelection}
                              players={players}
                            />

                            <TokenStatsQuartet
                              token={token}
                              setTokens={setTokens}
                            />
                            
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
      <div className="flex w-full items-center gap-2 px-4 pt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              value={healingValue}
              className="bg-mirage-50 dark:bg-mirage-900 h-[32px] text-center"
              style={{
                width: `${Math.max(String(healingValue).length, 4)*14}px`,
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
              applyHealthDiffToItems(
                healingValue,
                appState.includedItems,
                appState.damageScaleOptions,
                tokens,
              );
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

  return (
    <>
      <OperationPanel
        appState={appState}
        dispatch={dispatch}
        tokens={tokens}
      />
      <ScrollArea className="h-full px-4">
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
                    {tokens.map((token) => {
                      const included = getIncluded(
                        token.item.id,
                        appState.includedItems,
                      );

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
                            style={{
                              padding: "10px 4px 10px 4px",
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

                            <TokenInfoQuartet
                              token={token}
                              playerId={playerId}
                              playerColor={playerColor}
                              playerRole={playerRole}
                              playerSelection={playerSelection}
                              players={players}
                            />

                            <TokenStatsQuartet
                              token={token}
                              setTokens={setTokens}
                            />

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
          padding: "8px 16px 0px 16px",
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
              },
            }}
          ></ActionButton>
        </div>
      </TableCell>
    </>
  );
}

function PlayerTable({
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
    <ScrollArea className="h-full sm:px-4">
      <div className="flex flex-col items-center justify-start gap-2">
        <div>
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
                {tokens.map((token) => {
                  return (
                    <SortableTableRow
                      key={token.item.id}
                      id={token.item.id}
                      onKeyDown={() => {}}
                    >
                      <div
                        style={{
                          padding: "10px 4px 10px 4px",
                        }} 
                      >        
                        <TokenTableCell
                          token={token}
                          faded={false}
                          playerSelection={playerSelection}
                        />

                        <TokenStatsQuartet
                          token={token}
                          setTokens={setTokens}
                        />

                      </div>
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

function NoTokensMessage({
  playerRole,
  appState = false,
}: {
  playerRole: "PLAYER" | "GM";
  appState?: BulkEditorState | false;
}): JSX.Element {
  return (
    <>
      {playerRole === "GM" ? (
        <div
          style={{
            padding: appState && appState.operation === "NONE" ? "10px 16px 10px 16px" : "10px 4px 10px 4px",
          }} 
        >       
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
        </div>
      ) : (
        <div
          style={{
            padding: "10px 16px 10px 16px",
          }} 
        >       
          <p className="text-muted-foreground text-sm">
            You don’t own any tokens yet. <br/>
            When you become the owner of a token, it will appear here.
          </p>
        </div>
      )}
    </>
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
        padding: "7px 8px 7px 4px"
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
              <Visible />
            ) : (
              <Hidden />
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

function VisibilityButtonsDuet({
  appState,
  tokens,
}: {
  appState: BulkEditorState;
  tokens: Token[];
}): JSX.Element {
  return (
    <TableCell
      className="items-center justify-center"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        padding: "0px 0px 0px 0px",
      }}
    >
      <Tooltip>
        <TooltipTrigger>
          <Button
            style={{
              width: "34px",
              height: "34px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              updateCheckboxedTokensVisibility(
                appState.includedItems,
                tokens,
                false,
              );
            }}
          >
            <Hidden/>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Hide Token
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button
            style={{
              width: "34px",
              height: "34px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              updateCheckboxedTokensVisibility(
                appState.includedItems,
                tokens,
                true,
              );
            }}
          >
            <Visible />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Show Token
        </TooltipContent>
      </Tooltip>
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

  const renderMainIcon = () => {
    switch (token.healthVisibility) {
      case "HIDDEN":
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
                <HiddenHealth />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Hidden Health
            </TooltipContent>
          </Tooltip>
        );
      case "BAR":
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
                <HealthBar />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Health Bar
            </TooltipContent>
          </Tooltip>
        );
      case "BAR-VALUE":
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
                <HealthBarValues />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Health Bar with Values
            </TooltipContent>
          </Tooltip>
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
                    updateTokenHealthVisibility(token.item.id, "HIDDEN", setTokens);
                    setOpen(false);
                  }}
                >
                  {token.healthVisibility === "HIDDEN" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <HiddenHealth />
                    </div>
                  ) : (
                    <HiddenHealth />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                  Hidden Health
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
                    updateTokenHealthVisibility(token.item.id, "BAR", setTokens);
                    setOpen(false);
                  }}
                >
                  {token.healthVisibility === "BAR" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <HealthBar />
                    </div>
                  ) : (
                    <HealthBar />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                  Health Bar
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
                    updateTokenHealthVisibility(token.item.id, "BAR-VALUE", setTokens);
                    setOpen(false);
                  }}
                >
                  {token.healthVisibility === "BAR-VALUE" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <HealthBarValues />
                    </div>
                  ) : (
                    <HealthBarValues />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                  Health Bar with Values
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

function HealthVisibilityButtonsTrio({
  appState,
  tokens,
}: {
  appState: BulkEditorState;
  tokens: Token[];
}): JSX.Element {

  return (
    <TableCell
      className="items-center justify-center"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        padding: "0px 0px 0px 0px",
      }}
    >
      <Tooltip>
        <TooltipTrigger>
          <Button
            style={{
              width: "34px",
              height: "34px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "HIDDEN");
            }}
          >
            <HiddenHealth />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Hide Health
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button
            style={{
              width: "34px",
              height: "34px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "BAR");
            }}
          >
            <HealthBar />
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
              width: "34px",
              height: "34px",
            }}
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              updateCheckboxedTokensHealthVisibility(appState.includedItems, tokens, "BAR-VALUE");
            }}
          >
            <HealthBarValues />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Show Health Bar with Values
        </TooltipContent>
      </Tooltip>
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
            <ChangeGroup/>
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

function GroupButtonSolo({
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
        padding: "0px 0px 0px 0px",
      }}
    >
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
            <ChangeGroup/>
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
}: {
  parentValue: number;
  updateHandler: (target: HTMLInputElement) => void;
  name: ItemMetadataName;
  className?: string;
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
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
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
  );
}

function TokenInfoQuartet({
  token,
  playerId,
  playerColor,
  playerRole,
  playerSelection,
  players,
}: {
  token: Token;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  players: Player[];
}): JSX.Element {
  const tokenColor = (playerId === token.item.createdUserId) ? playerColor : (players.find((p) => p.id === token.item.createdUserId)?.color??"transparent");
  const tokenRole = (playerId === token.item.createdUserId) ? playerRole : (players.find((p) => p.id === token.item.createdUserId)?.role??"PLAYER");

  return (
    <>
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
    </>
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

function OperationPanel({
  appState,
  dispatch,
  tokens,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
}): JSX.Element {

  const allIncluded = (checked: boolean): Map<string, boolean> => {
    let newIncludedMap = new Map<string, boolean>(appState.includedItems);

    for (let i = 0; i < tokens.length; i++) {
      newIncludedMap = newIncludedMap.set(tokens[i].item.id, checked)
    }

    return newIncludedMap;
  };

  return (
    <div className="px-4 text-mirage-500 dark:text-mirage-400">
      <Table tabIndex={-1}>
        <TableRow
          className="flex"
          style={{
            backgroundColor: "initial",
            paddingBottom: "4px",
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

          <TableCell style={{padding: "0px 31px 0px 31px"}}></TableCell>

          <HealthVisibilityButtonsTrio
            appState={appState}
            tokens={tokens}
          />

          <TableCell style={{padding: "0px 16px 0px 16px"}}></TableCell>

          <VisibilityButtonsDuet
            appState={appState}
            tokens={tokens}
          />

          <TableCell style={{padding: "0px 16px 0px 16px"}}></TableCell>
          
          <GroupButtonSolo
            appState={appState}
            dispatch={dispatch}
            tokens={tokens}
          />
          
        </TableRow>
      </Table>
    </div>
  );
}
