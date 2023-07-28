import { usersRef, postsRef } from "$lib/server/db"

export async function load({ params }) {
    const { username } = params;
    
    const profile = (({ password, email, bookmarks, subscriptions, ...o }) => o)(structuredClone(await usersRef.findOne({ username:username })));

    let posts = await postsRef.find({ username:profile.username }).sort({ date:-1 }).limit(20).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        return{ ...post, user: await usersRef.findOne({ username:post.username })}
    })));

    return { profile, posts };
};