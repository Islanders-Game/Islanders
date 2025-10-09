<script lang="ts">
	import { gameState, startGame, sendAction, updateMap } from '$lib/stores/game.svelte';
	import PlayerSummary from '$lib/components/PlayerSummary.svelte';
	import { uiState, setIsBuilding, type BuildingType } from '$lib/stores/ui.svelte';
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
	const world = $derived(gameState.world);
	const players = $derived(world?.players ?? []);
	const currentPlayerIndex = $derived(world?.currentPlayer ?? -1);

	let radius = $state(4);
	let numberOfIslands = $state(1);
	const worldGenerator = new WorldGenerator();

	const randomizeMap = async () => {
		const map: Tile[] = worldGenerator.generateRandomMap(radius, numberOfIslands);
		await updateMap(map);
	};

	const start = (pointsToWin: number) => async () => {
		await startGame(pointsToWin);
	};

	const defaultResources = { clay: 0, grain: 0, stone: 0, wood: 0, wool: 0 };

	const currentWorld = $derived(gameState.world);
	const currentPlayer = $derived(
		currentWorld ? currentWorld.players?.[currentWorld.currentPlayer] : undefined
	);
	const isViewerTurn = $derived(currentPlayer?.name === gameState.playerName);
</script>

<section class="flex flex-col gap-5 text-white">
	<div>
		{#if players.length}
			<div class="space-y-3">
				{#each players as player, index}
					{@const resourceEntries = Object.entries(player?.resources ?? defaultResources)}
					<article class="rounded-lg border border-white/5 bg-white/5 p-4">
						<PlayerSummary {player} isActive={index === currentPlayerIndex} size="sm" />
						<div class="mt-3 flex flex-wrap gap-2 text-xs">
							{#each resourceEntries as [resource, amount]}
								<span
									class="rounded-full border border-white/10 bg-slate-900/60 px-2 py-1 capitalize"
								>
									{resource}: <span class="font-semibold">{amount}</span>
								</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-white/60">No players have joined yet.</p>
		{/if}
	</div>

	<div>
		<h3 class="text-lg font-semibold text-white">Map Configuration</h3>
		<div class="mt-4 space-y-4">
			<div>
				<label for="numberOfIslands" class="mb-2 flex justify-between text-sm text-white/70">
					<span>Number of Islands</span>
				</label>
				<input
					id="numberOfIslands"
					type="range"
					bind:value={numberOfIslands}
					min="1"
					max="8"
					class="w-full accent-sky-500"
				/>
			</div>
			{#if numberOfIslands > 1}
				<div>
					<label for="radius" class="mb-2 flex justify-between text-sm text-white/70">
						<span>Additional Island Size</span>
						<span class="font-mono text-white/90">{radius}</span>
					</label>
					<input
						id="radius"
						type="range"
						bind:value={radius}
						min="2"
						max="8"
						class="w-full accent-sky-500"
					/>
					<div class="mt-1 flex justify-between text-xs text-white/40">
						<span>Tiny (2)</span>
						<span>Large (8)</span>
					</div>
				</div>
			{/if}
			<button
				class="btn w-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all hover:from-emerald-500 hover:to-teal-500"
				onclick={randomizeMap}
			>
				<span>Generate Random Map</span>
			</button>
		</div>
	</div>

	<button class="btn w-full btn-primary" onclick={start(10)}>
		<span>Start Game</span>
	</button>
</section>
