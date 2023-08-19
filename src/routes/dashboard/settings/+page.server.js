import { redirect } from "@sveltejs/kit";
import { usersRef, postsRef } from "$lib/server/db";

export async function load({ locals }) {
    const { user } = locals;
    
    user.blockedUsers = await Promise.all(user.blockedUsers.map(async (username) => {
        let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:username }));
        if(!user?.hidden || locals.user.admin) return user;
    }));

    return user
}

export const actions = {
    save: async ({ request, locals }) => {
        try {
            const formData = Object.fromEntries(await request.formData());
            const { email, bio, profilePicture, banner, displayName } = formData;
            const { user } = locals;

            if(!email || !bio || !displayName) return { err:true, msg:"Fields can not be empty!", email, bio, displayName };
    
            await usersRef.findOneAndUpdate({ username:user.username }, { $set:{ email, bio:bio.replaceAll("\n", "<br />"), profilePicture, banner, displayName } });
            return { err:false, msg:"Saved modifications" };
        } catch (err) {return { err:true, msg:err };}
    },
    unblockUser: async({ request, locals }) => {
        const { user } = locals;
        const formData = Object.fromEntries(await request.formData());
        const { username } = formData;

        await usersRef.updateOne({ username:user.username }, { $pull: { blockedUsers: username } });
        user.blockedUsers = user.blockedUsers.filter(el => el !== username);

        return { user }
    },
    deleteAccount: async ({ locals }) => {
        const { user } = locals;

        await usersRef.deleteOne({ username:user.username });
        await postsRef.deleteMany({ username:user.username });
        
        throw redirect(303, "/sign-out");
    }
};