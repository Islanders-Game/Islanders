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
  public played: boolean = false;
  public cost = {
    grain: 1,
    stone: 1,
    wool: 1,
    wood: 0,
    clay: 0,
  };

  constructor() {
    this.type = this.randomDevCardType();
  }

  private randomDevCardType = (): DevelopmentCardType => {
    const cardProbabilities: DevelopmentCardType[] = [
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Knight',
      'Monopoly',
      'Monopoly',
      'Road Building',
      'Road Building',
      'Year of Plenty',
      'Year of Plenty',
      'Victory Point',
      'Victory Point',
      'Victory Point',
      'Victory Point',
      'Victory Point',
    ];
    const rand = Math.floor(Math.random() * cardProbabilities.length);
    return cardProbabilities[rand];
  };
}

export const played = (devCard: DevelopmentCard) => {
  return { ...devCard, played: false };
};
