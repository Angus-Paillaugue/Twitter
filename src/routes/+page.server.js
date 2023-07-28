import { postsRef, usersRef } from "$lib/server/db"

export async function load({ locals }) {
    let feed;
    if(locals.user){
        const { user } = locals;
        
        if(user.subscriptions.length == 0){
            feed = await postsRef.find({  }).sort({date:-1}).limit(20).toArray();
        }else{
            feed = await postsRef.find({ username:{ $in:[...user.subscriptions.map(sub => sub.subscriptions)] } }).sort({date:-1}).limit(20).toArray();
        }

        if(feed.length < 20){
            let temp = await postsRef.find({  }).sort({date:-1}).limit(20-feed.length).toArray();
            feed.push(...temp);
        }

        feed = structuredClone(await Promise.all(feed.map(async (post) => {
            return{ ...post, user: await usersRef.findOne({ username:post.username })}
        })));
        
        let usersAside = structuredClone(await usersRef.find({  }).limit(20).toArray());

        return { feed, usersAside};
    }else {
        return { feed:[], usersAside:[] }
    }
};