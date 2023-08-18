import { postsRef } from "$lib/server/db";

export async function POST({ locals, request }) {
    const formData = await request.json();
    const { text, id } = formData;
    if(!locals.user) return new Response(JSON.stringify({ error:true, message:"You are not logged-in!" }));

    await postsRef.updateOne({ id }, { $push: { replies: { username:locals.user.username, text, date:new Date() }} });

    return new Response(JSON.stringify({ error:false, message:"Replie saved!" }));
};