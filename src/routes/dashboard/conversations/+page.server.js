import { usersRef, conversationsRef, messagesRef } from "$lib/server/db";
import { randomUUID } from "crypto";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
    const { user } = locals;

    let conversationsWithMe = await conversationsRef.find({ users:user.username }).sort({ lastMessage:-1 }).project({ _id:0 }).toArray();
    conversationsWithMe = conversationsWithMe.map(el => {return { user:el.users.indexOf(user.username) === 0 ? el.users[1] : el.users[0], id:el.id }});

    conversationsWithMe = structuredClone(await Promise.all(conversationsWithMe.map(async (conversation) => {
        let lastMessage = await messagesRef.find({ conversation:conversation.id }).sort({ date:-1 }).limit(1).project({ _id:0 }).toArray();
        if(lastMessage.length > 0){
            lastMessage = lastMessage[0];
            const parseMention = (text) => {return text.replace(new RegExp(/(?=(<user>))(\w|\W)*(?<=<\/user>)/, "gm"), function(match) {return match.slice(6, -7);});}
            lastMessage.message = parseMention(lastMessage.message);
        }
        if(Object.keys(lastMessage).length > 0) {
            return { id:conversation.id, lastMessage:lastMessage, user:(({ password, email, bookmarks, subscriptions, ...o }) => o)(await usersRef.findOne({ username:conversation.user })) };
        }else {
            await conversationsRef.deleteOne({ id:conversation.id });
            return false;
        }
    })));
    conversationsWithMe = conversationsWithMe.filter(n => n);

    const followedUsers = await usersRef.find({ username: { $in:user.subscriptions.map(el => el.username) } }).project({ _id:0, password:0, email:0, bookmarks:0, blockedUsers:0 }).toArray();

    return { conversationsWithMe, followedUsers };
};

export const actions = {
    newConversation:async({ request, locals }) => {
        const { user } = locals;
        if(user){
            const formData = Object.fromEntries(await request.formData());
            let { newConversationRadioInputs } = formData;

            const conversationExists = await conversationsRef.findOne({ users:{ $all:[ user.username,newConversationRadioInputs ] } });
            if(conversationExists){
                throw redirect(303, `/dashboard/conversation/${conversationExists.id}`);
            }else {
                const conversationId = randomUUID();

                await conversationsRef.insertOne({ id:conversationId, users:[newConversationRadioInputs, user.username], lastMessage:new Date() });
                throw redirect(303, `/dashboard/conversations/${conversationId}`);
            }
        }
    }
};