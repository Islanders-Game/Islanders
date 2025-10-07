<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	const props = $props();
	const { gameId } = props.data as { gameId: string };
	const base = `/game/${encodeURIComponent(gameId)}`;
</script>

<section
	class="flex flex-1 flex-col gap-6 overflow-auto p-6 text-white/90 sm:p-8"
	aria-label="Game board"
>
	<div class="grid min-h-0 gap-6 lg:grid-cols-[2fr_1fr]">
		<div
			class="flex flex-col overflow-hidden rounded-3xl bg-slate-950/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
		>
			<header class="border-b border-white/10 px-6 py-4 lg:px-8">
				<h2 class="text-xl font-semibold text-white">World Map</h2>
				<p class="mt-2 text-sm text-white/70">
					Interact with the live island grid once you have joined a lobby. Pan with drag, zoom with
					the mouse wheel or pinch trackpad gestures.
				</p>
			</header>
			<div class="relative flex flex-1 overflow-hidden">
				<Map />
			</div>
		</div>

		<aside
			class="flex flex-col gap-4 overflow-auto rounded-3xl bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] lg:p-8"
		>
			<h2 class="text-xl font-semibold text-white">Overview</h2>
			<p class="leading-relaxed text-white/75">
				Load the detailed panels at
				<a href={`${base}/overview/players`} class="font-semibold text-sky-200 hover:text-sky-100">
					Overview &rarr;
				</a>
			</p>
			<ul class="list-disc space-y-2 pl-6 text-sm text-white/70">
				<li>Players – turn order, resources, knights</li>
				<li>Chat – in-game messaging</li>
				<li>Logs – event history</li>
			</ul>
		</aside>
	</div>

	<footer class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		<div
			class="rounded-3xl bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] md:p-8"
		>
			<h2 class="text-xl font-semibold text-white">Lobby Setup</h2>
			<p class="mt-3 leading-relaxed text-white/75">
				Waiting to start? The host can configure the world in
				<a href={`${base}/setup`} class="font-semibold text-sky-200 hover:text-sky-100">
					Setup &rarr;
				</a>
			</p>
		</div>

		<div
			class="rounded-3xl bg-slate-950/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] md:p-8"
		>
			<h2 class="text-xl font-semibold text-white">Player Actions</h2>
			<p class="mt-3 leading-relaxed text-white/75">
				Build, trade, and play cards from the
				<a href={`${base}/actions`} class="font-semibold text-sky-200 hover:text-sky-100">
					Actions panel &rarr;
				</a>
			</p>
		</div>
	</footer>
</section>
