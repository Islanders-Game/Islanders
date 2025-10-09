<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { startGame, updateMap } from '$lib/stores/game.svelte';
	import { WorldGenerator, type Tile } from '../../../../../islanders-shared/lib/Shared';

	const props = $props();
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;

	let radius = $state(2);
	let numberOfIslands = $state(1);
	const worldGenerator = new WorldGenerator();

	const randomizeMap = async () => {
		const map: Tile[] = worldGenerator.generateRandomMap(radius, numberOfIslands);
		await updateMap(map);
	};

	const start = (pointsToWin: number) => async () => {
		await startGame(pointsToWin);
	};
</script>

<section
	class="flex flex-1 flex-col gap-6 overflow-auto p-6 text-white/90 sm:p-8"
	aria-label="Game board"
>
	<div class="grid min-h-0 gap-6">
		<div
			class="flex flex-col overflow-hidden rounded bg-slate-950/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<div class="relative flex min-h-[500px] flex-1 overflow-hidden">
				<Map />
			</div>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<div class="rounded bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
			<h3 class="mb-4 text-lg font-semibold text-white">Map Configuration</h3>
			<div class="space-y-4">
				<div>
					<label for="radius" class="mb-2 block text-sm text-white/70">Radius</label>
					<input
						id="radius"
						type="number"
						bind:value={radius}
						min="2"
						max="12"
						class="w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
					/>
				</div>
				<div>
					<label for="islands" class="mb-2 block text-sm text-white/70">Number of Islands</label>
					<input
						id="islands"
						type="number"
						bind:value={numberOfIslands}
						min="1"
						max="13"
						disabled
						class="w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-white/50 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
					/>
				</div>
				<button class="btn w-full" onclick={randomizeMap}>
					<span>Randomize Map</span>
				</button>
			</div>
		</div>

		<button class="btn w-full" onclick={start(10)}>
			<span>Start Game</span>
		</button>
	</div>
</section>
