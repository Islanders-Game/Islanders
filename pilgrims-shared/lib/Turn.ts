import { Action } from './Action';

export interface Turn {
  player: number;
  actions: Action[];
}
