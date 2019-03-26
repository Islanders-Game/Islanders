import { Road } from './Road';

export class Ship extends Road {
  public cost = {
    wood: 1,
    wool: 1,
    clay: 0,
    stone: 0,
    grain: 0,
  };
}
