/** @type {import('./$types').LayoutLoad} */
export async function load({ locals }) {
    if(locals.user){
        const { user } = locals;
        return { user };
    }
}