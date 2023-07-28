import { postsRef } from "$lib/server/db"
import { randomUUID } from "crypto"

export async function POST({ locals, request }) {
    const { user } = locals;

    if(user){
        const formData = await request.json();
        const { text, file } = formData;
        const id = randomUUID();
        await postsRef.insertOne({ username:user.username, text, file, id, date:new Date() });

        return new Response(JSON.stringify({ error:false, message:"OK", id }));
    }

    return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
};
