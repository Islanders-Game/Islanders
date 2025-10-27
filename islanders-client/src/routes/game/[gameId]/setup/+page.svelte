<script lang="ts">
	import {
		SocketActions,
		WorldGenerator,
		type Tile
	} from '../../../../../../islanders-shared/lib/Shared';
	import { goto } from '$app/navigation';
	import { getSocket, getWorld } from '$lib/stores/socket.svelte';

	const props = $props();
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;

	const isGameStarted = $derived(getWorld()?.gameState === 'Started');

	let radius = $state(4);
	let numberOfIslands = $state(1);
	let pointsToWin = $state(getWorld()?.pointsToWin ?? 10);
	const worldGenerator = new WorldGenerator();

	const randomizeMap = async () => {
		const map: Tile[] = worldGenerator.generateRandomMap(radius, numberOfIslands);
		const newWorld = {
			...getWorld(),
			map
		};
		getSocket()?.emit(SocketActions.newWorld, newWorld);
	};

	const startGame = async () => {
		getSocket()?.emit(SocketActions.lockMap, pointsToWin);
		await goto(base);
	};
</script>

<section class="flex flex-col gap-6">
	<div class="space-y-6">
		<div class="rounded-lg bg-base-200 p-6">
			<div class="space-y-4">
				<div>
					<label for="numberOfIslands" class="mb-2 flex justify-between text-sm">
						<span>Number of Islands</span>
					</label>
					<input
						id="numberOfIslands"
						type="range"
						bind:value={numberOfIslands}
						min="1"
						max="8"
						class="range w-full range-primary range-xs"
						disabled={isGameStarted}
					/>
				</div>

				{#if numberOfIslands > 1}
					<div>
						<label for="radius" class="mb-2 flex justify-between text-sm">
							<span>Island Size</span>
						</label>
						<input
							id="radius"
							type="range"
							bind:value={radius}
							min="2"
							max="8"
							class="range w-full range-primary range-xs"
							disabled={isGameStarted}
						/>
						<div class="mt-1 flex justify-between text-xs text-white/60">
							<span>Tiny (2)</span>
							<span>Large (8)</span>
						</div>
					</div>
				{/if}

				<button class="btn w-full" onclick={randomizeMap} disabled={isGameStarted}>
					<span>Randomize</span>
				</button>
			</div>
		</div>

		<!-- Game Rules -->
		<div class="rounded-lg bg-base-200 p-6">
			<div class="space-y-4">
				<div>
					<label for="pointsToWin" class="mb-2 flex justify-between text-sm">
						<span>Points to Win</span>
						<span class="font-mono">{pointsToWin}</span>
					</label>
					<input
						id="pointsToWin"
						type="range"
						bind:value={pointsToWin}
						min="5"
						max="15"
						class="range w-full range-primary range-xs"
						disabled={isGameStarted}
					/>
				</div>
			</div>
		</div>

		<button class="btn w-full btn-lg btn-primary" onclick={startGame} disabled={isGameStarted}>
			<span>Start Game</span>
		</button>
	</div>
</section>
