<script lang="ts">
	type ResourceType = 'wood' | 'clay' | 'stone' | 'grain' | 'wool';
	interface ResourcePanelProps {
		title: string;
		resources: Record<ResourceType, number>;
		maxResources?: Record<ResourceType, number>;
		resourceColors: Record<ResourceType, string>;
		onChange: (resource: ResourceType, next: number) => void;
	}

	const { title, resources, maxResources, resourceColors, onChange }: ResourcePanelProps = $props();

	const clamp = (r: ResourceType, v: number) => {
		if (!maxResources) return Math.max(0, v);
		const max = maxResources[r] ?? Number.POSITIVE_INFINITY;
		return Math.min(Math.max(0, v), max);
	};

	const handleInput = (r: ResourceType, value: string) => {
		const numeric = Number(value);
		if (Number.isNaN(numeric)) return;
		onChange(r, clamp(r, numeric));
	};
	const inc = (r: ResourceType) => onChange(r, clamp(r, resources[r] + 1));
	const dec = (r: ResourceType) => onChange(r, clamp(r, resources[r] - 1));
</script>

<div>
	<article class="rounded bg-base-300 px-4 py-3">
		<h4 class="pb-2 uppercase">{title}</h4>
		{#each Object.entries(resources) as [resource, count]}
			<div class="flex items-center justify-between rounded-lg p-1">
				<div class="flex min-w-0 flex-1 items-center gap-2 text-sm capitalize">
					<span class={`h-3 w-3 rounded ${resourceColors[resource as ResourceType]}`}></span>
					<span class="truncate">{resource}</span>
				</div>
				<div class="flex items-center gap-2">
					<button
						class="btn btn-xs"
						onclick={() => dec(resource as ResourceType)}
						disabled={count <= 0}>-</button
					>
					<input
						class="input input-xs w-20 text-center"
						min="0"
						{...maxResources ? { max: maxResources[resource as ResourceType] } : {}}
						value={count}
						oninput={(e) =>
							handleInput(resource as ResourceType, (e.target as HTMLInputElement).value)}
					/>
					<button
						class="btn btn-xs"
						onclick={() => inc(resource as ResourceType)}
						disabled={maxResources && count >= (maxResources[resource as ResourceType] ?? Infinity)}
						>+</button
					>
				</div>
			</div>
		{/each}
	</article>
</div>
