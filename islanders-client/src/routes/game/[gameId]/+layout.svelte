<script lang="ts">
	import { onMount } from 'svelte';
	import { connect, socketStore } from '$lib/stores/socket';
	import { env } from '$env/dynamic/public';
	import { gameState, getStoredSession, joinGame } from '$lib/stores/game.svelte';

	const props = $props();
	const children = props.children;
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;
	const host = env.PUBLIC_SERVER;

	const links = [
		{ href: base, label: 'Board' },
		{ href: `${base}/setup`, label: 'Setup' },
		{ href: `${base}/overview/players`, label: 'Overview' },
		{ href: `${base}/actions`, label: 'Player Actions' }
	] as const;

	let shouldPromptName = $state(false);
	let nameInput = $state('');
	let localError = $state('');
	let isSubmitting = $state(false);

	const attemptJoin = async (name: string) => {
		localError = '';
		const trimmed = name.trim();
		if (!trimmed) {
			localError = 'Please enter your name to continue.';
			return false;
		}

		isSubmitting = true;
		connect(`${host}/${gameId}`);
		await joinGame(gameId, trimmed);
		isSubmitting = false;

		if (gameState.error) {
			localError = gameState.error;
			shouldPromptName = true;
			return false;
		}

		shouldPromptName = false;
		return true;
	};

	const submitName = async () => {
		await attemptJoin(nameInput);
	};

	onMount(() => {
		const handleInitialJoin = async () => {
			connect(`${host}/${gameId}`);
			const session = getStoredSession();
			const candidateName =
				session && session.gameId === gameId
					? session.playerName
					: gameState.playerName;

			if (candidateName && candidateName.trim()) {
				nameInput = candidateName.trim();
				const joined = await attemptJoin(candidateName);
				if (!joined) {
					shouldPromptName = true;
				}
			} else {
				shouldPromptName = true;
			}
		};

		void handleInitialJoin();
	});
</script>

<div>
	<header>
		<div>
			<nav aria-label="Game sections" class="tabs-border tabs border-b border-slate-400 tabs-md">
				{#each links as link}
					<a class="tab" href={link.href}>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	{@render children?.()}

	<footer>
		<div class="toast-end toast">
			<div class="alert">
				<div
					class="h-2 w-2 rounded-full"
					class:bg-green-200={$socketStore.connected}
					class:bg-yellow-200={$socketStore.connecting}
					class:bg-red-200={!$socketStore.connected && !$socketStore.connecting}
				></div>
				<div class="ml-2 flex flex-col text-xs text-slate-400">
					<span>Game: {gameId}</span>
					<span>
						Status:
						{#if $socketStore.connected}
							Connected{$socketStore.socketId ? ` (#${$socketStore.socketId})` : ''}
						{:else if $socketStore.connecting}
							Reconnecting ({$socketStore.reconnectAttempts})
						{:else}
							Disconnected{#if $socketStore.error}: {$socketStore.error}{/if}
						{/if}
					</span>
				</div>
			</div>
		</div>
	</footer>

	{#if shouldPromptName}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur">
			<form
				onsubmit={(event) => {
					event.preventDefault();
					void submitName();
				}}
				class="w-full max-w-sm rounded border border-slate-700 bg-slate-900/95 p-6 shadow-xl"
				aria-label="Join game"
			>
				<h2 class="mb-4 text-lg font-semibold text-white">Join this game</h2>
				<label class="input">
					<span class="label">Enter your name</span>
					<input
						type="text"
						bind:value={nameInput}
						autocomplete="name"
						placeholder="Player name"
						required
					/>
				</label>
				{#if localError}
					<div class="alert alert-error mt-4">
						<span>{localError}</span>
					</div>
				{:else if gameState.error}
					<div class="alert alert-error mt-4">
						<span>{gameState.error}</span>
					</div>
				{/if}
				<div class="mt-6 flex justify-end gap-2">
					<a class="btn" href="/">Cancel</a>
					<button class="btn btn-primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Joining…' : 'Join game'}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
