import { Result } from './Rules/Result';
import { World } from './World';
import {
  BuildHouseAction,
  BuildCityAction,
  BuildRoadAction,
  MoveThiefAction,
  MoveThiefDevCardAction,
  BuyCardAction,
  PlayCardAction,
  PlayerTradeAction,
  BankTradeAction,
  HarborTradeAction,
  EndTurnAction,
  LockMapAction,
  BuildHouseInitialAction,
  BuildRoadInitialAction,
} from './Action';
import { BuildHouse } from './Rules/BuildHouse';
import { BuildHouseInitial } from './Rules/BuildHouseInitial';
import { BuildCity } from './Rules/BuildCity';
import { BuildRoad } from './Rules/BuildRoad';
import { BuildRoadInitial } from './Rules/BuildRoadInitial';
import { MoveThief } from './Rules/MoveThief';
import { MoveThiefDevelopmentCard } from './Rules/MoveThiefDevelopmentCard';
import { BuyCard } from './Rules/BuyCard';
import { PlayCard } from './Rules/PlayCard';
import { PlayerTrade } from './Rules/PlayerTrade';
import { BankTrade } from './Rules/BankTrade';
import { HarborTrade } from './Rules/HarborTrade';
import { LockMap } from './Rules/LockMap';
import { EndTurn } from './Rules/EndTurn';

export type Rule = (w: Result<World>) => Result<World>;
export interface Rules {
  BuildHouse: (data: BuildHouseAction) => (w: Result<World>) => Result<World>;
  BuildHouseInitial: (
    data: BuildHouseInitialAction,
  ) => (w: Result<World>) => Result<World>;
  BuildCity: (data: BuildCityAction) => (w: Result<World>) => Result<World>;
  BuildRoad: (data: BuildRoadAction) => (w: Result<World>) => Result<World>;
  BuildRoadInitial: (
    data: BuildRoadInitialAction,
  ) => (w: Result<World>) => Result<World>;
  MoveThief: (data: MoveThiefAction) => (w: Result<World>) => Result<World>;
  MoveThiefDevelopmentCard: (
    data: MoveThiefDevCardAction,
  ) => (w: Result<World>) => Result<World>;
  BuyCard: (data: BuyCardAction) => (w: Result<World>) => Result<World>;
  PlayCard: (data: PlayCardAction) => (w: Result<World>) => Result<World>;
  PlayerTrade: (data: PlayerTradeAction) => (w: Result<World>) => Result<World>;
  BankTrade: (data: BankTradeAction) => (w: Result<World>) => Result<World>;
  HarborTrade: (data: HarborTradeAction) => (w: Result<World>) => Result<World>;
  LockMap: (data: LockMapAction) => (w: Result<World>) => Result<World>;
  EndTurn: (data: EndTurnAction) => (w: Result<World>) => Result<World>;
}

export const ruleReducer = (
  acc: Result<World>,
  curr: ((x: Result<World>) => Result<World>),
) => curr(acc);

//
// ---- Rule implementations ----
//
export const rules: Rules = {
  BuildHouse,
  BuildHouseInitial,
  BuildCity,
  BuildRoad,
  BuildRoadInitial,
  MoveThief,
  MoveThiefDevelopmentCard,
  BuyCard,
  PlayCard,
  PlayerTrade,
  BankTrade,
  HarborTrade,
  LockMap,
  EndTurn,
};
