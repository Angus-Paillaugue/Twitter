import { usersRef, postsRef, repliesRef } from "$lib/server/db"
import { error } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { username } = params;
    
    const profile = (({ password, email, bookmarks, subscriptions, ...o }) => o)(structuredClone(await usersRef.findOne({ username:username })));
    if(profile?.hidden && !locals?.user?.admin) throw error(404)

    let posts = await postsRef.find({ username:profile.username }).sort({ date:-1 }).limit(20).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = await usersRef.findOne({ username:post.username });
        let replies = await repliesRef.find({ post:post.id }).toArray();
        replies = structuredClone(await Promise.all(replies.map(async (replie) => {
            let user = await usersRef.findOne({ username:replie.username });
            if(!user?.hidden || locals.user.admin) return{ ...replie, user }
        })));
        if(!user?.hidden || locals.user.admin) return{ ...post, user, replies }
    })));

    return { profile, posts };
};