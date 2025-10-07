<script lang="ts">
	const props = $props();
	const { gameId } = props.data as { gameId: string };
</script>

<section class="flex flex-1 flex-col gap-8 overflow-auto px-6 py-8 text-white/80 sm:px-8">
	<header class="space-y-2">
		<h2 class="text-2xl font-semibold text-white">Player Actions</h2>
		<p class="max-w-2xl leading-relaxed text-white/75">
			This screen replaces the Vuetify drawer with a responsive Svelte view for cards, build
			options, and trading. The backend calls will mirror the Vuex `game` and `ui` modules.
		</p>
	</header>

	<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		<article
			class="flex flex-col gap-4 rounded-3xl bg-slate-950/85 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-8"
		>
			<h3 class="text-xl font-semibold text-white">Build</h3>
			<ul class="list-disc space-y-2 pl-6 text-sm text-white/70">
				<li>Spend resources to place houses, roads, and cities.</li>
				<li>Supports pregame placement for the opening setup.</li>
				<li>Road Building and Knight logic will toggle contextual UI.</li>
			</ul>
		</article>

		<article
			class="flex flex-col gap-4 rounded-3xl bg-slate-950/85 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-8"
		>
			<h3 class="text-xl font-semibold text-white">Development Cards</h3>
			<ul class="list-disc space-y-2 pl-6 text-sm text-white/70">
				<li>Purchase new cards and manage your hand.</li>
				<li>Trigger Year of Plenty, Monopoly, and Knight interactions.</li>
				<li>Hooks into socket actions like `PlayCardAction`.</li>
			</ul>
		</article>

		<article
			class="flex flex-col gap-4 rounded-3xl bg-slate-950/85 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-8"
		>
			<h3 class="text-xl font-semibold text-white">Trading</h3>
			<ul class="list-disc space-y-2 pl-6 text-sm text-white/70">
				<li>Offer resources to players, bank, or harbors.</li>
				<li>Leverages the same `ProposeTradeAction` and `BankTradeAction` events.</li>
				<li>Displays incoming trade proposals in a modal workflow.</li>
			</ul>
		</article>
	</div>

	<p class="mt-auto text-sm text-white/70">
		Once connected, actions here will send socket messages scoped to game <strong
			class="font-semibold text-white">{gameId}</strong
		>.
	</p>
</section>
