import {
  Item,
} from "@owlbear-rodeo/sdk";

type Token = {
  item: Item;

  health: number;
  maxHealth: number;
  tempHealth: number;
  armorClass: number;
  healthVisibility: "HIDDEN" | "BAR" | "BAR-VALUE";
  group: "COMPANIONS" | "STRANGERS";
  index: number;

  added: boolean;
  showItems: "ALL" | "SELECTED" | "ADDED";
};

export default Token;
