import { postsRef, usersRef } from "$lib/server/db"
import { error } from "@sveltejs/kit";

export async function load({ params }) {
    const { id } = params;

    let post = structuredClone(await postsRef.findOne({ id }));
    let user = structuredClone(await usersRef.findOne({ username:post.username }));
    if(!user.hidden) return { post:{ ...post, user:{ ...user } } }; else throw error(404)
};