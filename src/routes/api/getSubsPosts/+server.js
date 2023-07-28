import { usersRef, postsRef } from "$lib/server/db"

export async function GET({ locals, url }) {
    if(locals.user){
        const { user } = locals;
        let offset = Number(url.searchParams.get('offset') || 0);

        let feed;
        
        if(user.subscriptions.length !== 0){
            feed = await postsRef.find({ username:{ $in:[...user.subscriptions.map(sub => sub.username)] } }).sort({date:-1}).limit(offset+20).toArray();
            feed = feed.slice(offset);
    
            feed = structuredClone(await Promise.all(feed.map(async (post) => {
                return{ ...post, user: await usersRef.findOne({ username:post.username })}
            })));

    
            return new Response(JSON.stringify({ error:false, feed }));
        }else {
            return new Response(JSON.stringify({ error:false, feed:[] }));
        }

    }else {
        return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
    }
};
