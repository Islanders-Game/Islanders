<script lang="ts">
	const props = $props();
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;
</script>

<section class="flex flex-1 flex-col gap-8 overflow-auto px-6 py-8 text-white/80 sm:px-8">
	<h2 class="text-2xl font-semibold text-white">Pregame Setup</h2>
	<p class="max-w-2xl leading-relaxed">
		This screen will host the Svelte port of the customization tools—map randomization, radius, and points to win—from
		the current Vue client.
	</p>

	<div class="grid gap-6 md:grid-cols-2">
		<article class="rounded-3xl bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-8">
			<h3 class="text-lg font-semibold text-white">Map Options</h3>
			<ul class="mt-4 list-disc space-y-2 pl-6 text-sm text-white/70">
				<li>Randomize islands</li>
				<li>Adjust radius and island count</li>
				<li>Preview resource distribution</li>
			</ul>
		</article>
		<article class="rounded-3xl bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-8">
			<h3 class="text-lg font-semibold text-white">Win Conditions</h3>
			<ul class="mt-4 list-disc space-y-2 pl-6 text-sm text-white/70">
				<li>Set points to win (defaults to 10)</li>
				<li>Lock the map once the lobby is ready</li>
			</ul>
		</article>
	</div>

	<p class="mt-auto text-sm text-white/75">
		When the lobby is set, jump back to the
		<a class="font-semibold text-sky-200 hover:text-sky-100" href={base}>board</a>
		and start the game.
	</p>
</section>
