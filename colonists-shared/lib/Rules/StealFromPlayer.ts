import { Result, TileType, World, fail, success } from '../Shared';
import { StealFromPlayerAction } from '../Action';
import { ensureGameState,
  findPlayer,
  getResourceAmountOfType,
  setAmountOfResourceOfType } from './Helpers';

export const StealFromPlayer = ({ parameters }: StealFromPlayerAction) => (
  world: Result,
): Result => world
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(stealFromPlayer(parameters.toStealFrom));

const stealFromPlayer = (toStealFrom: string) => (w: World): Result => {
  // TODO: Validate that chosen player actually has buildings adjecent to w.thief coordinates
  const getRandomIndex = (max: number) => Math.floor(Math.random() * Math.floor(max));
  const currentPlayer = w.players[w.currentPlayer];
  const chosenPlayer = w.players.find((p) => p.name === toStealFrom);
  if (!chosenPlayer) return fail(`'${toStealFrom}' does not exist in this game`);
  const tileTypes: TileType[] = ['Clay', 'Grain', 'Wool', 'Stone', 'Wood'];
  const chosenResourceType = tileTypes[getRandomIndex(tileTypes.length)];
  const newResourceCountForCurrentPlayer = getResourceAmountOfType(chosenResourceType, currentPlayer.resources) + 1;
  const newResourceCountForChosenPlayer = getResourceAmountOfType(chosenResourceType, chosenPlayer.resources) - 1;
  const newChosenPlayer = { ...chosenPlayer,
    resources: setAmountOfResourceOfType(newResourceCountForChosenPlayer,
      chosenPlayer.resources, chosenResourceType) };
  const newCurrentPlayer = { ...currentPlayer,
    resources: setAmountOfResourceOfType(newResourceCountForCurrentPlayer,
      currentPlayer.resources, chosenResourceType) };
  const players = w.players.map((p) => {
    if (p.name === currentPlayer.name) return newCurrentPlayer;
    if (p.name === chosenPlayer.name) return newChosenPlayer;
    return p;
  });
  return success({ ...w,
    conditions: { ...w.conditions,
      rolledASeven: { movedThief: true, stoleFromPlayer: true },
      playedKnight: { movedThief: true, stoleFromPlayer: true } },
    players });
};
