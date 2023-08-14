import { conversationsRef, messagesRef } from "$lib/server/db";

export async function POST({ locals, request }) {
    const formData = await request.json();
    const { id, message, messageId } = formData;
    if(!locals.user) return new Response({ error:true, message:"You are not logged-in!" });

    let usernames = await conversationsRef.findOne({ id });

    await messagesRef.insertOne({ conversation:id, id:messageId, sender:locals.user.username, receiver:usernames.users.filter(username => username !== locals.user.username)[0], message, date:new Date(), seen:false });
    await conversationsRef.updateOne({ id }, { $set:{ lastMessage:new Date() } });

    return new Response({ error:false, message:"Message saved!" });
};