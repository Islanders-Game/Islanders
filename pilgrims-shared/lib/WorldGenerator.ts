import { defineGrid, extendHex } from 'honeycomb-grid';
import { Tile, TileType, DiceRollType, GeneratorDiceRollType } from './Tile';
import { DevelopmentCardType } from './Entities/DevelopmentCard';

const randomTileType = (): TileType => {
  const tileProbabilities: TileType[] = [
    "Wood", "Wood", "Wood", "Wood",
    "Wool", "Wool", "Wool", "Wool",
    "Grain", "Grain", "Grain", "Grain", 
    "Stone", "Stone", "Stone", 
    "Clay", "Clay", "Clay",
    "Desert" 
  ]
  const rand = Math.floor(Math.random() * tileProbabilities.length)
  return tileProbabilities[rand];
};

const generatorDiceRoll = (): GeneratorDiceRollType => {
  // See https://www.catan.com/en/download/?SoC_rv_Rules_091907.pdf
  const roll = Math.random();
  if (roll <= 0.03) return 2;
  if (roll > 0.03 && roll <= 0.06) return 12;
  if (roll > 0.06 && roll <= 0.12) return 3;
  if (roll > 0.12 && roll <= 0.18) return 11;
  if (roll > 0.18 && roll <= 0.26) return 4;
  if (roll > 0.26 && roll <= 0.34) return 10;
  if (roll > 0.34 && roll <= 0.45) return 5;
  if (roll > 0.45 && roll <= 0.56) return 9;
  if (roll > 0.56 && roll <= 0.70) return 6;
  if (roll > 0.70 && roll <= 0.84) return 8;
  return generatorDiceRoll();
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
      let diceRoll = generatorDiceRoll();
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
