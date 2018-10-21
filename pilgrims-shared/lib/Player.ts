import { Resources } from './Resources';
import { House } from './Entities/House';
import { City } from './Entities/City';
import { Road } from './Entities/Road';
import { Ship } from './Entities/Ship';
import { DevelopmentCard } from './Entities/DevelopmentCard';
import { v4 } from 'uuid';

export class Player {
  public id: string;
  public color: number;
  public name: string;
  public resources: Resources;
  public houses: House[];
  public cities: City[];
  public roads: Road[];
  public ships: Ship[];
  public devCards: DevelopmentCard[];

  constructor(name: string) {
    this.id = v4();
    this.color = 0xffffff * Math.random();
    this.name = name;
    this.resources = { clay: 10, grain: 10, stone: 10, wood: 10, wool: 10 };
    this.houses = [];
    this.cities = [];
    this.roads = [];
    this.ships = [];
    this.devCards = [];
  }
}
