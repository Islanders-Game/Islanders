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
				<span class="text-xs text-slate-400">Game:</span>
				<span class="text-xs text-slate-400">{gameId}</span>
			</div>
		</div>
	</footer>
</div>
