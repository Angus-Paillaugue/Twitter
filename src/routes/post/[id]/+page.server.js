import { postsRef, usersRef } from "$lib/server/db"
import { error } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { id } = params;

    let post = structuredClone(await postsRef.findOne({ id }));
    let user = structuredClone(await usersRef.findOne({ username:post.username }));
    if(!user.hidden || locals.user.admin) return { post:{ ...post, user:{ ...user } } }; else throw error(404)
};