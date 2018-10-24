import { defineGrid, extendHex } from 'honeycomb-grid';
import { Tile, TileType, DiceRollType } from './Tile';

const randomTileType = (): TileType => {
  const rand = Math.floor(Math.random() * 6);
  switch (rand) {
    case 0:
      return 'Wood';
    case 1:
      return 'Stone';
    case 2:
      return 'Clay';
    case 3:
      return 'Grain';
    case 4:
      return 'Wool';
    case 5: {
      if (Math.random() < 0.75) {
        return randomTileType();
      }
      return 'Desert';
    }
  }
  return 'Ocean';
};

export const randomDiceRoll = (): DiceRollType => {
  const dice1 = Math.floor(Math.random() * 6 + 1);
  const dice2 = Math.floor(Math.random() * 6 + 1);
  const roll = dice1 + dice2;
  if (roll === 7) return randomDiceRoll();
  return roll as DiceRollType;
};

export class WorldGenerator {
  public generateRandomMap(radius: number | undefined): Tile[] {
    const Hex = extendHex({
      orientation: 'flat',
    });
    const r: number = radius !== undefined ? Number(radius) : 3;
    const Grid = defineGrid(Hex);
    const map: Tile[] = [];
    const center = Hex({ x: 0, y: 0 });
    Grid.hexagon({ radius: r }).forEach((hex) => {
      let tileType = randomTileType();
      let diceRoll = randomDiceRoll();
      if (hex.distance(center) >= r) {
        tileType = 'Ocean';
        diceRoll = 'None';
      }
      if (tileType == 'Desert') {
        diceRoll = 'None';
      }
      map.push({ coord: { x: hex.x, y: hex.y }, diceRoll, type: tileType });
    });
    return map;
  }
}
