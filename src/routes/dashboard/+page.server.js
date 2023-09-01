import { postsRef, usersRef } from "$lib/server/db"
import { randomUUID } from "crypto"
import { error, redirect } from "@sveltejs/kit";
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import sharp from "sharp";
import { fileType } from "$lib/helpers";
import { Storage } from '@google-cloud/storage';
import Stripe from "stripe";
import { STRIPE_KEY } from "$env/static/private";

const stripe = new Stripe(STRIPE_KEY);

export async function load({ locals }) {
    const { user } = locals;

    let posts = await postsRef.find({ username:user.username }).sort({ date:-1 }).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user =(({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:post.username }));
        post.replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
            let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:replie.username }));
            if(!user?.hidden || locals.user.admin) return{ ...replie, user }
        })));
        post.replies = post.replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});
        if(!user?.hidden || locals.user.admin) return{ ...post, user }
    })));

    return { posts };
};

export const actions = {
    newPost:async({ request, locals }) => {
        const { user } = locals;
        const storage = new Storage();
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
            files = Object.values(files);
            let fileNames = [];
            const postId = randomUUID();

            const regexExp = new RegExp(/\B@\w+/g)
            text = text.replace(regexExp, function(match) {
                return `<user>${match}</user>`;
            });
            for await (const file of files){
                let id = randomUUID();
                let fileName = file.name;
                let ext = fileName.split(".").at(-1);
                const filePath = fileType(fileName) === "image" ? `static/files/${id+"-temp.webp"}` : `static/files/${id+"-temp."+ext}`;
                const options = { destination: id+"."+ext };
                if(fileType(fileName) === "image"){
                    await sharp(Buffer.from(await file.arrayBuffer())).webp({ quality: 50 }).toFile(filePath);
                }else {
                    writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
                }
                await storage.bucket("hellkeeperbucket").upload(filePath, options);
                unlinkSync(filePath);
                if(existsSync(filePath)) {
                    console.warn(fileType(fileName) === "image" ? id+"-temp.webp" : id+"-temp."+ext, "was not deleted !");
                }
                fileNames.push(id+"."+ext);
            }
            await postsRef.insertOne({ username:user.username, text, file:fileNames.length > 0 ? fileNames : false, id:postId, date:new Date(), replies:[] });

            throw redirect(303, `/post/${postId}`);
        }
    }
};