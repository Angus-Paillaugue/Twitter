import { postsRef, usersRef } from "$lib/server/db"

export async function POST({ request, locals }) {
    const formData = await request.json();
    const { q } = formData;
    const searchQuery = new RegExp( q || ".*", 'i' );

    let posts = await postsRef.find({ text: searchQuery  }).limit(20).sort({ date:-1 }).toArray();
    posts = posts.map(post => {return{ ...post, type:"post" }});
    posts = structuredClone(await Promise.all(posts.map(async (post) => {
        let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:post.username }));
        if(!user.hidden || locals.user.admin) return{ ...post, user};
    })));

    let users = await usersRef.find({ $or:[ { username:searchQuery }, { displayName:searchQuery } ] }).project({ password:0, email:0, bookmarks:0, subscriptions:0, blockedUsers:0, _id:0}).limit(20).toArray();
    users = users.map(user => {if(!user.hidden || locals.user.admin)return{ ...user, type:"user" }});

    let results = [ ...posts, ...users ].filter(el => el).sort((a, b) => 0.5 - Math.random());

    return new Response(JSON.stringify({ results }));
};