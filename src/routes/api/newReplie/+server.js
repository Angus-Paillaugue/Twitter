import { postsRef, usersRef } from "$lib/server/db";
import { randomUUID } from "crypto";

export async function POST({ locals, request }) {
    const { text, id } = await request.json();
    if(!locals.user) return new Response(JSON.stringify({ error:true, message:"You are not logged-in!" }));

    await postsRef.updateOne({ id }, { $push: { replies: { username:locals.user.username, text, date:new Date(), id:randomUUID() } }});

    const post = await postsRef.findOne({ id });
    post.replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
        let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:replie.username }));
        if(!user?.hidden || locals.user.admin) return{ ...replie, user }
    })));

    post.replies = post.replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});

    return new Response(JSON.stringify({ error:false, replie:post.replies[0] }));
};