<script lang="ts">
	import { gameState, getPlayerColorAsHex } from '$lib/stores/game.svelte';
	import type { Player } from '../../../../../../islanders-shared/lib/Player';

	const props = $props();
	const { gameId } = props.data as { gameId: string };

	type ResourceType = 'wood' | 'clay' | 'stone' | 'grain' | 'wool';

	// Reactive game data
	const currentWorld = $derived(gameState.world);
	const currentPlayerName = $derived(gameState.playerName);
	const currentPlayer = $derived(() => {
		if (!currentWorld || !currentPlayerName) return undefined;
		return currentWorld.players.find((p) => p.name === currentPlayerName);
	});
	const playerResources = $derived(
		currentPlayer()?.resources ?? { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
	);

	// Get other players (excluding current player)
	const otherPlayers = $derived(() => {
		if (!currentWorld || !currentPlayerName) return [];
		return currentWorld.players
			.filter((p) => p.name !== currentPlayerName)
			.map((p) => ({
				name: p.name,
				color: getPlayerColorAsHex(p.name) ?? '#ffffff'
			}));
	});

	// Trade offer state
	let offerResources = $state({
		wood: 0,
		clay: 0,
		stone: 0,
		grain: 0,
		wool: 0
	});

	let requestResources = $state({
		wood: 0,
		clay: 0,
		stone: 0,
		grain: 0,
		wool: 0
	});

	let selectedPlayer = $state<string | null>(null);
	let tradeMode = $state<'player' | 'bank' | 'harbor'>('player');

	// Reset selected player when changing away from player trade mode
	$effect(() => {
		if (tradeMode !== 'player') {
			selectedPlayer = null;
		}
	});

	const resourceColors: Record<ResourceType, string> = {
		wood: 'bg-amber-700',
		clay: 'bg-red-800',
		stone: 'bg-gray-600',
		grain: 'bg-yellow-600',
		wool: 'bg-green-700'
	};

	const incrementOffer = (resource: ResourceType) => {
		if (offerResources[resource] < playerResources[resource]) {
			offerResources[resource]++;
		}
	};

	const decrementOffer = (resource: ResourceType) => {
		if (offerResources[resource] > 0) {
			offerResources[resource]--;
		}
	};

	const incrementRequest = (resource: ResourceType) => {
		requestResources[resource]++;
	};

	const decrementRequest = (resource: ResourceType) => {
		if (requestResources[resource] > 0) {
			requestResources[resource]--;
		}
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

<section class="space-y-4 text-white">
	<header>
		<h2 class="text-xl font-semibold">Trade</h2>
		<p class="mt-1 text-xs text-white/60">Trade resources with players, bank, or harbors</p>
	</header>

	{#if !currentPlayer()}
		<div class="rounded border">
			<p class="font-semibold">You must join the game first!</p>
			<p class="mt-1 text-xs">Enter your name to join and start trading.</p>
		</div>
	{:else}
		<div class="tabs-box tabs">
			<button
				class="tab"
				class:tab-active={tradeMode === 'player'}
				onclick={() => (tradeMode = 'player')}
			>
				Player Trade
			</button>
			<button
				class="tab"
				class:tab-active={tradeMode === 'bank'}
				onclick={() => (tradeMode = 'bank')}
			>
				Bank Trade
			</button>
			<button
				class="tab"
				class:tab-active={tradeMode === 'harbor'}
				onclick={() => (tradeMode = 'harbor')}
			>
				Harbor Trade
			</button>
		</div>

		<!-- Player Selection (only for player trade) -->
		{#if tradeMode === 'player'}
			<article
				class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
			>
				<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">
					Select Player
				</h3>
				{#if otherPlayers().length > 0}
					<div class="flex gap-2">
						{#each otherPlayers() as player}
							<button
								class="btn flex-1 btn-sm"
								class:btn-active={selectedPlayer === player.name}
								onclick={() => (selectedPlayer = player.name)}
							>
								<span class="mr-2 h-3 w-3 rounded-full" style="background-color: {player.color}"
								></span>
								{player.name}
							</button>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-white/60">No other players in the game yet.</p>
				{/if}
			</article>
		{/if}

		<!-- Your Resources -->
		<article
			class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">
				Your Resources
			</h3>
			<div class="grid grid-cols-5 gap-2">
				{#each Object.entries(playerResources) as [resource, count]}
					<div
						class="flex flex-col items-center rounded-lg {resourceColors[
							resource as ResourceType
						]}/20 p-2"
					>
						<span class="text-xs text-white/50 capitalize">{resource}</span>
						<span class="text-lg font-bold">{count}</span>
					</div>
				{/each}
			</div>
		</article>

		<!-- Trade Offer -->
		<article
			class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">You Offer</h3>
			<div class="space-y-2">
				{#each Object.entries(offerResources) as [resource, count]}
					<div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
						<span class="w-16 text-sm capitalize">{resource}</span>
						<div class="flex items-center gap-2">
							<button
								class="btn btn-circle btn-xs"
								onclick={() => decrementOffer(resource as ResourceType)}
								disabled={count === 0}
							>
								-
							</button>
							<span class="w-8 text-center font-bold">{count}</span>
							<button
								class="btn btn-circle btn-xs"
								onclick={() => incrementOffer(resource as ResourceType)}
								disabled={count >= playerResources[resource as ResourceType]}
							>
								+
							</button>
						</div>
					</div>
				{/each}
			</div>
		</article>

		<!-- Trade Request -->
		<article
			class="rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<h3 class="mb-3 text-sm font-semibold tracking-wide text-white/70 uppercase">You Request</h3>
			<div class="space-y-2">
				{#each Object.entries(requestResources) as [resource, count]}
					<div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
						<span class="w-16 text-sm capitalize">{resource}</span>
						<div class="flex items-center gap-2">
							<button
								class="btn btn-circle btn-xs"
								onclick={() => decrementRequest(resource as ResourceType)}
								disabled={count === 0}
							>
								-
							</button>
							<span class="w-8 text-center font-bold">{count}</span>
							<button
								class="btn btn-circle btn-xs"
								onclick={() => incrementRequest(resource as ResourceType)}
							>
								+
							</button>
						</div>
					</div>
				{/each}
			</div>
		</article>

		<!-- Trade Actions -->
		<div class="flex gap-2">
			<button class="btn flex-1 btn-outline" onclick={clearTrade}>Clear</button>
			<button class="btn flex-1 btn-primary" disabled={!canProposeTrade()} onclick={proposeTrade}>
				Propose Trade
			</button>
		</div>

		<!-- Trade Info -->
		<div class="rounded-lg border border-white/10 bg-slate-900/50 p-4 text-xs text-white/50">
			<p class="mb-2"><strong class="text-white/70">Trade Information:</strong></p>
			<ul class="list-disc space-y-1 pl-5">
				<li><strong>Player Trade:</strong> Negotiate trades with other players (any ratio)</li>
				<li><strong>Bank Trade:</strong> Trade with the bank at 4:1 ratio</li>
				<li><strong>Harbor Trade:</strong> Use harbors for better ratios (3:1 or 2:1)</li>
			</ul>
		</div>
	{/if}
</section>
