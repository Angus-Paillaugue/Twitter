import { usersRef, conversationsRef, messagesRef } from "$lib/server/db"
import { randomUUID } from "crypto"
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
    const { user } = locals;

    let conversationsWithMe = await conversationsRef.find({ users:user.username }).project({ _id:0 }).toArray();
    conversationsWithMe = conversationsWithMe.map(el => {return { user:el.users.indexOf(user.username) === 0 ? el.users[1] : el.users[0], id:el.id }});

    conversationsWithMe = structuredClone(await Promise.all(conversationsWithMe.map(async (conversation) => {
        let lastMessage = structuredClone(await messagesRef.findOne({ conversation:conversation.id }, null, { sort:{ date:-1 } }))
        return {id:conversation.id, lastMessage, user:(({ password, email, bookmarks, subscriptions, ...o }) => o)(await usersRef.findOne({ username:conversation.user }))};
    })));

    return { conversationsWithMe };
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

                await conversationsRef.insertOne({ id:conversationId, users:[newConversationRadioInputs, user.username] }, {upsert: true});
                throw redirect(303, `/dashboard/conversations/${conversationId}`);
            }
        }
    }
};