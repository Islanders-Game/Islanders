<script lang="ts">
	import { gameStore } from '$lib/stores/game.svelte';
	import PlayerSummary from '$lib/components/PlayerSummary.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import type { BuildingType } from '$lib/stores/ui.svelte';
	import { goto } from '$app/navigation';
	import { WorldGenerator, type Tile } from '../../../../../islanders-shared/lib/Shared';
	import {
		BuyCardAction,
		EndTurnAction,
		UndoAction
	} from '../../../../../islanders-shared/lib/Action';

	const props = $props();
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;
	const world = $derived(gameStore.world);
	const players = $derived(world?.players ?? []);
	const currentPlayerIndex = $derived(world?.currentPlayer ?? -1);

	let radius = $state(4);
	let numberOfIslands = $state(1);
	const worldGenerator = new WorldGenerator();

	const randomizeMap = async () => {
		const map: Tile[] = worldGenerator.generateRandomMap(radius, numberOfIslands);
		await gameStore.updateMap(map);
	};

	const start = (pointsToWin: number) => async () => {
		await gameStore.startGame(pointsToWin);
	};

	const defaultResources = { clay: 0, grain: 0, stone: 0, wood: 0, wool: 0 };

	const currentWorld = $derived(gameStore.world);
	const currentPlayer = $derived(
		currentWorld ? currentWorld.players?.[currentWorld.currentPlayer] : undefined
	);
</script>

<section class="flex flex-col gap-5">
	<div>
		{#if players.length}
			<div class="space-y-3">
				{#each players as player, index}
					{@const resourceEntries = Object.entries(player?.resources ?? defaultResources)}
					<PlayerSummary {player} isActive={index === currentPlayerIndex} {resourceEntries} />
				{/each}
			</div>
		{:else}
			<p class="text-sm">No players have joined yet.</p>
		{/if}
	</div>

	<div>
		<h3 class="text-lg font-semibold">Map Configuration</h3>
		<div class="mt-4 space-y-4">
			<div>
				<label for="numberOfIslands" class="mb-2 flex justify-between text-sm">
					<span>Islands</span>
				</label>
				<input
					id="numberOfIslands"
					type="range"
					bind:value={numberOfIslands}
					min="1"
					max="8"
					class="range w-full range-xs"
				/>
			</div>
			{#if numberOfIslands > 1}
				<div>
					<label for="radius" class="mb-2 flex justify-between text-sm">
						<span>Size</span>
						<span class="font-mono text-white/90">{radius}</span>
					</label>
					<input
						id="radius"
						type="range"
						bind:value={radius}
						min="2"
						max="8"
						class="range w-full range-xs"
					/>
					<div class="mt-1 flex justify-between text-xs">
						<span>Tiny (2)</span>
						<span>Large (8)</span>
					</div>
				</div>
			{/if}
			<button class="btn w-full" onclick={randomizeMap}>
				<span>Generate Random Map</span>
			</button>
		</div>
	</div>

	<button class="btn w-full btn-primary" onclick={start(10)}>
		<span>Start Game</span>
	</button>
</section>
