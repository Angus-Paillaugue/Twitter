import { postsRef } from "$lib/server/db";
import { randomUUID } from "crypto";

export async function POST({ locals, request }) {
    if(locals.user){
        const { id } = await request.json();
        const repostId = randomUUID();

        await postsRef.insertOne({ username:locals.user.username, repost:true, postId:id, id:repostId, date:new Date().getTime() });

        return new Response(JSON.stringify({ error:false, id:repostId }));
    }else {
        return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
    }
};