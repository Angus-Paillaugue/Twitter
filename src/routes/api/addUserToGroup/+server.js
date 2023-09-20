import { conversationsRef } from "$lib/server/db";

export async function POST({ locals, request }) {
    const { username, conversationId } = await request.json();
    const { user } = locals
    if(!locals.user) return new Response(JSON.stringify({ error:true, message:"You are not logged-in!" }));

    const conversation = await conversationsRef.findOne({ id:conversationId });
    if(conversation.type !== "group" || conversation?.admin !== user.username) return new Response(JSON.stringify({ error:true, message:"You are not the admin of this group" }));


    await conversationsRef.updateOne({ id:conversationId }, { $push: { users: username }});

    return new Response(JSON.stringify({ error:false }));
};