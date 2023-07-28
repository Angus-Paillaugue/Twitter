import { postsRef, usersRef } from "$lib/server/db"
import { randomUUID } from "crypto"
import { redirect } from "@sveltejs/kit";
import { writeFileSync } from 'fs';

export async function load({ locals }) {
    const { user } = locals;

    let posts = await postsRef.find({ username:user.username }).sort({ date:-1 }).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        return{ ...post, user: await usersRef.findOne({ username:post.username })}
    })));

    return { posts };
};

/** @type {import('./$types').Actions} */
export const actions = {
    default:async({ request, locals }) => {
        const { user } = locals;
        
        if(user){
            const formData = Object.fromEntries(await request.formData());
            const { file, text } = formData;
            const id = randomUUID();
            writeFileSync(`static/files/${id+"."+file.name.split(".").at(-1)}`, Buffer.from(await file.arrayBuffer()));
            await postsRef.insertOne({ username:user.username, text, file:file ? id+"."+file.name.split(".").at(-1) : false, id, date:new Date() });

            throw redirect(303, `/post/${id}`);
        }
    }
};