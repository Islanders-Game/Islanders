<script lang="ts">
	import { chatStore } from '$lib/stores/chat.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
	import { onMount } from 'svelte';

	const props = $props();
	const { gameId } = props.data as { gameId: string };

	let messageInput = $state('');
	let containerEl: HTMLDivElement | undefined;

	const messages = $derived(chatStore.messages);
	const error = $derived(chatStore.error);
	const canSend = $derived.by(() => !!messageInput.trim() && !!gameStore.playerName);

	const handleSend = () => {
		if (!canSend) return;
		const text = messageInput;
		messageInput = '';
		chatStore.sendMessage(text);
	};

	const handleKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	onMount(() => {
		chatStore.init(gameId);
	});
</script>

<section class="flex h-full flex-col text-white">
	<div class="flex min-h-0 flex-1 flex-col rounded p-2">
		<div
			class="flex-1 space-y-2 overflow-y-auto pr-2 text-xs"
			bind:this={containerEl}
			aria-live="polite"
		>
			{#each messages as m (m.id)}
				<div
					class="chat {m.self
						? 'chat-end'
						: 'chat-start'} flex flex-col rounded px-2 py-1 transition-colors"
				>
					<div class="chat-bubble">
						<div class="flex items-center gap-2">
							<span class="font-semibold">{m.user}</span>
							<time class="text-xxs text-white/30 uppercase" class:animate-pulse={m.pending}>
								{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</time>
						</div>
						<p class="break-words whitespace-pre-wrap">{m.text}</p>
					</div>
				</div>
			{/each}
		</div>

		<form
			class="flex gap-2"
			onsubmit={(event) => {
				event.preventDefault();
				handleSend();
			}}
			aria-label="Send chat message"
		>
			<textarea
				class="textarea max-h-24 min-h-24 flex-1 resize-none text-sm"
				placeholder={gameStore.playerName ? 'Type a message' : 'Join the game to chat'}
				bind:value={messageInput}
				onkeydown={handleKey}
				disabled={!gameStore.playerName}
				maxlength={500}
			></textarea>
			<button type="submit" class="btn h-full min-h-24 btn-primary" disabled={!canSend}>Send</button
			>
		</form>

		{#if error}
			<div class="mt-2 alert alert-error py-1 text-xs">
				<span>{error}</span>
			</div>
		{/if}
	</div>
</section>
