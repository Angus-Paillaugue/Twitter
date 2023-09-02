import { postsRef, usersRef } from "$lib/server/db"

export async function load({ locals }) {
    const { user } = locals;
    const { bookmarks, subscriptions } = user;

    let completedBookmarks = structuredClone(await Promise.all(bookmarks.map(async (bookmark) => {
        let post = await postsRef.findOne({ id:bookmark.id });
        if(post){
            if(post?.repost){
                let repostedBy  =structuredClone(await usersRef.findOne({ username:post.username }));
                let tempPost = structuredClone(await postsRef.findOne({ id:post.postId }));
                tempPost.id = post.id;
                post = tempPost;
                let user =(({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:post.username }));
                post.replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
                    let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:replie.username }));
                    if(!user?.hidden || locals.user.admin) return{ ...replie, user, }
                })));
                post.replies = post.replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});
                if(!user?.hidden || locals.user.admin) return{ ...post, user, repostedBy, type:"post" }
            }else {
                let user =(({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:post.username }));
                post.replies = structuredClone(await Promise.all(post.replies.map(async (replie) => {
                    let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:replie.username }));
                    if(!user?.hidden || locals.user.admin) return{ ...replie, user }
                })));
                post.replies = post.replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});
                if(!user?.hidden || locals.user.admin) return{ ...post, user, type:"post" }
            }
        }else {
            await usersRef.updateOne({ username:user.username }, { $pull: { bookmarks: { id:bookmark.id }} });
            return null;
        }
    })));

    let completedSubscriptions = await Promise.all(subscriptions.map(async (subscription) => {
        let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:subscription.username }));
        if(user) return user;
    }));

    return { bookmarks:completedBookmarks.filter(n => n).reverse(), subscriptions:completedSubscriptions.filter(n => n).reverse() };
};