<script lang="ts" context="module">
	export type Resources = {
		wood: number;
		clay: number;
		stone: number;
		grain: number;
		wool: number;
	};
</script>

<script lang="ts">
	export let resources: Resources;

	const baseColors = {
		wood: 'amber',
		clay: 'red',
		stone: 'gray',
		grain: 'yellow',
		wool: 'green'
	} as const;

	const background = (type: keyof typeof baseColors) => {
		switch (type) {
			case 'wood':
				return 'bg-amber-500/85';
			case 'clay':
				return 'bg-red-500/85';
			case 'stone':
				return 'bg-gray-500/85';
			case 'grain':
				return 'bg-yellow-500/85';
			case 'wool':
				return 'bg-green-500/85';
		}
	};
</script>

<div class="flex h-14 w-full min-w-96 gap-1 rounded-md bg-base-200/40 p-1 backdrop-blur-md">
	{#each Object.entries(resources) as [key, value]}
		<div
			class={`flex grow flex-col items-center justify-center rounded ${background(key as keyof typeof baseColors)}`}
		>
			<span class="text-[10px] font-semibold tracking-wide uppercase">{key}</span>
			<span class="font-bold">{value}</span>
		</div>
	{/each}
</div>
