import { postsRef, usersRef, repliesRef } from "$lib/server/db"

export async function load({ locals }) {
    const { user } = locals;
    const { bookmarks, subscriptions } = user;

    let completedBookmarks = structuredClone(await Promise.all(bookmarks.map(async (bookmark) => {
        let post = await postsRef.findOne({ id:bookmark.id });
        if(post){
            let postUser = await usersRef.findOne({ username:post.username });
            let replies = await repliesRef.find({ post:post.id }).toArray();
            replies = structuredClone(await Promise.all(replies.map(async (replie) => {
                let replieUser = await usersRef.findOne({ username:replie.username });
                if(!user?.hidden || locals.user.admin) return{ ...replie, user:replieUser }
            })));
            if(!postUser?.hidden || locals.user.admin) return{ ...post, user:postUser, replies, type:"post" }
        }else {
            await usersRef.updateOne({ username:user.username }, { $pull: { bookmarks: { id:bookmark.id }} });
            return null;
        }
    })));

    let completedSubscriptions = structuredClone(await Promise.all(subscriptions.map(async (subscription) => {
        let user = await usersRef.findOne({ username:subscription.username });
        if(user) return user;
    })));

    return { bookmarks:completedBookmarks.filter(n => n).reverse(), subscriptions:completedSubscriptions.filter(n => n).reverse() };
};