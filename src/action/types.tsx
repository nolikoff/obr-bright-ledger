import React from "react";

export type StampedDiceRoll = {
  timeStamp: number;
  total: number;
  roll: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
  visibility: "PUBLIC" | "GM" | "PRIVATE";
};

export type StatOverwriteData = {
  hitPoints: string;
  maxHitPoints: string;
  tempHitPoints: string;
  armorClass: string;
};

export type BulkEditorState = {
  operation: "NONE" | "DAMAGE" | "HEALING" | "OVERWRITE";
  group: "COMPANIONS" | "STRANGERS";
  mode: "BATTLE" | "EXPLORE";
  rolls: StampedDiceRoll[];
  value: number | null;
  animateRoll: boolean;
  statOverwrites: StatOverwriteData;
  damageScaleOptions: Map<string, number>;
  includedItems: Map<string, boolean>;
  showItems: "ALL" | "SELECTED" | "ADDED";
  mostRecentSelection: string[];
};

export type Action =
  | {
      type: "set-operation";
      operation: "NONE" | "DAMAGE" | "HEALING" | "OVERWRITE";
    }
  | {
      type: "set-group";
      group: "COMPANIONS" | "STRANGERS";
    }
  | {
      type: "set-mode";
      mode: "BATTLE" | "EXPLORE";
    }
  | {
      type: "set-rolls";
      rolls: StampedDiceRoll[];
    }
  | {
      type: "add-roll";
      diceExpression: string;
      playerName: string;
      playerId: string;
      playerColor: string;
      playerRole: "PLAYER" | "GM";
      visibility: "PUBLIC" | "GM" | "PRIVATE";
      dispatch: React.Dispatch<Action>;
    }
  | {
      type: "set-value";
      value: number | null;
    }
  | {
      type: "set-animate-roll";
      animateRoll: boolean;
    }
  | {
      type: "set-stat-overwrites";
      statOverWrites: StatOverwriteData;
    }
  | {
      type: "clear-stat-overwrites";
    }
  | {
      type: "set-hit-points-overwrite";
      hitPointsOverwrite: string;
    }
  | {
      type: "set-max-hit-points-overwrite";
      maxHitPointsOverwrite: string;
    }
  | {
      type: "set-temp-hit-points-overwrite";
      tempHitPointsOverwrite: string;
    }
  | {
      type: "set-armor-class-overwrite";
      armorClassOverwrite: string;
    }
  | {
      type: "set-damage-scale-options";
      damageScaleOptions: Map<string, number>;
    }
  | {
      type: "set-included-items";
      includedItems: Map<string, boolean>;
    }
  | {
      type: "set-show-items";
      showItems: "ALL" | "SELECTED" | "ADDED";
    }
  | {
      type: "set-most-recent-selection";
      mostRecentSelection: string[];
    };
