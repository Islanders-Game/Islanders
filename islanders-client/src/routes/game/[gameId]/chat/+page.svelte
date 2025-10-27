<script lang="ts">
	import { getChat } from '$lib/stores/socket.svelte.ts';
	import { playerName } from '$lib/stores/game.svelte.ts';
	import { sendMessage } from '$lib/helpers';

	let messageInput = $state('');
	let container: HTMLDivElement | undefined;

	const canSend = $derived(!!messageInput.trim() && !!playerName);

	const handleSend = () => {
		if (!canSend) return;
		const text = messageInput;
		messageInput = '';
		sendMessage(text);
	};

	const handleKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};
</script>

<section class="flex h-full flex-col text-white">
	<div class="flex min-h-0 flex-1 flex-col rounded p-2">
		<div
			class="flex-1 space-y-2 overflow-y-auto pr-2 text-xs"
			bind:this={container}
			aria-live="polite"
		>
			{#each getChat() as m (crypto.randomUUID())}
				<div
					class="chat {m.user === playerName
						? 'chat-end'
						: 'chat-start'} flex flex-col rounded px-2 py-1 transition-colors"
				>
					<div class="chat-bubble">
						<div class="flex items-center gap-2">
							<span class="font-semibold">{m.user}</span>
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
				class="textarea max-h-18 min-h-18 flex-1 resize-none text-sm"
				placeholder={playerName ? 'Type a message' : 'Join the game to chat'}
				bind:value={messageInput}
				onkeydown={handleKey}
				disabled={!playerName}
				maxlength={500}
			></textarea>
			<button type="submit" class="btn h-full min-h-18 btn-primary" disabled={!canSend}>Send</button
			>
		</form>
	</div>
</section>
