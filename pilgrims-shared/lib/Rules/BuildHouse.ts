import { Result } from './Result';
import { World } from '../World';
import { ensureGameState, findPlayer, purchase, placeHouse } from './Helpers';
import { House } from '../Shared';
import { BuildHouseAction } from '../Action';

export const BuildHouse = ({ parameters }: BuildHouseAction) => (
  w: Result,
): Result =>
  w
    .flatMap(ensureGameState('Started'))
    .flatMap(findPlayer(parameters.playerName))
    .flatMap(purchase(new House().cost)(parameters.playerName))
    .flatMap(placeHouse(parameters.coordinates)(parameters.playerName));
