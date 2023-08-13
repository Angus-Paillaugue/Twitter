import { usersRef } from "$lib/server/db"

export async function GET({ url }) {
    let query = new RegExp( url.searchParams.get("query") || ".*", 'i' );

    const users = await usersRef.find({ username:query }).limit(5).project({ _id:0 }).toArray();

    return new Response(JSON.stringify(users));
};