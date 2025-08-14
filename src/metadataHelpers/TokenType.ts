import { Item } from "@owlbear-rodeo/sdk";

type Token = {
  item: Item;
  health: number;
  maxHealth: number;
  tempHealth: number;
  armorClass: number;
  isTeam: boolean;
  isHidden: boolean;
  healthBar: number;
  
  group: number;
  index: number;

  hideStats: boolean;
};
export default Token;
