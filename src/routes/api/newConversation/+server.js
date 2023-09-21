import { conversationsRef } from "$lib/server/db";
import { randomUUID } from "crypto";

export async function POST({ locals, request }) {
    const { user } = locals;
    if(user){
        const formData = await request.json();
        const { users } = formData;
        const newConversationId = randomUUID();

        if(users.length === 1){
            const conversationExists = await conversationsRef.findOne({ users:[ user.username,...users ] });
            if(conversationExists){
                return new Response(JSON.stringify({ id:conversationExists.id }));
            }else {

                await conversationsRef.insertOne({ id:newConversationId, users:[...users, user.username], lastMessage:new Date(), type:"dm" });
                return new Response(JSON.stringify({ id:newConversationId }));
            }
        }else {
            const conversationExists = await conversationsRef.findOne({ users:{ $all:[ user.username,...users ] }, users:{ $size:[ user.username,...users ].length } });
            if(conversationExists){
                return new Response(JSON.stringify({ id:conversationExists.id }));
            }else {

                await conversationsRef.insertOne({ id:newConversationId, users:[...users, user.username], type:"group", groupName:"Group name", admin:user.username });
                return new Response(JSON.stringify({ id:newConversationId }));
            }
        }
    }
};