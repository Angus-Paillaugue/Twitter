import { postsRef } from "$lib/server/db";

export async function POST({ locals, request }) {
    const { id, postId } = await request.json();
    if(!locals.user) return new Response(JSON.stringify({ error:true, message:"You are not logged-in!" }));

    await postsRef.updateOne({ id:postId }, { $pull: { replies: { id } }});

    return new Response(JSON.stringify({ error:false }));
};