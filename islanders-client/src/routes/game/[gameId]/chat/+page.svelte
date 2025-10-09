<script lang="ts">
	import { chatStore, bindChat, sendChat } from '$lib/stores/chat';
	import { gameState } from '$lib/stores/game.svelte';

	const props = $props();
	const { gameId } = props.data as { gameId: string };

	// Runes state
	let messageInput = $state('');
	let containerEl: HTMLDivElement | undefined;

	// Auto-subscription via $chatStore
	const messages = $derived($chatStore.messages);
	const error = $derived($chatStore.error);
	const canSend = $derived.by(() => !!messageInput.trim() && !!gameState.playerName);

	const scrollToBottom = () => {
		if (containerEl) containerEl.scrollTop = containerEl.scrollHeight;
	};

	const handleSend = () => {
		if (!canSend) return;
		const text = messageInput;
		messageInput = '';
		sendChat(text);
		requestAnimationFrame(scrollToBottom);
	};

	const handleKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// Guarded one-time init (since $effect.once isn't a rune API)
	let __chatBound = false;
	$effect(() => {
		if (!__chatBound) {
			bindChat();
			scrollToBottom();
			__chatBound = true;
		}
	});

	// Scroll whenever messages change length
	$effect(() => {
		messages.length; // dependency tracking
		scrollToBottom();
	});
</script>

<section class="flex h-full flex-col gap-4 text-white">
	<header>
		<h2 class="text-xl font-semibold">Chat</h2>
		<p class="mt-1 text-xs text-white/60">Chat with other players in this game</p>
	</header>

	<div class="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-slate-950/70 p-3">
		<div
			class="custom-scrollbar flex-1 space-y-2 overflow-y-auto pr-2 text-xs"
			bind:this={containerEl}
			aria-live="polite"
		>
			{#if messages.length === 0}
				<p class="mt-8 text-center text-white/40">No messages yet. Say hi! 👋</p>
			{:else}
				{#each messages as m (m.id)}
					<div
						class="group flex flex-col rounded px-2 py-1 transition-colors"
						class:bg-slate-800={m.self}
					>
						<div class="flex items-center gap-2">
							<span class="font-semibold" class:text-blue-300={m.self}>{m.user}</span>
							<time class="text-[10px] tracking-wide text-white/30 uppercase">
								{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								{#if m.pending}
									<span class="ml-1 animate-pulse text-[8px] text-yellow-400/70">sending…</span>
								{/if}
							</time>
						</div>
						<p class="break-words whitespace-pre-wrap text-white/80">{m.text}</p>
					</div>
				{/each}
			{/if}
		</div>

		<form
			class="mt-3 flex items-end gap-2"
			onsubmit={(e) => {
				e.preventDefault();
				handleSend();
			}}
			aria-label="Send chat message"
		>
			<textarea
				class="textarea-bordered textarea min-h-[48px] flex-1 resize-none text-sm"
				placeholder={gameState.playerName ? 'Type a message' : 'Join the game to chat'}
				bind:value={messageInput}
				onkeydown={handleKey}
				disabled={!gameState.playerName}
				maxlength={500}
			></textarea>
			<button type="submit" class="btn btn-primary" disabled={!canSend}>Send</button>
		</form>

		{#if error}
			<div class="mt-2 alert alert-error py-1 text-xs">
				<span>{error}</span>
			</div>
		{/if}

		<p class="mt-2 text-[10px] text-white/30">
			Game: <strong class="font-semibold text-white">{gameId}</strong>
		</p>
	</div>
</section>
