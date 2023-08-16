import { usersRef, postsRef } from "$lib/server/db"

export async function GET({ locals, url }) {
    const { user } = locals;
    let offset = Number(url.searchParams.get('offset') || 0);

    let posts = [];
    if(!locals.user) return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));

    if(user.subscriptions.length === 0){
        posts = await postsRef.find({  }).sort({date:-1}).limit(offset+20).toArray();
    }else {
        posts = await postsRef.find({ username:{ $in:[...user.subscriptions.map(sub => sub.subscriptions)] } }).sort({date:-1}).limit(offset+20).toArray();
    }
    
    posts = posts.slice(offset);
    if(posts.length < 20){
        let temp = await postsRef.find({  }).limit(20-posts.length).toArray();
        posts.push(...temp);
    }
    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = await usersRef.findOne({ username:post.username });
        if(!user.hidden || locals.user.admin) return{ ...post, user }
    })));

    return new Response(JSON.stringify({ error:false, posts:posts.filter(n => n) }));
};
