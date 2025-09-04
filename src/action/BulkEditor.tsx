import "../index.css";

import
  Token
from "../metadataHelpers/TokenType";

import {
  useEffect,
  useReducer,
  useState,
} from "react";

import {
  BulkEditorState,
} from "./types";

import
  OperationSelector
from "./OperationSelector";

import
  GroupSelector
from "./GroupSelector";

import {
  TokensTable,
} from "./Tables";

import
  DiceRoller
from "./DiceRoller";

import {
  reducer,
  unsetStatOverwrites,
  writeTokenSortingToItems,
} from "./helpers";

import
  OBR, {
  Item,
  Player,
} from "@owlbear-rodeo/sdk";

import {
  itemFilter,
  parseItems,
} from "@/metadataHelpers/itemMetadataHelpers";

import {
  addThemeToBody,
} from "@/colorHelpers";

import {
  arrayMove,
} from "@dnd-kit/sortable";

import {
  DragEndEvent,
} from "@dnd-kit/core";

import {
  getStatsVisibilityFromScene,
  getRollsFromScene,
  getShowItemsFromScene,
} from "@/metadataHelpers/sceneMetadataHelpers";


export default function BulkEditor(): JSX.Element {
  // App state
  const [appState, dispatch] = useReducer(reducer, {}, (): BulkEditorState => {
    return {
      operation: "NONE",
      group: "COMPANIONS",
      statsVisibility: "EXPLORE",
      showItems: "ALL",
      rolls: [],
      value: null,
      animateRoll: false,
      statOverwrites: unsetStatOverwrites(),
      damageScaleOptions: new Map<string, number>(),
      healingOptions: new Map<string, boolean>(),
      includedItems: new Map<string, boolean>(),
      mostRecentSelection: [],
    };
  });

  // Scene State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [playerSelection, setPlayerSelection] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [playerColor, setPlayerColor] = useState("");
  const [playerRole, setPlayerRole] = useState<"PLAYER" | "GM">("PLAYER");
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (playerRole === "PLAYER") {
      OBR.action.setHeight(378)
      OBR.action.setWidth(338)
    } else {
      OBR.action.setHeight(620) //527
      OBR.action.setWidth(382)
    }
  }, [playerRole]);

  useEffect(() => {
    const initPlayerList = async () => {
      setPlayers(await OBR.party.getPlayers());
    };

    initPlayerList();
    return OBR.party.onChange(
      (players) => {
        setPlayers(players);
      }
    );
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over?.id && active.id !== over.id) {
      setTokens((tokens) => {
        const oldIndex = tokens.find(
          (token) => token.item.id === active.id,
        )?.index;
        const newIndex = tokens.find(
          (token) => token.item.id === over.id,
        )?.index;
        const newTokens = arrayMove(
          tokens,
          oldIndex as number,
          newIndex as number,
        );
        for (let i = 0; i < newTokens.length; i++) newTokens[i].index = i;
        
        writeTokenSortingToItems(newTokens);
        return newTokens;
      });
    }
  }

  // Sync tokens with scene
  const updateTokens = (items: Item[]) => {
    const newTokens = parseItems(items);
    // Guarantee initialized and ordered indices
    newTokens.sort(
      (a, b) =>
        (a.index === -1 ? newTokens.length : a.index) -
        (b.index === -1 ? newTokens.length : b.index),
    );
    for (let i = 0; i < newTokens.length; i++) newTokens[i].index = i;
    setTokens(newTokens);
  };

  useEffect(() => {
    return OBR.scene.items.onChange(updateTokens);
  }, []);

  // Handle scene ready
  useEffect(() => {
    const handleReady = (ready: boolean) => {
      setSceneReady(ready);
      if (ready) {
        OBR.scene.items.getItems(itemFilter).then(updateTokens);

        getStatsVisibilityFromScene().then((statsVisibility) =>
          dispatch({
            type: "set-stats-visibility",
            statsVisibility: statsVisibility,
          }),
        );

        getShowItemsFromScene().then((showItems) => {
          dispatch({
            type: "set-show-items",
            showItems: showItems,
          });
        });
        
        getRollsFromScene().then((rolls) =>
          dispatch({
            type: "set-rolls",
            rolls: rolls,
          }),
        );
      } else {
        setTokens([]);
      }
    };
    OBR.scene.isReady().then(handleReady);
    return OBR.scene.onReadyChange(handleReady);
  }, []);


  // Sync player
  useEffect(() => {
    const updateSelection = async (selection: string[] | undefined) => {
      
      setPlayerSelection(selection ? selection : []);

      const validTokenIds = (await OBR.scene.items.getItems(itemFilter)).map(
        (item) => item.id,
      );
      if (selection) {
        const selectedTokenIds = selection.filter((id) =>
          validTokenIds.includes(id),
        );
        if (selectedTokenIds.length > 0)
          dispatch({
            type: "set-most-recent-selection",
            mostRecentSelection: selectedTokenIds,
          });

          let newIncludedMap = new Map<string, boolean>();
          for (let i = 0; i < selection.length; i++) {
            newIncludedMap = newIncludedMap.set(selection[i], true)
          }

          dispatch({
            type: "set-included-items",
            includedItems: newIncludedMap,
          });
      }
    };

    const updatePlayerName = (name: string) => {
      setPlayerName(name);
    };

    const updatePlayerId = (name: string) => {
      setPlayerId(name);
    };

    const updatePlayerColor = (color: string) => {
      setPlayerColor(color);
    };

    const updatePlayerRole = (role: "PLAYER" | "GM") => {
      setPlayerRole(role);
    };

    OBR.player.getSelection().then(updateSelection);
    OBR.player.getName().then(updatePlayerName);
    OBR.player.getId().then(updatePlayerId);
    OBR.player.getColor().then(updatePlayerColor);
    OBR.player.getRole().then(updatePlayerRole);

    return OBR.player.onChange((player) => {
      updateSelection(player.selection);
      updatePlayerName(player.name);
      updatePlayerId(player.id);
      updatePlayerColor(player.color);
      updatePlayerRole(player.role);
    });
  }, []);

  // Sync rolls
  useEffect(() => {
    OBR.scene.onMetadataChange(async (sceneMetadata) => {
      getStatsVisibilityFromScene(sceneMetadata).then((statsVisibility) =>
        dispatch({
          type: "set-stats-visibility",
          statsVisibility: statsVisibility,
        })
      );

      getShowItemsFromScene(sceneMetadata).then((showItems) => {
        dispatch({
          type: "set-show-items",
          showItems: showItems,
        });
      });

      getRollsFromScene(sceneMetadata).then((rolls) =>
        dispatch({
          type: "set-rolls",
          rolls: rolls,
        })
      );
    });
  });

  // Sync theme
  useEffect(() => {
    OBR.theme.onChange((theme) => addThemeToBody(theme.mode));
  }, []);

  const getTokensTable = () => {
    // if (selectedTokens.length === 0)
    //   return (
    //     <div className="flex h-full items-start justify-center p-2 text-mirage-400 dark:text-mirage-600">
    //       The tokens you most recently selected on the map will be visible here.
    //     </div>
    // );

    return (
      <TokensTable
        appState={appState}
        dispatch={dispatch}
        tokens={tokens}
        setTokens={setTokens}
        playerName={playerName}
        playerId={playerId}
        playerColor={playerColor}
        playerRole={playerRole}
        playerSelection={playerSelection}
        players={players}
        handleDragEnd={handleDragEnd}
      ></TokensTable>
    );
  };

  return (
    <div className="h-full overflow-clip">
      <div className="flex h-full flex-col justify-between bg-mirage-100/90 dark:bg-mirage-940/85 dark:text-mirage-200">
        
        {/* {playerRole === "GM" ? (
          <>
            <OperationSelector
              appState={appState}
              dispatch={dispatch}
            ></OperationSelector>

            <GroupSelector
              dispatch={dispatch}
            ></GroupSelector>
          </>
        ) : (
          <div className="pt-[15px]"></div>
        )} */}

        <OperationSelector
          appState={appState}
          dispatch={dispatch}
          playerRole={playerRole}
        ></OperationSelector>

        {playerRole === "GM" && (
          <GroupSelector
            dispatch={dispatch}
          ></GroupSelector>
        )}

        {getTokensTable()}

        <DiceRoller
          appState={appState}
          dispatch={dispatch}
          playerName={playerName}
          playerId={playerId}
          playerColor={playerColor}
          playerRole={playerRole}
          players={players}
        ></DiceRoller>
    
      </div>
    </div>
  );
}