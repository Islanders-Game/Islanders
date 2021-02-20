import { BuyCardAction } from '../Action';
import { Result, purchase, World, success, fail } from '../Shared';
import { ensureGameState, findPlayer } from './Helpers';
import { DevelopmentCard } from '../Entities/DevelopmentCard';

export const BuyCard = ({ parameters }: BuyCardAction) => (w: Result): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(purchase(new DevelopmentCard().cost)(parameters.playerName))
  .flatMap(assignDevelopmentCard(parameters.playerName));

const assignDevelopmentCard = (playerName: string) => (w: World): Result => {
  const randomCard = new DevelopmentCard();
  const player = w.players.find((pl) => pl.name === playerName);
  if (!player) return fail(`The player ${playerName} was not found`);
  const newCards = player.devCards.concat(randomCard);
  const players = w.players.map((pl) => (pl.name === playerName ? {
    ...pl, devCards: newCards,
  } : pl));
  return success({
    ...w, players,
  });
};
