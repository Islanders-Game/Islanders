import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	throw redirect(302, `/game/${encodeURIComponent(params.gameId)}/overview/players`);
};
