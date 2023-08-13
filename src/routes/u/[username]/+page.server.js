import { usersRef, postsRef } from "$lib/server/db"
import { error } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { username } = params;
    
    const profile = (({ password, email, bookmarks, subscriptions, ...o }) => o)(structuredClone(await usersRef.findOne({ username:username })));
    if(profile.hidden && !locals.user.admin) throw error(404)

    let posts = await postsRef.find({ username:profile.username }).sort({ date:-1 }).limit(20).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        return{ ...post, user: await usersRef.findOne({ username:post.username })}
    })));

    return { profile, posts };
};