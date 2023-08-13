import { redirect } from "@sveltejs/kit";
import { usersRef, postsRef } from "$lib/server/db"

export const actions = {
    save: async ({ request, locals }) => {
        try {
            const formData = Object.fromEntries(await request.formData());
            const { email, bio, username, profilePicture, banner } = formData;
            const { user } = locals;

            if(!email || !bio) return { err:true, msg:"Fields can not be empty!", email, bio, username };
    
            await usersRef.findOneAndUpdate({ username:user.username }, { $set:{ email, bio:bio.replaceAll("\n", "<br />"), profilePicture, banner } });
            return { err:false, msg:"Saved modifications" };
        } catch (err) {return { err:true, msg:err };}
    },
    deleteAccount: async ({ locals }) => {
        const { user } = locals;

        await usersRef.deleteOne({ username:user.username });
        await postsRef.deleteMany({ username:user.username });
        
        throw redirect(303, "/sign-out");
    }
};