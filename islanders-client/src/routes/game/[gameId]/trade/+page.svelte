<script lang="ts">
	import { gameState, getPlayerColorAsHex } from '$lib/stores/game.svelte';
	import ResourcePanel from '$lib/components/trade/ResourcePanel.svelte';

	const props = $props();
	const { gameId } = props.data as { gameId: string };

	type ResourceType = 'wood' | 'clay' | 'stone' | 'grain' | 'wool';

	const currentWorld = $derived(gameState.world);
	const currentPlayerName = $derived(gameState.playerName);
	const currentPlayer = $derived.by(() => {
		if (!currentWorld || !currentPlayerName) return undefined;
		return currentWorld.players.find((p) => p.name === currentPlayerName);
	});
	const playerResources = $derived(
		currentPlayer ? currentPlayer?.resources : { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
	);

	const otherPlayers = $derived.by(() => {
		if (!currentWorld || !currentPlayerName) return [] as { name: string; color: string }[];
		return currentWorld.players
			.filter((p) => p.name !== currentPlayerName)
			.map((p) => ({ name: p.name, color: getPlayerColorAsHex(p.name) ?? '#ffffff' }));
	});

	let offerResources = $state<Record<ResourceType, number>>({
		wood: 0,
		clay: 0,
		stone: 0,
		grain: 0,
		wool: 0
	});
	let requestResources = $state<Record<ResourceType, number>>({
		wood: 0,
		clay: 0,
		stone: 0,
		grain: 0,
		wool: 0
	});
	let selectedPlayer = $state<string | null>(null);
	let tradeMode = $state<'player' | 'bank' | 'harbor'>('player');

	$effect(() => {
		if (tradeMode !== 'player') selectedPlayer = null;
	});

	const resourceColors: Record<ResourceType, string> = {
		wood: 'bg-amber-700',
		clay: 'bg-red-800',
		stone: 'bg-gray-600',
		grain: 'bg-yellow-600',
		wool: 'bg-green-700'
	};

	const canProposeTrade = () => {
		const hasOffer = Object.values(offerResources).some((v) => v > 0);
		const hasRequest = Object.values(requestResources).some((v) => v > 0);
		return hasOffer && hasRequest && (tradeMode !== 'player' || selectedPlayer !== null);
	};

	const proposeTrade = () => {
		console.log('Proposing trade:', {
			mode: tradeMode,
			player: selectedPlayer,
			offer: offerResources,
			request: requestResources
		});
		// TODO: Implement socket trade action
	};
	const clearTrade = () => {
		offerResources = { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 };
		requestResources = { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 };
		selectedPlayer = null;
	};
</script>

<div class="flex flex-col gap-6">
	<fieldset class="fieldset">
		<select id="trade-mode-select" class="select w-full bg-base-300" bind:value={tradeMode}>
			<option value="player">Player</option>
			<option value="bank">Bank</option>
			<option value="harbor">Harbor</option>
		</select>
	</fieldset>

	{#if tradeMode === 'player'}
		<div class="rounded bg-base-300 p-4">
			{#if otherPlayers.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each otherPlayers as player}
						<label
							class="flex cursor-pointer items-center gap-2 rounded border border-base-300 px-3 py-2 text-sm transition hover:bg-base-200"
						>
							<input
								type="radio"
								name="trade-player"
								class="radio"
								value={player.name}
								bind:group={selectedPlayer}
								aria-label={`Select player ${player.name}`}
							/>
							<span class="h-3 w-3 rounded-full" style="background-color: {player.color}"></span>
							<span>{player.name}</span>
						</label>
					{/each}
				</div>
			{:else}
				<p class="text-sm">No other players available.</p>
			{/if}
		</div>
	{/if}

	<ResourcePanel
		title="Offer"
		resources={offerResources}
		maxResources={playerResources}
		{resourceColors}
		onChange={(r, v) => (offerResources[r] = v)}
	/>

	<ResourcePanel
		title="Request"
		resources={requestResources}
		{resourceColors}
		onChange={(r, v) => (requestResources[r] = v)}
	/>

	<div class="flex gap-2">
		<button class="btn flex-1 btn-outline" onclick={clearTrade}>Clear</button>
		<button class="btn flex-1 btn-primary" disabled={!canProposeTrade()} onclick={proposeTrade}>
			Propose Trade
		</button>
	</div>
</div>
