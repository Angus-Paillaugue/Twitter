import { messagesRef } from "$lib/server/db";

export async function POST({ request }) {
    const formData = await request.json();
    const { id } = formData;

    await messagesRef.updateOne({ id }, { $set:{ seen:true } });

    return new Response({ error:false, message:"Message saved!" });
};