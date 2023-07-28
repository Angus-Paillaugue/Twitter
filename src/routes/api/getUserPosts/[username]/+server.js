import { usersRef, postsRef } from "$lib/server/db"

export async function GET({ locals, params, url }) {
    if(locals.user){
        const { user } = locals;
        let offset = Number(url.searchParams.get('offset') || 0);
        let username = params.username;

        let posts;
        
        if(user.subscriptions.length !== 0){
            posts = await postsRef.find({ username }).sort({date:-1}).limit(offset+20).toArray();
            posts = posts.slice(offset);
    
            posts = structuredClone(await Promise.all(posts.map(async (post) => {
                return{ ...post, user: await usersRef.findOne({ username:post.username })}
            })));

            return new Response(JSON.stringify({ error:false, posts }));
        }else {
            return new Response(JSON.stringify({ error:false, posts:[] }));
        }

    }else {
        return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
    }
};
