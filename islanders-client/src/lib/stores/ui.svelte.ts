import type { Resources } from '../../../../islanders-shared/lib/Shared';

export type BuildingType = 'None' | 'House' | 'City' | 'Road';
export type TradeParameters = { player: string; resources: Resources; wants: Resources };

class UIStore {
	isBuilding = $state<BuildingType>('None');
	isMovingThief = $state(false);
	isPlayingRoadBuilding = $state(false);
	isPlayingKnight = $state(false);
	isStealingFromPlayers = $state(false);
	playerProposesTrade = $state<TradeParameters | undefined>(undefined);

	reset() {
		this.isBuilding = 'None';
		this.isMovingThief = false;
		this.isPlayingRoadBuilding = false;
		this.isPlayingKnight = false;
		this.isStealingFromPlayers = false;
		this.playerProposesTrade = undefined;
	}

	setBuilding(flag: BuildingType) {
		this.isBuilding = flag;
	}

	setMovingThief(flag: boolean) {
		this.isMovingThief = flag;
	}

	setPlayingKnight(flag: boolean) {
		this.isPlayingKnight = flag;
	}

	setPlayingRoadBuilding(flag: boolean) {
		this.isPlayingRoadBuilding = flag;
	}

	setStealingFromPlayers(flag: boolean) {
		this.isStealingFromPlayers = flag;
	}

	setProposesTrade(params: TradeParameters | undefined) {
		this.playerProposesTrade = params;
	}
}

export const uiStore = new UIStore();
