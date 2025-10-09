<script lang="ts">
	const props = $props();
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;
</script>

<section class="space-y-6 text-white/80">
	<header class="space-y-2">
		<h2 class="text-2xl font-semibold text-white">Pregame Setup</h2>
		<p class="leading-relaxed">
			This screen will host the Svelte port of the customization tools—map randomization, radius,
			and points to win—from the current Vue client.
		</p>
	</header>

	<div class="space-y-4">
		<article
			class="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<h3 class="text-sm font-semibold tracking-wide text-white/70 uppercase">Setup checklist</h3>
			<ul class="mt-3 list-disc space-y-2 pl-5 text-xs text-white/60">
				<li>Confirm the target map radius and island count.</li>
				<li>Share the lobby code with anyone who still needs to join.</li>
				<li>Lock in the starting resources once everyone is ready.</li>
			</ul>
		</article>
		<article
			class="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<h3 class="text-sm font-semibold tracking-wide text-white/70 uppercase">Quick links</h3>
			<ul class="mt-3 space-y-2 text-xs text-white/60">
				<li>
					<a class="font-semibold text-sky-200 hover:text-sky-100" href={base}> Return to board </a>
				</li>
				<li>
					<a class="font-semibold text-sky-200 hover:text-sky-100" href={`${base}/players`}>
						Review player overview
					</a>
				</li>
			</ul>
		</article>
	</div>

	<p class="text-sm text-white/70">
		When the lobby is set, jump back to the
		<a class="font-semibold text-sky-200 hover:text-sky-100" href={base}>board</a>
		and start the game.
	</p>
</section>
