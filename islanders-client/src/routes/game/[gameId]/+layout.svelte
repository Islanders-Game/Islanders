<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import { socket } from '$lib/stores/socket.svelte';
	import { env } from '$env/dynamic/public';
	import { game } from '$lib/stores/game.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ResourcesBar from '$lib/components/ResourcesBar.svelte';
	import type { Player } from '../../../../../islanders-shared/lib/Shared';
	import { notifications } from '$lib/stores/notifications.svelte';

	const props = $props();
	const { children, data } = props;
	const { gameId } = data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;
	const host = env.PUBLIC_SERVER;

	const tabs = [
		{ id: 'players' as const, href: `${base}`, label: 'Players' },
		{ id: 'build' as const, href: `${base}/build`, label: 'Build' },
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
	let modalElement: HTMLDialogElement;

	const applyTheme = (t: string) => {
		if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', t);
	};

	const handleTabClick = (href: string) => (event: MouseEvent) => {
		event.preventDefault();
		void goto(href);
	};

	const attemptJoin = async (name: string) => {
		localError = '';
		const trimmed = name.trim();
		if (!trimmed) {
			localError = 'Please enter your name to continue.';
			return false;
		}

		isSubmitting = true;
		await game.joinGame(gameId, trimmed);
		isSubmitting = false;

		if (game.error) {
			localError = game.error;
			return false;
		}

		modalElement?.close();
		return true;
	};

	const submitName = async () => {
		await attemptJoin(nameInput);
	};

	onMount(() => {
		const handleInitialJoin = async () => {
			const session = game.getStoredSession();
			const candidateName =
				session && session.gameId === gameId ? session.playerName : game.playerName;

			if (candidateName && candidateName.trim()) {
				nameInput = candidateName.trim();
				const success = await attemptJoin(candidateName);
				if (success) {
					return;
				}
			}

			modalElement?.showModal();
		};

		void handleInitialJoin();

		applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', (e: MediaQueryListEvent) => {
				applyTheme(e.matches ? 'dark' : 'light');
			});
	});

	const currentPlayer: Player | undefined = $derived(
		game.world?.players.find((player: Player) => player.name === game.playerName)
	);
	const playerResources = $derived(
		currentPlayer?.resources ?? { wood: 0, clay: 0, stone: 0, grain: 0, wool: 0 }
	);
</script>

<div class="flex h-screen overflow-hidden">
	<section class="flex min-w-0 flex-1" aria-label="Game map">
		<div class="relative flex h-full min-h-0 min-w-0 flex-1">
			<Map />
			{#if game.isGameStarted && currentPlayer && game.world?.players[game.world?.currentPlayer].name === game.playerName}
				<div
					class="absolute right-4 bottom-4 z-10 flex h-14 gap-1 rounded-md bg-base-200/40 p-1 backdrop-blur-md"
				>
					<button
						class="btn h-full btn-primary"
						onclick={() => {
							console.log('End turn clicked');
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
						class:bg-green-400={socket.connected}
						class:bg-red-400={!socket.connected}
						aria-label="Connection status indicator"
					></div>
					<div
						class="flex max-w-0 flex-col overflow-hidden text-xs whitespace-nowrap opacity-0 transition-all group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100"
					>
						{#if socket.connected}
							<span>Connected</span>
						{:else}
							<span>Disconnected</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="toast-bottom toast-start toast-sm toast space-y-2">
				<ResourcesBar resources={playerResources} />
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

	<dialog class="modal" bind:this={modalElement}>
		<div class="modal-box">
			<h2 class="mb-4 text-lg font-semibold">Join this game</h2>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					void submitName();
				}}
				aria-label="Join game"
			>
				<label class="input">
					<span class="label">Name</span>
					<input
						type="text"
						bind:value={nameInput}
						autocomplete="name"
						placeholder="Name"
						required
					/>
				</label>
				{#if localError}
					<div class="alert alert-error">
						<span>{localError}</span>
					</div>
				{:else if game.error}
					<div class="alert alert-error">
						<span>{game.error}</span>
					</div>
				{/if}
				<div class="modal-action flex">
					<a class="btn" href="/">Cancel</a>
					<button class="btn btn-primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Joining…' : 'Join game'}
					</button>
				</div>
			</form>
		</div>
	</dialog>
</div>
