export type BuildingType = 'None' | 'House' | 'City' | 'Road';

export const isBuilding = $state<BuildingType>('None');
export const isMovingThief = $state(false);
export const isPlayingRoadBuilding = $state(false);
export const isPlayingKnight = $state(false);
export const isStealingFromPlayers = $state(false);
export const playerProposesTrade = $state<unknown | undefined>(undefined);
