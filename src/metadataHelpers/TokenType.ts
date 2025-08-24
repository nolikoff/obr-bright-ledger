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
  team: "COMPANIONS" | "STRANGERS";
  group: number;
  index: number;
};

export default Token;
