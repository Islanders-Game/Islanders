import { Turn } from './Turn';
import { ChatMessage } from './ChatMessage';
import { World } from './World';

export interface Join { gameID: string, name: string }
export interface TurnEnd { gameID: string, turn: Turn }
export interface Chat { gameID: string, message: ChatMessage }
export interface Init {gameID: string, world: World }