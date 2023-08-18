import { postsRef, usersRef } from "$lib/server/db"
import { error } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { id } = params;

    let post = structuredClone(await postsRef.findOne({ id }));
    let user = structuredClone(await usersRef.findOne({ username:post.username }));
    let replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
        let user = await usersRef.findOne({ username:replie.username });
        if(!user?.hidden || locals.user.admin) return{ ...replie, user }
    })));
    replies = replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});
    if(!user.hidden || locals.user.admin) return { post:{ ...post, user:{ ...user }, replies } }; else throw error(404)
};