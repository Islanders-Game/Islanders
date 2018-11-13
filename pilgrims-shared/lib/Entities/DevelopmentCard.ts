import { Purchaseable } from './Purchaseable';

export type DevelopmentCardType =
  | 'Knight'
  | 'Victory Point'
  | 'Road Building'
  | 'Monopoly'
  | 'Year of Plenty'
  | 'None';

export class DevelopmentCard implements Purchaseable {
  public type: DevelopmentCardType = 'None';
  public cost = {
    grain: 1,
    stone: 1,
    wool: 1,
  };

  constructor(type: DevelopmentCardType = 'None') {
    this.type = type;
  }
}

const randomDevCard = (): DevelopmentCardType => {
  const cardProbabilities: DevelopmentCardType[] = [
    "Knight", "Knight", "Knight", "Knight", "Knight", "Knight", "Knight", 
    "Knight", "Knight", "Knight", "Knight", "Knight", "Knight", "Knight", 
    "Monopoly", "Monopoly", 
    "Road Building", "Road Building", 
    "Year of Plenty", "Year of Plenty",  
    "Victory Point", "Victory Point", "Victory Point", "Victory Point", "Victory Point", 
  ];
  const rand = Math.floor(Math.random() * cardProbabilities.length)
  return cardProbabilities[rand];
};
