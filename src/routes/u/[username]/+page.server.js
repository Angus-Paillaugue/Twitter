import { usersRef, postsRef } from "$lib/server/db"
import { error } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { username } = params;
    
    const profile = (({ password, email, bookmarks, subscriptions, ...o }) => o)(structuredClone(await usersRef.findOne({ username:username })));
    if(profile?.hidden && !locals?.user?.admin) throw error(404)

    let posts = await postsRef.find({ username:profile.username }).sort({ date:-1 }).limit(20).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:post.username }))
        post.replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
            let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:replie.username }))
            if(!user?.hidden || locals.user.admin) return{ ...replie, user }
        })));
        post.replies = post.replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});
        if(!user?.hidden || locals.user.admin) return{ ...post, user }
    })));

    return { profile, posts };
};