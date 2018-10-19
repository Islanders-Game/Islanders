import { defineGrid, extendHex } from 'honeycomb-grid';
import { Tile, TileType, DiceRollType } from './Tile';

const randomTileType = (): TileType => {
    const rand = Math.floor(Math.random() * 6);
    if (rand === 0) { return 'Wood'; }
    if (rand === 1) { return 'Stone'; }
    if (rand === 2) { return 'Clay'; }
    if (rand === 3) { return 'Grain'; }
    if (rand === 4) { return 'Wool'; }
    if (rand === 5) {
        if (Math.random() < 0.5) { return randomTileType(); }
        return 'Desert';
    }
    return 'Ocean';
};

const randomDiceRoll = (): DiceRollType => {
    const rand = Math.floor(Math.random() * 12 + 1);
    for (let i = 1; i <= 12; i++) {
        if (rand === i) { return i as DiceRollType; }
    }
    return 'None';
};

export class WorldGenerator {
    public size: number = 3;
    public generateRandomMap(): Tile[] {
        const Hex = extendHex({
            orientation: 'flat',
        });
        const Grid = defineGrid(Hex);
        const map: Tile[] = [];
        const center = Hex({ x: 0, y: 0});
        Grid.hexagon({radius: this.size}).forEach((hex) => {
            let tileType = randomTileType();
            let diceRoll = randomDiceRoll();
            if (hex.distance(center) >= this.size) {
                tileType = 'Ocean';
                diceRoll = 'None';
            }
            map.push({coord: { x: hex.x, y: hex.y }, diceRoll, type: tileType});
        });
        return map;
    }
}
