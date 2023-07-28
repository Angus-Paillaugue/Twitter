import { postsRef, usersRef } from "$lib/server/db"

export async function load({ params }) {
    const { id } = params;

    let post = structuredClone(await postsRef.findOne({ id }));
    let user = structuredClone(await usersRef.findOne({ username:post.username }));
    
    return { post:{ ...post, user:{ ...user } } };
};