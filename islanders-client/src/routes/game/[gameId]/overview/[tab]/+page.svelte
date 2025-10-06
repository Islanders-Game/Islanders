<script lang="ts">
	import { page } from '$app/stores';

	const tabCopy = {
		players: {
			title: 'Players',
			body: [
				'Shows scores, resource counts, and knight totals.',
				'Highlights both the active player and longest road contenders.',
				'Will integrate the existing Vue list layout during the port.'
			]
		},
		chat: {
			title: 'Chat',
			body: [
				'Displays the live socket feed bound via `chat/bindToMessages` today.',
				'Retains color-coded avatars so you can spot teammates quickly.',
				'Supports enter-to-send and message history, like the current client.'
			]
		},
		logs: {
			title: 'Logs',
			body: [
				'Lists dice rolls, trades, and development card events.',
				'Will reuse the data emitted by the existing game socket stream.',
				'Helpful for catching up after reconnecting mid-game.'
			]
		}
	} as const;

	type TabKey = keyof typeof tabCopy;

	const pageStore = page;

	$: rawTab = $pageStore.params.tab as string | undefined;
	$: activeTab = (rawTab && rawTab in tabCopy ? (rawTab as TabKey) : undefined) satisfies
		| TabKey
		| undefined;
</script>

{#if activeTab}
	{#key activeTab}
		<article class="flex flex-col gap-3 text-white/80">
			<h3 class="text-xl font-semibold text-white">{tabCopy[activeTab].title}</h3>
			<ul class="list-disc space-y-2 pl-6 text-sm text-white/70">
				{#each tabCopy[activeTab].body as line}
					<li>{line}</li>
				{/each}
			</ul>
		</article>
	{/key}
{:else}
	<article class="flex flex-col gap-3 text-white/80">
		<h3 class="text-xl font-semibold text-white">Unknown overview tab</h3>
		<p class="text-sm text-white/70">Select Players, Chat, or Logs from the navigation above.</p>
	</article>
{/if}
