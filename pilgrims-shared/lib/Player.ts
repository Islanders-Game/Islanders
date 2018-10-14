import { Resources } from './Resources';
import { House } from './Entities/House';
import { City } from './Entities/City';
import { Road } from './Entities/Road';
import { Ship } from './Entities/Ship';

export interface Player {
  id: number;
  resources: Resources;
  houses: House[];
  cities: City[];
  roads: Road[];
  ships: Ship[];
}
