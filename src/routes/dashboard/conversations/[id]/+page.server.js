import { messagesRef, usersRef, conversationsRef } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { id } = params;
    const { user } = locals;

    const conversation = structuredClone(await conversationsRef.findOne({ id }));
    if(!conversation)throw redirect(303, "/dashboard/conversations");
    if(!conversation.users.includes(locals.user.username)) throw redirect(303, "/dashboard");
    let messages = await messagesRef.find({ conversation:id }).project({ _id:0 }).toArray();
    
    const chattingWith = await usersRef.find({ username:{ $in:conversation.users }}).project({ _id:0, password:0, email:Object, subscriptions:0, bookmarks:0 }).toArray();
    if(conversation.type === "dm"){
        await messagesRef.updateMany({ conversation:id, receiver:locals.user.username }, { $set:{ seen:true } });
    }

    messages = messages.map(message => {return {...message, sender:chattingWith.filter(user => user.username === message.sender)[0]}});

    let followedUsers = await usersRef.find({ username: { $in:user.subscriptions.map(el => el.username) } }).project({ _id:0, password:0, email:0, bookmarks:0, blockedUsers:0 }).toArray();
    followedUsers = followedUsers.filter(el => el.username !== user.username);

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
            return { ...conversation, users:conversation.users }
        }
    })));
    conversationsWithMe = conversationsWithMe.filter(n => n);

    return { messages, conversation, chattingWith, followedUsers, conversationsWithMe };
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
            throw redirect(303, "/dashboard/conversations");
        }
    },
    deleteGroup: async({ params, locals }) => {
        const { id } = params;
        const { user } = locals;
        const conversation = await conversationsRef.findOne({ id });
        if(conversation.admin === user.username){
            await conversationsRef.deleteOne({ id });
            await messagesRef.deleteMany({ conversation:id });
            throw redirect(303, "/dashboard/conversations");
        }
    },
    leaveGroup: async({ params, locals }) => {
        const { id } = params;
        const { user } = locals;

        const conversation = await conversationsRef.findOne({ id });
        if(conversation.users.length === 2){
            await conversationsRef.deleteOne({ id });
        }else {
            await conversationsRef.updateOne({ id }, { $pull: { users: user.username } });
        }

        await messagesRef.deleteMany({ sender:user.username, conversation:id });
        throw redirect(303, "/dashboard/conversations");
    },
    renameGroup: async({ params, locals, request }) => {
        const { id } = params;
        const { user } = locals;
        const formData = Object.fromEntries(await request.formData());
        const { name } = formData;
        
        const conversation = await conversationsRef.findOne({ id });
        if(conversation.type === "group" && conversation.admin === user.username){
            await conversationsRef.updateOne({ id }, { $set:{ groupName:name } });
            return { success:true, msg:`You changed the group name to '${name}'`, groupName:name };
        }else return { success:false, msg:"You are not the owner of this group.", groupName:name };
    }
};