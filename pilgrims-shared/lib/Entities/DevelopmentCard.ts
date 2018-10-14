import { Purchaseable } from './Purchaseable';

export class DevelopmentCard implements Purchaseable {
  public type:
    | 'Knight'
    | 'Victory Point'
    | 'Road Building'
    | 'Monopoly'
    | 'Year of Plenty'
    | 'None' = 'None';
  public cost = {
    grain: 1,
    stone: 1,
    wool: 1,
  };
}
