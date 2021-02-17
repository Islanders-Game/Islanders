import { PlayCardAction } from '../Action';
import { DevelopmentCard } from '../Entities/DevelopmentCard';
import { addResources, Resources } from '../Resources';
import { Result, TileType, success, fail, World, Road } from '../Shared';
import { ensureGameState, findPlayer, getResourceAmountOfType,
  increasePointsForPlayer, setAmountOfResourceOfType } from './Helpers';

export const PlayCard = ({ parameters }: PlayCardAction) => (
  w: Result,
): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(
    playCard(
      parameters.playerName,
      parameters.card,
      parameters.chosenResources,
    ),
  );

const playCard = (
  playerName: string,
  card: DevelopmentCard,
  chosenResources?: [TileType] | [TileType, TileType],
) => (w: World): Result => {
  // Nasty... Couldn't see any other way.
  // Clone existing card array, modify card played state.
  const player = w.players.find((p) => p.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);
  const devCards = player.devCards.slice();
  const toPlay = devCards.find((c) => c.type === card.type && !c.played);
  if (!toPlay) {
    return fail('You do not have that card');
  }

  // Side effect!
  toPlay.played = true;

  if (card.type === 'Victory Point') {
    return increasePointsForPlayer(playerName)(w);
  }
  if (card.type === 'Knight') {
    const players = w.players.map((pl) => (pl.name === playerName ? {
      ...pl, knights: pl.knights + 1, devCards,
    } : pl));
    return success({
      ...w, players,
    });
  }
  if (card.type === 'Road Building') {
    const { resources } = player;
    const roadCost = new Road().cost;
    const withTwoExtraRoads = addResources(addResources(resources, roadCost), roadCost);
    const players = w.players.map((pl) =>
      pl.name === playerName ? {
        ...pl, resources: withTwoExtraRoads, devCards,
      } : pl);
    return success({
      ...w, players,
    });
  }
  if (card.type === 'Year of Plenty') {
    const chosen = chosenResources as [TileType, TileType];
    if (!chosen) return fail('You must choose resources to play this card');
    const { resources } = player;
    const firstToReceive = getResourceAmountOfType(chosen[0], resources) + 1;
    const first = setAmountOfResourceOfType(firstToReceive, resources, chosen[0]);
    const secondToReceive = getResourceAmountOfType(chosen[1], first) + 1;
    const second = setAmountOfResourceOfType(secondToReceive, first, chosen[1]);
    const players = w.players.map((pl) =>
      (pl.name === playerName ? {
        ...pl, resources: second, devCards,
      } : pl));

    return success({
      ...w, players,
    });
  }
  if (card.type === 'Monopoly') {
    const allOthersResources = w.players
      .filter((p) => p.name !== playerName)
      .reduce((acc, p) => acc.concat(p.resources), [] as Resources[]);
    const chosenType = chosenResources as [TileType];
    const toReceive = allOthersResources
      .reduce((acc, rr) => acc + getResourceAmountOfType(chosenType[0], rr), 0);
    const added = setAmountOfResourceOfType(toReceive, player.resources, chosenType[0]);
    const players = w.players.map((pl) =>
      pl.name === playerName
        ? {
          ...pl, resources: added,
        }
        : {
          ...pl, resources: setAmountOfResourceOfType(0, pl.resources, chosenType[0]),
        });
    return success({
      ...w, players,
    });
  }
  return fail('You tried to play an invalid card');
};
