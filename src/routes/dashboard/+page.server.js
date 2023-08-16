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

export const actions = {
    newPost:async({ request, locals }) => {
        const { user } = locals;
        if(user){
            const data = await request.formData();
            const formData = Object.fromEntries(data);
            let { text } = formData;

            var files = Object.keys(formData).filter(function(k) {
                return k.indexOf('file-') === 0;
            }).reduce(function(newData, k) {
                newData[k] = formData[k];
                return newData;
            }, {});
            files = Object.values(files)
            let fileNames = [];
            const postId = randomUUID();

            const regexExp = new RegExp(/\B@\w+/g)
            text = text.replace(regexExp, function(match) {
                return `<user>${match}</user>`;
            });
            for(const file of files){
                let id = randomUUID();
                writeFileSync(`static/files/${id+"."+file.name.split(".").at(-1)}`, Buffer.from(await file.arrayBuffer()));
                fileNames.push(id+"."+file.name.split(".").at(-1));
            }
            await postsRef.insertOne({ username:user.username, text, file:fileNames.length > 0 ? fileNames : false, id:postId, date:new Date() });

            throw redirect(303, `/post/${postId}`);
        }
    }
};