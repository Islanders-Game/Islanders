<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { ui } from '$lib/stores/ui.svelte';

	const props = $props();
	const { gameId } = props.data as { gameId: string };

	const currentWorld = $derived(game.world);
	const playerName = $derived(game.playerName);
	const currentTurnPlayer = $derived.by(() =>
		currentWorld ? currentWorld.players[currentWorld.currentPlayer] : undefined
	);
	const viewerPlayer = $derived.by(() => {
		if (!currentWorld || !playerName) return undefined;
		return currentWorld.players.find((p) => p.name === playerName);
	});
	const isMyTurn = $derived(currentTurnPlayer?.name === playerName);
	const isInitialPlacementPhase = $derived(!!currentWorld && currentWorld.gameState !== 'Started');
	const playerResources = $derived(
		viewerPlayer?.resources ?? { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
	);

	const buildingCosts = {
		road: { wood: 1, clay: 1, stone: 0, grain: 0, wool: 0 },
		settlement: { wood: 1, clay: 1, stone: 0, grain: 1, wool: 1 },
		city: { wood: 0, clay: 0, stone: 3, grain: 2, wool: 0 },
		developmentCard: { wood: 0, clay: 0, stone: 1, grain: 1, wool: 1 }
	} as const;

	type BuildingCost = (typeof buildingCosts)[keyof typeof buildingCosts];

	const canAfford = (cost: BuildingCost) => {
		// During initial placement phase, roads & settlements are free (classic rules)
		if (isInitialPlacementPhase) {
			return true;
		}
		return (
			playerResources.wood >= cost.wood &&
			playerResources.clay >= cost.clay &&
			playerResources.stone >= cost.stone &&
			playerResources.grain >= cost.grain &&
			playerResources.wool >= cost.wool
		);
	};

	const handleBuild = (action: keyof typeof buildingCosts) => {
		if (!isMyTurn || !viewerPlayer) return;
		if (!canAfford(buildingCosts[action])) return;
		// Set building mode; actual placement is done on map click (Map.svelte)
		if (action === 'road') ui.setBuilding('Road');
		else if (action === 'settlement') ui.setBuilding('House');
		else if (action === 'city') ui.setBuilding('City');
		else ui.setBuilding('None');
	};

	const endTurn = async () => {
		if (!isMyTurn) return;
		await game.sendAction({ type: 'endTurn', parameters: { playerName: playerName! } });
	};
</script>

<div class="flex w-full flex-col gap-4">
	<div class="flex flex-col gap-2 rounded bg-base-300">
		<div class="flex flex-col gap-4 rounded p-2">
			<div class="flex flex-row items-center justify-between rounded px-1">
				<div>
					<h4 class="font-semibold">Road</h4>
					<p class="text-xs">1 Wood, 1 Clay</p>
				</div>
				<button
					class="btn w-1/3 btn-sm btn-primary"
					disabled={!isMyTurn || !canAfford(buildingCosts.road)}
					onclick={() => handleBuild('road')}
				>
					Road
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2 rounded bg-base-300">
		<div class="flex flex-col gap-4 rounded p-2">
			<div class="flex flex-row items-center justify-between rounded px-1">
				<div>
					<h4 class="font-semibold">Settlement</h4>
					<p class="text-xs">1 Wood, 1 Clay, 1 Grain, 1 Wool</p>
				</div>
				<button
					class="btn w-1/3 btn-sm btn-primary"
					disabled={!isMyTurn || !canAfford(buildingCosts.settlement)}
					onclick={() => handleBuild('settlement')}
				>
					Settlement
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2 rounded bg-base-300">
		<div class="flex flex-col gap-4 rounded p-2">
			<div class="flex flex-row items-center justify-between rounded">
				<div>
					<h4 class="font-semibold">City</h4>
					<p class="text-xs">3 Stone, 2 Grain</p>
				</div>
				<button
					class="btn w-1/3 btn-sm btn-primary"
					disabled={!isMyTurn || !canAfford(buildingCosts.city)}
					onclick={() => handleBuild('city')}
				>
					City
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2 rounded bg-base-300">
		<div class="flex flex-col gap-4 rounded p-2">
			<div class="flex flex-row items-center justify-between rounded px-1">
				<div>
					<h4 class="font-semibold">Development Card</h4>
					<p class="text-xs">1 Stone, 1 Grain, 1 Wool</p>
				</div>
				<button
					class="btn w-1/3 btn-sm btn-secondary"
					disabled={!isMyTurn || !canAfford(buildingCosts.developmentCard)}
					onclick={() => handleBuild('developmentCard')}
				>
					Card
				</button>
			</div>
		</div>
	</div>
</div>
