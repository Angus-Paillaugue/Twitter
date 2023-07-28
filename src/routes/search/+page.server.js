import { postsRef, usersRef } from "$lib/server/db"

export const ssr = false;

export async function load({ url }) {
    const searchQuery = new RegExp( url.searchParams.get("q") || ".*", 'i' );

    let posts = await postsRef.find({ text: searchQuery  }).limit(20).sort({ date:-1 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        return{ ...post, user: await usersRef.findOne({ username:post.username })}
    })));

    let usersAside = structuredClone(await usersRef.find({ username:searchQuery }).limit(20).toArray());

    return { posts, usersAside };
};