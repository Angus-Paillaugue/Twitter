import { postsRef, usersRef } from "$lib/server/db"

export const ssr = false;

export async function load({ url, locals }) {
    const searchQuery = new RegExp( url.searchParams.get("q") || ".*", 'i' );

    let posts = await postsRef.find({ text: searchQuery  }).limit(20).sort({ date:-1 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = await usersRef.findOne({ username:post.username });
        if(!user.hidden || locals.user.admin) return{ ...post, user};
    })));

    return { posts };
};