<script lang="ts">
	const props = $props();
	const children = props.children;
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;

	const links = [
		{ href: base, label: 'Board' },
		{ href: `${base}/setup`, label: 'Setup' },
		{ href: `${base}/overview/players`, label: 'Overview' },
		{ href: `${base}/actions`, label: 'Player Actions' }
	] as const;
</script>

<div
	class="flex h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(14,98,140,0.45),_rgba(6,27,45,0.95))] text-slate-100"
>
	<header
		class="flex flex-col gap-6 border-b border-white/10 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-base"
	>
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Islanders</h1>
			<p class="text-white/70">
				Game Code:
				<span class="font-semibold text-sky-200">{gameId}</span>
			</p>
		</div>
		<nav aria-label="Game sections" class="flex flex-wrap items-center gap-2">
			{#each links as link}
				<a
					href={link.href}
					class={'rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0'}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="flex flex-1 overflow-hidden">{@render children?.()}</main>
</div>
