import { messagesRef, usersRef, conversationsRef } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { id } = params;

    const conversation = await conversationsRef.findOne({ id });
    if(!conversation.users.includes(locals.user.username)) throw redirect(303, "/dashboard");
    const messages = await messagesRef.find({ conversation:id }).project({ _id:0 }).toArray();
    
    const chattingWithUser = (({ password, email, bookmarks, subscriptions, _id, ...o }) => o)(await usersRef.findOne({ username:conversation.users.filter(username => username !== locals.user.username)[0] }));
    await messagesRef.updateMany({ conversation:id, receiver:locals.user.username }, { $set:{ seen:true } });

    return { messages, conversation:id, chattingWithUser };
};

export const actions = {
    blockUser: async({ params, locals }) => {
        const { id } = params;
        const { user } = locals;
        const conversation = await conversationsRef.findOne({ id });
        const usernameToBlock = conversation.users.filter(username => username !== locals.user.username)[0];

        if(user.blockedUsers.includes(usernameToBlock)){
            await usersRef.updateOne({ username:user.username }, { $pull: { blockedUsers: usernameToBlock } });
        }else {
            await usersRef.updateOne({ username:user.username }, { $push: { blockedUsers: usernameToBlock } });
        }
    }
};