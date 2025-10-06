<script lang="ts">
	import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { joinGame, gameState } from '$lib/stores/game.svelte';

const currentPage: any = $derived(page as any);
	let manualGameId = $state('');
	let playerName = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		const paramId = currentPage.params.gameId;
		if (paramId && manualGameId === '') {
			manualGameId = paramId;
		}
	});

	const handleSubmit = async () => {
		if (isSubmitting) return;
		const trimmedName = playerName.trim();
		if (!trimmedName) {
			errorMessage = 'Enter a player name to continue.';
			return;
		}

		const trimmedGameId = manualGameId.trim();
		if (!trimmedGameId) {
			errorMessage = 'Enter a game code to join.';
			return;
		}

		errorMessage = '';
		isSubmitting = true;
		try {
			gameState.error = undefined;
			await joinGame(trimmedGameId, trimmedName);
			if (gameState.error) {
				errorMessage = gameState.error;
				return;
			}

			const nextId = gameState.gameId;
			if (!nextId) {
				errorMessage = 'Unable to enter the lobby. Please try again.';
				return;
			}

			await goto(`/game/${encodeURIComponent(nextId)}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			errorMessage = message || 'Something went wrong while joining the game.';
		} finally {
			isSubmitting = false;
		}
	};
</script>

<svelte:head>
	<title>Join Islanders Game</title>
</svelte:head>

<h1 class="mb-4 mt-8 text-center text-4xl font-semibold tracking-tight text-white">Islanders</h1>
<section class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-12">
	<div
		class="inline-flex overflow-hidden rounded-full border border-white/15 bg-slate-900/40 shadow-lg"
	>
		<button
			type="button"
			class="flex-1 px-6 py-3 text-base font-semibold text-white/85 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0"
			onclick={() => goto('/')}
		>
			Create
		</button>
		<button
			type="button"
			class="flex-1 bg-slate-800 px-6 py-3 text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0"
			aria-current="page"
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
		<h2 id="landing-title" class="text-2xl font-semibold text-white">Join an existing game</h2>

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

		<label class="flex flex-col gap-2 text-sm font-semibold tracking-wide text-white/80">
			Game code
			<input
				type="text"
				maxlength="24"
				bind:value={manualGameId}
				placeholder="Enter the code you received"
				required
				class="rounded-xl border border-white/20 bg-black/25 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
			/>
		</label>

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
			{isSubmitting ? 'Joining…' : 'Join game'}
		</button>
	</form>
</section>
