<script lang="ts">
	import type { Player } from '../../../../islanders-shared/lib/Player';
	import { getPlayerColorAsHex } from '$lib/stores/game.svelte';

	interface PlayerInformation {
		player?: Player;
		isActive?: boolean;
		subtitle?: string;
		size?: 'sm' | 'md';
		className?: string;
	}

	const props = $props<PlayerInformation>();

	const defaultColor = '#94a3b8';

	const playerName = $derived(props.player?.name ?? '—');
	const points = $derived(props.player?.points ?? 0);
	const color = $derived(
		props.player && playerName ? (getPlayerColorAsHex(playerName) ?? defaultColor) : defaultColor
	);
	const size = $derived(props.size ?? 'md');
	const subtitle = $derived(props.subtitle ?? (props.isActive ? 'Current turn' : undefined));
</script>

<div
	class={`flex items-center gap-3 leading-tight ${
		size === 'sm' ? 'text-sm' : 'text-base'
	} ${props.isActive ? 'text-white' : 'text-white/90'} ${props.className ?? ''}`.trim()}
>
	<span class="h-10 w-2 rounded-full" style={`background-color: ${color}`}></span>
	<div class="flex flex-col">
		<span class={`font-semibold ${size === 'sm' ? 'text-base' : 'text-lg'}`}>{playerName}</span>
		<span class="text-xs opacity-80">Points: {points}</span>
		{#if subtitle}
			<span class="text-[0.65rem] tracking-wide text-white/70 uppercase">{subtitle}</span>
		{/if}
	</div>
</div>
