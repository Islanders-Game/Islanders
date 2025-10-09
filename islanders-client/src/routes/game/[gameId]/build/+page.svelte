<script lang="ts">
	import { gameState } from '$lib/stores/game.svelte';
	import { setIsBuilding } from '$lib/stores/ui.svelte';

	const props = $props();
	const { gameId } = props.data as { gameId: string };

	// Reactive world + player references
	const currentWorld = $derived(gameState.world);
	const playerName = $derived(gameState.playerName);
	const currentTurnPlayer = $derived(
		currentWorld ? currentWorld.players[currentWorld.currentPlayer] : undefined
	);
	const viewerPlayer = $derived(() => {
		if (!currentWorld || !playerName) return undefined;
		return currentWorld.players.find((p) => p.name === playerName);
	});
	const isMyTurn = $derived(currentTurnPlayer?.name === playerName);
	const playerResources = $derived(
		viewerPlayer()?.resources ?? { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
	);

	// Costs (could later come from shared rules if exposed there)
	const buildingCosts = {
		road: { wood: 1, clay: 1, stone: 0, grain: 0, wool: 0 },
		settlement: { wood: 1, clay: 1, stone: 0, grain: 1, wool: 1 },
		city: { wood: 0, clay: 0, stone: 3, grain: 2, wool: 0 },
		developmentCard: { wood: 0, clay: 0, stone: 1, grain: 1, wool: 1 }
	} as const;

	const canAfford = (cost: typeof buildingCosts.road) => {
		return (
			playerResources.wood >= cost.wood &&
			playerResources.clay >= cost.clay &&
			playerResources.stone >= cost.stone &&
			playerResources.grain >= cost.grain &&
			playerResources.wool >= cost.wool
		);
	};

	const handleBuild = (action: keyof typeof buildingCosts | 'developmentCard') => {
		if (!isMyTurn || !viewerPlayer()) return;
		if (!canAfford(buildingCosts[action === 'developmentCard' ? 'developmentCard' : action]))
			return;
		console.log(`Build action triggered: ${action}`, { gameId, player: playerName });
		// TODO: dispatch socket action to server
		if (action === 'road') setIsBuilding('Road');
		else if (action === 'settlement') setIsBuilding('House');
		else if (action === 'city') setIsBuilding('City');
		else setIsBuilding('None');
	};
</script>

<section class="space-y-4 text-white">
	<header>
		<h2 class="text-xl font-semibold">Build</h2>
		<p class="mt-1 text-xs text-white/60">Build structures and purchase development cards</p>
	</header>

	<!-- Current Resources -->
	<article
		class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
	>
		<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">Your Resources</h3>
		<div class="grid grid-cols-5 gap-2">
			<div class="flex flex-col items-center rounded-lg bg-amber-900/20 p-2">
				<span class="text-xs text-white/50">Wood</span>
				<span class="text-lg font-bold">{playerResources.wood}</span>
			</div>
			<div class="flex flex-col items-center rounded-lg bg-red-900/20 p-2">
				<span class="text-xs text-white/50">Clay</span>
				<span class="text-lg font-bold">{playerResources.clay}</span>
			</div>
			<div class="flex flex-col items-center rounded-lg bg-gray-700/20 p-2">
				<span class="text-xs text-white/50">Stone</span>
				<span class="text-lg font-bold">{playerResources.stone}</span>
			</div>
			<div class="flex flex-col items-center rounded-lg bg-yellow-600/20 p-2">
				<span class="text-xs text-white/50">Grain</span>
				<span class="text-lg font-bold">{playerResources.grain}</span>
			</div>
			<div class="flex flex-col items-center rounded-lg bg-green-800/20 p-2">
				<span class="text-xs text-white/50">Wool</span>
				<span class="text-lg font-bold">{playerResources.wool}</span>
			</div>
		</div>
	</article>

	<!-- Build Actions -->
	<article
		class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
	>
		<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">Structures</h3>
		{#if !viewerPlayer()}
			<p
				class="mb-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200"
			>
				You haven't joined this game yet.
			</p>
		{:else if !isMyTurn}
			<p
				class="mb-2 rounded-md border border-white/10 bg-slate-800/50 px-3 py-2 text-xs text-white/60"
			>
				Waiting for {currentTurnPlayer?.name}'s turn…
			</p>
		{/if}
		<div class="space-y-3">
			<!-- Build Road -->
			<div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-3">
				<div>
					<h4 class="font-semibold">Road</h4>
					<p class="text-xs text-white/60">Cost: 1 Wood, 1 Clay</p>
				</div>
				<button
					class="btn btn-sm btn-primary"
					disabled={!isMyTurn || !canAfford(buildingCosts.road)}
					onclick={() => handleBuild('road')}
				>
					Build Road
				</button>
			</div>

			<!-- Build Settlement -->
			<div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-3">
				<div>
					<h4 class="font-semibold">Settlement</h4>
					<p class="text-xs text-white/60">Cost: 1 Wood, 1 Clay, 1 Grain, 1 Wool</p>
				</div>
				<button
					class="btn btn-sm btn-primary"
					disabled={!isMyTurn || !canAfford(buildingCosts.settlement)}
					onclick={() => handleBuild('settlement')}
				>
					Build Settlement
				</button>
			</div>

			<!-- Build City -->
			<div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-3">
				<div>
					<h4 class="font-semibold">City</h4>
					<p class="text-xs text-white/60">Cost: 3 Stone, 2 Grain</p>
				</div>
				<button
					class="btn btn-sm btn-primary"
					disabled={!isMyTurn || !canAfford(buildingCosts.city)}
					onclick={() => handleBuild('city')}
				>
					Upgrade to City
				</button>
			</div>
		</div>
	</article>

	<!-- Development Cards -->
	<article
		class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
	>
		<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">
			Development Cards
		</h3>
		<div class="space-y-3">
			<!-- Buy Development Card -->
			<div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-3">
				<div>
					<h4 class="font-semibold">Development Card</h4>
					<p class="text-xs text-white/60">Cost: 1 Stone, 1 Grain, 1 Wool</p>
					<p class="mt-1 text-xs text-white/50">
						Cards include: Knight, Victory Point, Road Building, Year of Plenty, Monopoly
					</p>
				</div>
				<button
					class="btn btn-sm btn-secondary"
					disabled={!isMyTurn || !canAfford(buildingCosts.developmentCard)}
					onclick={() => handleBuild('developmentCard')}
				>
					Buy Card
				</button>
			</div>
		</div>
	</article>

	<!-- Building Tips -->
	<div class="rounded-lg border border-white/10 bg-slate-900/50 p-4 text-xs text-white/50">
		<p class="mb-2"><strong class="text-white/70">Building Tips:</strong></p>
		<ul class="list-disc space-y-1 pl-5">
			<li>Roads connect your settlements and expand your territory</li>
			<li>Settlements produce resources from adjacent tiles</li>
			<li>Cities produce double resources compared to settlements</li>
			<li>Development cards can give you strategic advantages</li>
		</ul>
	</div>
</section>
