import { postsRef, usersRef } from "$lib/server/db"
import { randomUUID } from "crypto"
import { redirect } from "@sveltejs/kit";
import { writeFileSync, unlinkSync } from 'fs';
import sharp from "sharp";
import { fileType } from "$lib/helpers";
import ffmpeg from 'fluent-ffmpeg';

export async function load({ locals }) {
    const { user } = locals;

    let posts = await postsRef.find({ username:user.username }).sort({ date:-1 }).project({ _id:0 }).toArray();

    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = await usersRef.findOne({ username:post.username });
        post.replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
            let user = await usersRef.findOne({ username:replie.username });
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
                if(fileType(fileName) === "image"){
                    fileNames.push(id+".webp");
                    await sharp(Buffer.from(await file.arrayBuffer())).webp({ quality: 50 }).toFile(`static/files/${id+".webp"}`);
                }else if(fileType(fileName) === "video"){
                    fileNames.push(id+"."+ext);
                    writeFileSync(`static/files/${id+"-temp."+ext}`, Buffer.from(await file.arrayBuffer()));
                    ffmpeg(`static/files/${id+"-temp."+ext}`).output(`static/files/${id+"."+ext}`).videoCodec("libx264").audioCodec('aac').videoBitrate(1500).autopad().on("end", () => {
                        unlinkSync(`static/files/${id+"-temp."+ext}`);
                    }).run();
                }else {
                    writeFileSync(`static/files/${id+"."+ext}`, Buffer.from(await file.arrayBuffer()));
                }
            }
            await postsRef.insertOne({ username:user.username, text, file:fileNames.length > 0 ? fileNames : false, id:postId, date:new Date(), replies:[] });

            throw redirect(303, `/post/${postId}`);
        }
    }
};