import { postsRef } from "$lib/server/db"

export async function POST({ locals, request }) {
    if(locals.user){
        const formData = await request.json();
        const { id } = formData;

        await postsRef.deleteOne({ id:id });

        return new Response(JSON.stringify({ error:false, message:"Post deleted." }));
    }else {
        return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
    }
};
