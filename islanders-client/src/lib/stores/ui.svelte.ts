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

export function resetUIState() {
	uiState.isBuilding = 'None';
	uiState.isMovingThief = false;
	uiState.isPlayingRoadBuilding = false;
	uiState.isPlayingKnight = false;
	uiState.isStealingFromPlayers = false;
	uiState.playerProposesTrade = undefined;
}

export function setIsBuilding(flag: BuildingType) {
	uiState.isBuilding = flag;
}

export function setIsMovingThief(flag: boolean) {
	uiState.isMovingThief = flag;
}

export function setIsPlayingKnight(flag: boolean) {
	uiState.isPlayingKnight = flag;
}

export function setIsPlayingRoadBuilding(flag: boolean) {
	uiState.isPlayingRoadBuilding = flag;
}

export function setIsStealingFromPlayers(flag: boolean) {
	uiState.isStealingFromPlayers = flag;
}

export function setPlayerProposesTrade(params: TradeParameters | undefined) {
	uiState.playerProposesTrade = params;
}
