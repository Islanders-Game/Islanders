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

export type Rule = (w: Result) => Result;
export interface Rules {
  BuildHouse: (data: BuildHouseAction) => Rule;
  BuildHouseInitial: (data: BuildHouseInitialAction) => Rule;
  BuildCity: (data: BuildCityAction) => Rule;
  BuildRoad: (data: BuildRoadAction) => Rule;
  BuildRoadInitial: (data: BuildRoadInitialAction) => Rule;
  MoveThief: (data: MoveThiefAction) => Rule;
  MoveThiefDevelopmentCard: (data: MoveThiefDevCardAction) => Rule;
  BuyCard: (data: BuyCardAction) => Rule;
  PlayCard: (data: PlayCardAction) => Rule;
  PlayerTrade: (data: PlayerTradeAction) => Rule;
  BankTrade: (data: BankTradeAction) => Rule;
  HarborTrade: (data: HarborTradeAction) => Rule;
  LockMap: (data: LockMapAction) => Rule;
  EndTurn: (data: EndTurnAction) => Rule;
}

export function ruleReducer(acc: Result, curr: (x: Result) => Result) {
  return curr(acc);
}

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
