import { BuyCardAction } from '../Action';
import { Result, purchase } from '../Shared';
import { ensureGameState, findPlayer, assignDevelopmentCard } from './Helpers';
import { DevelopmentCard } from '../Entities/DevelopmentCard';

export const BuyCard = ({ parameters }: BuyCardAction) => (w: Result): Result => w
  .flatMap(ensureGameState('Started'))
  .flatMap(findPlayer(parameters.playerName))
  .flatMap(purchase(new DevelopmentCard().cost)(parameters.playerName))
  .flatMap(assignDevelopmentCard(parameters.playerName));
