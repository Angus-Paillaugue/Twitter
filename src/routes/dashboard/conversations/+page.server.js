import { usersRef, conversationsRef, messagesRef } from "$lib/server/db";
import { randomUUID } from "crypto";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
    const { user } = locals;

    let conversationsWithMe = await conversationsRef.find({ users:user.username }).sort({ lastMessage:-1 }).project({ _id:0 }).toArray();

    conversationsWithMe = structuredClone(await Promise.all(conversationsWithMe.map(async (conversation) => {
        let lastMessage = await messagesRef.find({ conversation:conversation.id }).sort({ date:-1 }).limit(1).project({ _id:0 }).toArray();
        if(lastMessage.length > 0){
            lastMessage = lastMessage[0];
            const parseMention = (text) => {return text.replace(new RegExp(/(?=(<user>))(\w|\W)*(?<=<\/user>)/, "gm"), function(match) {return match.slice(6, -7);});}
            lastMessage.message = parseMention(lastMessage.message);
        }
        conversation.users = await usersRef.find({ username:{ $in:conversation.users } }).project({ _id:Object, email:0, password:0, subscriptions:0 }).toArray();
        if(Object.keys(lastMessage).length > 0) {
            return { ...conversation, lastMessage:lastMessage, users:conversation.users }
        }else {
            await conversationsRef.deleteOne({ id:conversation.id });
            return false;
        }
    })));
    conversationsWithMe = conversationsWithMe.filter(n => n);

    let followedUsers = await usersRef.find({ username: { $in:user.subscriptions.map(el => el.username) } }).project({ _id:0, password:0, email:0, bookmarks:0, blockedUsers:0 }).toArray();
    followedUsers = followedUsers.filter(el => el.username !== user.username);

    return { conversationsWithMe, followedUsers };
};

export const actions = {
    newConversation:async({ request, locals }) => {
        const { user } = locals;
        if(user){
            const formData = Object.fromEntries(await request.formData());
            const users = JSON.parse(formData.users);

            if(users.length === 1){
                const conversationExists = await conversationsRef.findOne({ users:{ $all:[ user.username,users[0] ] } });
                if(conversationExists){
                    throw redirect(303, `/dashboard/conversation/${conversationExists.id}`);
                }else {
                    const conversationId = randomUUID();
    
                    await conversationsRef.insertOne({ id:conversationId, users:[...users, user.username], lastMessage:new Date(), type:"dm" });
                    throw redirect(303, `/dashboard/conversations/${conversationId}`);
                }
            }else {
                const conversationExists = await conversationsRef.findOne({ users:{ $all:[ user.username,...users ] } });
                if(conversationExists){
                    throw redirect(303, `/dashboard/conversation/${conversationExists.id}`);
                }else {
                    const conversationId = randomUUID();
    
                    await conversationsRef.insertOne({ id:conversationId, users:[...users, user.username], type:"group", groupName:"Group name", admin:user.username });
                    throw redirect(303, `/dashboard/conversations/${conversationId}`);
                }
            }
        }
    }
};