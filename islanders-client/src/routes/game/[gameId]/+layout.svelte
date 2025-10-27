<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import { getConnected, getWorld, getError } from '$lib/stores/socket.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ResourcesBar from '$lib/components/ResourcesBar.svelte';
	import { EndTurnAction } from '../../../../../islanders-shared/lib/Action';
	import {
		getCurrentPlayer,
		getIsCurrentTurn,
		joinGame,
		playerName,
		getPlayerResources,
		sendAction
	} from '$lib/stores/game.svelte';

	const props = $props();
	const { children, data } = props;
	const { gameId } = data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;

	const tabs = [
		{ id: 'players' as const, href: `${base}`, label: 'Players' },
		{ id: 'actions' as const, href: `${base}/actions`, label: 'Actions' },
		{ id: 'trade' as const, href: `${base}/trade`, label: 'Trade' },
		{ id: 'chat' as const, href: `${base}/chat`, label: 'Chat' },
		{ id: 'setup' as const, href: `${base}/setup`, label: 'Setup' }
	];

	const currentPath = $derived(page.url.pathname);
	const activeTabId = $derived.by(() => {
		const sorted = [...tabs].sort((a, b) => b.href.length - a.href.length);
		const match = sorted.find((tab) => currentPath.startsWith(tab.href));
		return match?.id ?? 'players';
	});

	let nameInput = $state('');
	let localError = $state('');
	let isSubmitting = $state(false);

	const applyTheme = (t: string) => {
		if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', t);
	};

	const handleTabClick = (href: string) => (event: MouseEvent) => {
		event.preventDefault();
		void goto(href);
	};

	const submitName = async () => {
		const trimmed = nameInput.trim();
		if (!trimmed) {
			localError = 'Please enter your name to continue.';
			return false;
		}

		isSubmitting = true;
		const result = await joinGame(gameId, trimmed);
		result.onFailure((error: string) => {
			localError = error;
		});
		isSubmitting = false;
	};

	onMount(() => {
		applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', (e: MediaQueryListEvent) => {
				applyTheme(e.matches ? 'dark' : 'light');
			});
	});

	let stealModalElement: HTMLDialogElement;
</script>

<div class="flex h-screen overflow-hidden">
	<section class="flex min-w-0 flex-1" aria-label="Game map">
		<div class="relative flex h-full min-h-0 min-w-0 flex-1">
			<Map />
			{#if getWorld()?.gameState === 'Started' && getIsCurrentTurn()}
				<div
					class="absolute right-4 bottom-20 z-10 flex h-28 w-28 flex-col items-center justify-center rounded-md bg-base-200/40 p-3 backdrop-blur-md"
				>
					<div class="text-xs font-medium opacity-70">Dice</div>
					<div class="text-4xl font-bold">
						{getWorld()?.currentDie !== 'None' ? getWorld()?.currentDie : '-'}
					</div>
				</div>
				<div
					class="absolute right-4 bottom-4 z-10 flex h-14 w-28 gap-1 rounded-md bg-base-200/40 p-1 backdrop-blur-md"
				>
					<button
						class="btn h-full w-full btn-primary"
						onclick={async () => {
							if (getWorld()?.currentPlayer === getCurrentPlayer()?.name) {
								const action = new EndTurnAction(playerName!);
								await sendAction(action);
							}
						}}
					>
						End Turn
					</button>
				</div>
			{/if}

			<div class="toast-top toast-start toast-sm toast space-y-2">
				<div
					class="group flex w-fit flex-row items-center rounded-md bg-base-200/40 py-2 pr-3 pl-3 backdrop-blur-md transition-all"
				>
					<div
						class="h-2 w-2 flex-shrink-0 rounded-full"
						class:bg-green-400={getConnected()}
						class:bg-red-400={!getConnected()}
						aria-label="Connection status indicator"
					></div>
					<div
						class="flex max-w-0 flex-col overflow-hidden text-xs whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"
					>
						{#if getConnected()}
							<span>Connected</span>
						{:else}
							<span>Disconnected</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="toast-bottom toast-start toast-sm toast space-y-2">
				<ResourcesBar resources={getPlayerResources()} />
			</div>
		</div>
	</section>
	<aside
		class="z-10 flex h-full w-[22rem] flex-shrink-0 flex-col bg-base-100"
		aria-label="Game sidebar"
	>
		<nav class="tabs-border tabs">
			{#each tabs as tab}
				<a
					class={`tab ${activeTabId === tab.id ? 'tab-active' : ''}`}
					href={tab.href}
					onclick={handleTabClick(tab.href)}
				>
					{tab.label}
				</a>
			{/each}
		</nav>
		<div class="flex-1 overflow-y-auto p-4 pt-6">
			{@render children?.()}
		</div>
	</aside>
</div>
