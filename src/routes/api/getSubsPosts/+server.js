import { usersRef, postsRef } from "$lib/server/db"

export async function GET({ locals, url }) {
    const { user } = locals;
    let offset = Number(url.searchParams.get('offset') || 0);

    let feed = [];
    if(!locals.user) return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));

    if(user.subscriptions.length === 0){
        feed = await postsRef.find({  }).sort({date:-1}).limit(offset+20).toArray();
    }else {
        feed = await postsRef.find({ username:{ $in:[...user.subscriptions.map(sub => sub.subscriptions)] } }).sort({date:-1}).limit(offset+20).toArray();
    }
    
    feed = feed.slice(offset);
    if(feed.length < 20){
        let temp = await postsRef.find({  }).limit(20-feed.length).toArray();
        feed.push(...temp);
    }
    feed = structuredClone(await Promise.all(feed.map(async (post) => {
        let user = await usersRef.findOne({ username:post.username });
        if(!user.hidden && locals.user.admin) return{ ...post, user }
    })));

    return new Response(JSON.stringify({ error:false, feed:feed.filter(n => n) }));
};
