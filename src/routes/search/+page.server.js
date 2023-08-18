import { postsRef, usersRef, repliesRef } from "$lib/server/db"

export const ssr = false;

export async function load({ url, locals }) {
    const searchQuery = new RegExp( url.searchParams.get("q") || ".*", 'i' );

    let posts = await postsRef.find({ text: searchQuery  }).limit(20).sort({ date:-1 }).toArray();
    posts = posts.map(post => {return{ ...post, type:"post" }});
    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = await usersRef.findOne({ username:post.username });
        let replies = await repliesRef.find({ post:post.id }).toArray();
        replies = structuredClone(await Promise.all(replies.map(async (replie) => {
            let user = await usersRef.findOne({ username:replie.username });
            if(!user?.hidden || locals.user.admin) return{ ...replie, user }
        })));
        if(!user?.hidden || locals.user.admin) return{ ...post, user, replies }
    })));

    let users = structuredClone(await usersRef.find({ $or:[ { username:searchQuery }, { displayName:searchQuery } ] }).limit(20).toArray());
    users = users.map(user => {if(!user.hidden || locals.user.admin)return{ ...user, type:"user" }});

    let results = [ ...posts, ...users ].filter(el => el).sort((a, b) => 0.5 - Math.random());

    return { results };
};