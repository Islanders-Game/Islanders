<script lang="ts">
	import type { Player } from '../../../../islanders-shared/lib/Player';
	import { getPlayerColorAsHex } from '$lib/stores/game.svelte';

	interface PlayerInformation {
		player?: Player;
		isActive?: boolean;
		resourceEntries: [string, any][];
	}

	const { player, resourceEntries, isActive }: PlayerInformation = $props();

	const defaultColor = '#94a3b8';

	const playerName = $derived(player?.name ?? '—');
	const points = $derived(player?.points ?? 0);
	const color = $derived(
		player && playerName ? (getPlayerColorAsHex(playerName) ?? defaultColor) : defaultColor
	);
</script>

<div
	class="card card-body w-full gap-4 transition-colors"
	class:bg-base-300={isActive}
	class:bg-base-200={!isActive}
	class:border={isActive}
	class:text-base-900={isActive}
	class:text-base={!isActive}
>
	<div class="flex items-center">
		<div class="flex w-full flex-row gap-2">
			<span class="min-h-full w-2 rounded-full" style={`background-color: ${color}`}></span>
			<div class="flex flex-col">
				<span class="text-base font-semibold">{playerName}</span>
				<span class="text-xs">Points: {points}</span>
			</div>
		</div>
	</div>

	<div class="flex w-full flex-row flex-wrap uppercase">
		{#each resourceEntries as [resource, amount]}
			<span class="badge text-xs">
				{resource}: <span>{amount}</span>
			</span>
		{/each}
	</div>
</div>
