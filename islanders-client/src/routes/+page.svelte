<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { createGame, joinGame } from '$lib/stores/game.svelte';

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
				await joinGame(gameId.trim(), trimmedName);
			} else {
				const result = await createGame(trimmedName);
				goto(`/game/${encodeURIComponent(result)}`);
				return;
			}

			await goto(`/game/${encodeURIComponent(gameId)}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			errorMessage = message || 'Something went wrong while contacting the game server.';
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<section class="space-between flex w-2/3 max-w-lg flex-col rounded border border-slate-400">
		<div role="tablist" class="tabs-border tabs border-b border-slate-400 tabs-md">
			<button
				type="button"
				class="tab w-24"
				class:tab-active={mode === 'create'}
				onclick={() => switchMode('create')}
			>
				Create
			</button>
			<button
				type="button"
				class="tab w-24"
				class:tab-active={mode === 'join'}
				onclick={() => switchMode('join')}
			>
				Join
			</button>
		</div>

		<form
			onsubmit={(event) => {
				event.preventDefault();
				void handleSubmit();
			}}
			class="flex min-h-[200px] flex-col justify-between p-6"
			aria-labelledby="landing-title"
		>
			<div class="flex flex-col gap-2">
				<label class="input">
					<span class="label">Name</span>
					<input type="text" bind:value={playerName} placeholder="Player" required />
				</label>

				{#if mode === 'join'}
					<label class="input">
						<span class="label">Game</span>
						<input
							type="text"
							bind:value={gameId}
							placeholder="Enter the code you received"
							required
						/>
					</label>
				{/if}
			</div>

			<div class="toast-center toast-top toast">
				{#if errorMessage}
					<div class="alert alert-error"><span>{errorMessage}</span></div>
				{/if}
			</div>

			<div class="flex">
				<button class="btn btn-primary" type="submit" disabled={isSubmitting}>
					{mode === 'create' ? 'Create game' : 'Join game'}
				</button>
			</div>
		</form>
	</section>
</div>
