import type { Resources } from '../../../../islanders-shared/lib/Shared';

export type BuildingType = 'None' | 'House' | 'City' | 'Road';
export type TradeParameters = { player: string; resources: Resources; wants: Resources };

export const uiState = $state({
	isBuilding: 'None' as BuildingType,
	isMovingThief: false,
	isPlayingRoadBuilding: false,
	isPlayingKnight: false,
	isStealingFromPlayers: false,
	playerProposesTrade: undefined as TradeParameters | undefined
});

export const resetUIState = () => {
	uiState.isBuilding = 'None';
	uiState.isMovingThief = false;
	uiState.isPlayingRoadBuilding = false;
	uiState.isPlayingKnight = false;
	uiState.isStealingFromPlayers = false;
	uiState.playerProposesTrade = undefined;
};

export const setIsBuilding = (flag: BuildingType) => {
	uiState.isBuilding = flag;
};

export const setIsMovingThief = (flag: boolean) => {
	uiState.isMovingThief = flag;
};

export const setIsPlayingKnight = (flag: boolean) => {
	uiState.isPlayingKnight = flag;
};

export const setIsPlayingRoadBuilding = (flag: boolean) => {
	uiState.isPlayingRoadBuilding = flag;
};

export const setIsStealingFromPlayers = (flag: boolean) => {
	uiState.isStealingFromPlayers = flag;
};

export const setPlayerProposesTrade = (params: TradeParameters | undefined) => {
	uiState.playerProposesTrade = params;
};
