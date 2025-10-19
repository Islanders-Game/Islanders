<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { ui } from '$lib/stores/ui.svelte';
	import { BuyCardAction } from '../../../../../../islanders-shared/lib/Action';

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
	const isPregame = $derived(currentWorld?.gameState === 'Pregame');
	const playerResources = $derived(
		viewerPlayer?.resources ?? { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
	);

	// Pregame turn conditions
	const mustPlaceHouseFirst = $derived(
		isPregame && currentWorld?.conditions.mustPlaceInitialHouse?.hasPlaced === false
	);
	const mustPlaceRoadAfterHouse = $derived(
		isPregame &&
			currentWorld?.conditions.mustPlaceInitialHouse?.hasPlaced === true &&
			currentWorld?.conditions.mustPlaceInitialRoad?.hasPlaced === false
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
		if (isPregame) {
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

	// Check if a building action is allowed based on game state and turn conditions
	const canBuild = $derived.by(() => ({
		settlement: isMyTurn && (isPregame ? mustPlaceHouseFirst : canAfford(buildingCosts.settlement)),
		road: isMyTurn && (isPregame ? mustPlaceRoadAfterHouse : canAfford(buildingCosts.road)),
		city: isMyTurn && !isPregame && canAfford(buildingCosts.city),
		developmentCard: isMyTurn && !isPregame && canAfford(buildingCosts.developmentCard)
	}));

	const handleBuild = (action: keyof typeof buildingCosts) => {
		if (!isMyTurn || !viewerPlayer) return;
		if (!canBuild[action]) return;
		// Set building mode; actual placement is done on map click (Map.svelte)
		if (action === 'road') ui.setBuilding('Road');
		else if (action === 'settlement') ui.setBuilding('House');
		else if (action === 'city') ui.setBuilding('City');
		else ui.setBuilding('None');
	};

	const handleMoveThief = () => {
		if (!isMyTurn) return;
		ui.setMovingThief(true);
	};

	const handleBuyCard = async () => {
		if (!isMyTurn || !playerName || !canBuild.developmentCard) return;
		const action = new BuyCardAction(playerName);
		await game.sendAction(action);
	};
</script>

<div class="flex w-full flex-col gap-3">
	<!-- Building Section -->
	<section class="flex flex-col gap-2">
		<h3 class="text-sm font-semibold uppercase opacity-70">Building</h3>

		<div class="flex flex-col gap-2 rounded bg-base-300 p-2">
			<div class="flex flex-row items-center justify-between">
				<div>
					<h4 class="font-semibold">Settlement</h4>
					<p class="text-xs opacity-70">1 Wood, 1 Clay, 1 Grain, 1 Wool</p>
				</div>
				<button
					class="btn w-24 btn-sm btn-primary"
					disabled={!canBuild.settlement}
					onclick={() => handleBuild('settlement')}
				>
					Build
				</button>
			</div>
		</div>

		<div class="flex flex-col gap-2 rounded bg-base-300 p-2">
			<div class="flex flex-row items-center justify-between">
				<div>
					<h4 class="font-semibold">City</h4>
					<p class="text-xs opacity-70">3 Stone, 2 Grain</p>
				</div>
				<button
					class="btn w-24 btn-sm btn-primary"
					disabled={!canBuild.city}
					onclick={() => handleBuild('city')}
				>
					Build
				</button>
			</div>
		</div>

		<div class="flex flex-col gap-2 rounded bg-base-300 p-2">
			<div class="flex flex-row items-center justify-between">
				<div>
					<h4 class="font-semibold">Road</h4>
					<p class="text-xs opacity-70">1 Wood, 1 Clay</p>
				</div>
				<button
					class="btn w-24 btn-sm btn-primary"
					disabled={!canBuild.road}
					onclick={() => handleBuild('road')}
				>
					Build
				</button>
			</div>
		</div>
	</section>

	<!-- Development Cards Section -->
	<section class="flex flex-col gap-2">
		<h3 class="text-sm font-semibold uppercase opacity-70">Development Cards</h3>

		<div class="flex flex-col gap-2 rounded bg-base-300 p-2">
			<div class="flex flex-row items-center justify-between">
				<div>
					<h4 class="font-semibold">Buy Card</h4>
					<p class="text-xs opacity-70">1 Stone, 1 Grain, 1 Wool</p>
				</div>
				<button
					class="btn w-24 btn-sm btn-secondary"
					disabled={!canBuild.developmentCard}
					onclick={handleBuyCard}
				>
					Buy
				</button>
			</div>
		</div>

		{#if viewerPlayer?.devCards && viewerPlayer.devCards.length > 0}
			<div class="flex flex-col gap-2 rounded bg-base-300 p-2">
				<h4 class="text-sm font-semibold">Your Cards ({viewerPlayer.devCards.length})</h4>
				<div class="flex flex-col gap-1">
					{#each viewerPlayer.devCards as card}
						<div class="flex items-center justify-between rounded bg-base-100 px-2 py-1 text-sm">
							<span>{card.type}</span>
							<button class="btn btn-xs" disabled={!isMyTurn}>Play</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<!-- Special Actions Section -->
	<section class="flex flex-col gap-2">
		<h3 class="text-sm font-semibold uppercase opacity-70">Special Actions</h3>

		<div class="flex flex-col gap-2 rounded bg-base-300 p-2">
			<div class="flex flex-row items-center justify-between">
				<div>
					<h4 class="font-semibold">Move Thief</h4>
					<p class="text-xs opacity-70">Move the robber to a new hex</p>
				</div>
				<button
					class="btn w-24 btn-sm btn-warning"
					disabled={!isMyTurn || isPregame}
					onclick={handleMoveThief}
				>
					Move
				</button>
			</div>
		</div>
	</section>
</div>
