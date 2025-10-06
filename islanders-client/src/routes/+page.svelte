<script lang="ts">
	import { goto } from '$app/navigation';
	import { createGame, joinGame, gameState } from '$lib/stores/game.svelte';

	type Mode = 'create' | 'join';

	let mode: Mode = $state('create');
	let playerName = $state('');
	let gameId = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	const switchMode = (next: Mode) => {
		mode = next;
		errorMessage = '';
	};

	const handleSubmit = async () => {
		if (isSubmitting) return;
		const trimmedName = playerName.trim();
		if (!trimmedName) {
			errorMessage = 'Enter a player name to continue.';
			return;
		}

		if (mode === 'join' && !gameId.trim()) {
			errorMessage = 'Enter a game code to join.';
			return;
		}

		errorMessage = '';
		isSubmitting = true;
		try {
			if (mode === 'join') {
				gameState.error = undefined;
				await joinGame(gameId.trim(), trimmedName);
				if (gameState.error) {
					errorMessage = gameState.error;
					return;
				}
			} else {
				await createGame(trimmedName);
			}

			const nextGameId = gameState.gameId;
			if (!nextGameId) {
				errorMessage = 'Unable to open the game lobby. Please try again.';
				return;
			}

			await goto(`/game/${encodeURIComponent(nextGameId)}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			errorMessage = message || 'Something went wrong while contacting the game server.';
		} finally {
			isSubmitting = false;
		}
	};
</script>

<h1 class="mb-4 mt-8 text-center text-4xl font-semibold tracking-tight text-white">Islanders</h1>
<section class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-12">
	<div
		class="inline-flex overflow-hidden rounded-full border border-white/15 bg-slate-900/40 shadow-lg"
	>
		<button
			type="button"
			class="flex-1 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0"
			class:bg-slate-800={mode === 'create'}
			onclick={() => switchMode('create')}
		>
			Create
		</button>
		<button
			type="button"
			class="flex-1 px-6 py-3 text-base font-semibold text-white/80 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0"
			class:bg-slate-800={mode === 'join'}
			class:text-white={mode === 'join'}
			onclick={() => switchMode('join')}
		>
			Join
		</button>
	</div>

	<form
		class="flex flex-col gap-4 rounded-2xl bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl"
		onsubmit={(event) => {
			event.preventDefault();
			void handleSubmit();
		}}
		aria-labelledby="landing-title"
	>
		<h2 id="landing-title" class="text-2xl font-semibold text-white">
			{mode === 'create' ? 'Create a new lobby' : 'Join an existing game'}
		</h2>

		<label class="flex flex-col gap-2 text-sm font-semibold tracking-wide text-white/80">
			Player name
			<input
				type="text"
				maxlength="25"
				bind:value={playerName}
				placeholder="Choose your display name"
				required
				class="rounded-xl border border-white/20 bg-black/25 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
			/>
		</label>

		{#if mode === 'join'}
			<label class="flex flex-col gap-2 text-sm font-semibold tracking-wide text-white/80">
				Game code
				<input
					type="text"
					maxlength="24"
					bind:value={gameId}
					placeholder="Enter the code you received"
					required
					class="rounded-xl border border-white/20 bg-black/25 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
				/>
			</label>
		{/if}

		{#if errorMessage}
			<p role="alert" class="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200">
				{errorMessage}
			</p>
		{/if}

		<button
			type="submit"
			class="rounded-xl bg-gradient-to-br from-sky-500 to-sky-300 px-6 py-3 text-base font-bold text-slate-950 shadow-lg transition hover:from-sky-400 hover:to-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0 disabled:cursor-not-allowed disabled:opacity-75"
			disabled={isSubmitting}
		>
			{isSubmitting ? 'Working…' : mode === 'create' ? 'Create game' : 'Join game'}
		</button>
	</form>
</section>
