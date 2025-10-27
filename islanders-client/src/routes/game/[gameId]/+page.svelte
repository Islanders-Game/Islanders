<script lang="ts">
	import PlayerSummary from '$lib/components/PlayerSummary.svelte';
	import { getWorld } from '$lib/stores/socket.svelte';

	const players = $derived(getWorld()?.players ?? []);
	const currentPlayerIndex = $derived(getWorld()?.currentPlayer ?? -1);

	const defaultResources = { clay: 0, grain: 0, stone: 0, wood: 0, wool: 0 };
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
			<p class="text-sm text-white/70">No players have joined yet.</p>
		{/if}
	</div>
</section>
