import { Resources } from './Resources';
import { House } from './Entities/House';
import { City } from './Entities/City';
import { Road } from './Entities/Road';
import { Ship } from './Entities/Ship';
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

  constructor(name: string) {
    this.id = v4();
    this.color = 0xFFFFFF * Math.random();
    this.name = name;
    this.resources = {};
    this.houses = [];
    this.cities = [];
    this.roads = [];
    this.ships = [];
  }
}
