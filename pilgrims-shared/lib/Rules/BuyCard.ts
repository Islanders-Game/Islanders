import { BuyCardAction } from '../Action';
import { Result, World, purchase } from '../Shared';
import { ensureGameState, findPlayer, assignDevelopmentCard } from './Helpers';
import { DevelopmentCard } from '../Entities/DevelopmentCard';

export const BuyCard = ({ parameters }: BuyCardAction) => (
  w: Result<World>,
): Result<World> => {
  const stateEnsured = ensureGameState('Started')(w);
  const playerExists = findPlayer(parameters.playerName)(stateEnsured);
  const purchased = purchase(new DevelopmentCard().cost)(parameters.playerName)(
    playerExists,
  );
  const assigned = assignDevelopmentCard(parameters.playerName)(purchased);
  return assigned;
};
