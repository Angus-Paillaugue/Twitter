import { usersRef } from "$lib/server/db";

export async function load({ locals }) {
    const { user } = locals;
    if(user) {
        let followedUsers = await usersRef.find({ username: { $in:user.subscriptions.map(el => el.username) } }).project({ _id:0, password:0, email:0, bookmarks:0, blockedUsers:0 }).toArray();
        followedUsers = followedUsers.filter(el => el.username !== user.username);
    
        return { user, followedUsers };
    }
}