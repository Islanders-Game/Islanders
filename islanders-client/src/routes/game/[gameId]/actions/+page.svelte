<script lang="ts">
	const props = $props();
	const { gameId } = props.data as { gameId: string };
</script>

<section class="space-y-4 text-white">
	<header>
		<h2 class="text-xl font-semibold">Trade & Cards</h2>
		<p class="mt-1 text-xs text-white/60">Development cards, trading, and special actions</p>
	</header>

	<article
		class="rounded-3xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
	>
		<h3 class="text-sm font-semibold tracking-wide text-white/70 uppercase">Development Cards</h3>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-xs text-white/60">
			<li>Purchase new cards and manage your hand.</li>
			<li>Trigger Year of Plenty, Monopoly, and Knight interactions.</li>
			<li>Hooks into socket actions like PlayCardAction.</li>
		</ul>
	</article>

	<article
		class="rounded-3xl border border-white/10 bg-slate-950/85 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
	>
		<h3 class="text-sm font-semibold tracking-wide text-white/70 uppercase">Trading</h3>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-xs text-white/60">
			<li>Offer resources to players, bank, or harbors.</li>
			<li>Leverages ProposeTradeAction and BankTradeAction events.</li>
			<li>Displays incoming trade proposals in a modal workflow.</li>
		</ul>
	</article>

	<div class="rounded-lg border border-white/10 bg-slate-900/50 p-4 text-xs text-white/50">
		<p>
			Socket-powered action shortcuts and dev card management will appear here once the backend
			wiring is complete.
		</p>
		<p class="mt-2">Game: <strong class="font-semibold text-white">{gameId}</strong></p>
	</div>
</section>
