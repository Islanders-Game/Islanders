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
