import { postsRef } from "$lib/server/db";
import { unlinkSync, existsSync } from "fs";
import { Storage } from '@google-cloud/storage';

const bucketName = "hellkeeperbucket";
const storage = new Storage();

export async function POST({ locals, request }) {
    if(locals.user){
        const formData = await request.json();
        const { id } = formData;

        const post = await postsRef.findOne({ id });
        if(post?.file?.length > 0){
            for(const file of post.file){
                try {
                    if (existsSync(`static/files/${file}`)) {
                        unlinkSync(`static/files/${file}`);
                    }else {
                        await storage.bucket(bucketName).file(file).delete();
                    }
                }catch(err) {
                    console.error(err);
                }
            }
        }

        await postsRef.deleteOne({ id });

        return new Response(JSON.stringify({ error:false, message:"Post deleted." }));
    }else {
        return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
    }
};
