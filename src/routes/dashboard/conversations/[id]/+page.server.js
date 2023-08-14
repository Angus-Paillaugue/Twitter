import { messagesRef, usersRef, conversationsRef } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { id } = params;

    const conversation = await conversationsRef.findOne({ id });
    if(!conversation.users.includes(locals.user.username)) throw redirect(303, "/dashboard");
    const messages = await messagesRef.find({ conversation:id }).project({ _id:0 }).toArray();
    const chattingWithUser = structuredClone(await usersRef.findOne({ username:conversation.users.filter(username => username !== locals.user.username)[0] }));

    return { messages, conversation:id, chattingWithUser };
};