import { conversationsRef, messagesRef } from "$lib/server/db";

export async function POST({ locals, request }) {
    const formData = await request.json();
    const { id, message } = formData;
    if(!locals.user) return new Response({ error:true, message:"You are not logged-in!" });

    let usernames = await conversationsRef.findOne({ id });
    usernames = usernames.users;

    await messagesRef.insertOne({ conversation:id, sender:locals.user.username, receiver:usernames.filter(username => username !== locals.user.username)[0], message, date:new Date() });

    return new Response({ error:false, message:"Message saved!" });
};