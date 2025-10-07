<script lang="ts">
	import { page } from '$app/stores';

	const props = $props();
	const children = props.children;
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}/overview`;
	const pageStore = page;

	const tabs = [
		{ id: 'players', label: 'Players' },
		{ id: 'chat', label: 'Chat' },
		{ id: 'logs', label: 'Logs' }
	] as const;
</script>

<section>
	<header class="flex flex-col gap-3">
		<h2 class="text-2xl font-semibold text-white">Overview</h2>
		<nav
			aria-label="Overview panes"
			class="inline-flex flex-wrap justify-center gap-2 rounded-full bg-slate-950/85 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:justify-start"
		>
			{#each tabs as tab}
				<a
					href={`${base}/${tab.id}`}
					class="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0"
					class:bg-gradient-to-r={$pageStore.params.tab === tab.id}
					class:from-sky-500={$pageStore.params.tab === tab.id}
					class:to-cyan-400={$pageStore.params.tab === tab.id}
					class:text-slate-900={$pageStore.params.tab === tab.id}
				>
					{tab.label}
				</a>
			{/each}
		</nav>
	</header>

	<div
		class="flex flex-1 rounded-3xl bg-slate-950/85 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-8"
	>
		{@render children?.()}
	</div>
</section>
