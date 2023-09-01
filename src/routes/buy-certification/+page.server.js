import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if(locals?.user?.certified) throw redirect(303, "/dashboard")
    return {};
};