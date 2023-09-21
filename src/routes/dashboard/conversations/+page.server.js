import { usersRef, conversationsRef, messagesRef } from "$lib/server/db";

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

    return { conversationsWithMe };
};