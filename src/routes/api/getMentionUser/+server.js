import { usersRef } from "$lib/server/db"

export async function GET({ url, locals }) {
    let query = new RegExp( url.searchParams.get("query") || ".*", 'i' );

    let users;
    if(locals.user.admin){
        users = await usersRef.find({ username:query }).limit(5).project({ _id:0 }).toArray();
    }else {
        users = await usersRef.find({ username:query, hidden:{ $exists:false } }).limit(5).project({ _id:0 }).toArray();
    }

    return new Response(JSON.stringify(users));
};