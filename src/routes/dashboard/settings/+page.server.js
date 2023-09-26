import { redirect } from "@sveltejs/kit";
import { usersRef, postsRef } from "$lib/server/db";
import { Storage } from '@google-cloud/storage';
import { unlinkSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

export async function load({ locals }) {
    const { user } = locals;
    
    user.blockedUsers = await Promise.all(user.blockedUsers.map(async (username) => {
        let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:username }));
        if(!user?.hidden || locals.user.admin) return user;
    }));

    return user;
}

export const actions = {
    save: async ({ request, locals }) => {
        try {
            const formData = Object.fromEntries(await request.formData());
            const { email, bio, profilePicture, banner, displayName } = formData;
            const { user } = locals;
            const storage = new Storage();

            if(!email || !bio || !displayName) return { err:true, msg:"Fields can not be empty!" };
            let profilePicturePath = user.profilePicture;
            let bannerPath = user.banner;
            
            if(profilePicture?.size > 0){
                let ext = profilePicture.name.split(".").at(-1);
                let filePath = `static/files/${user.username}-profile-picture-temp.${ext}`;
                writeFileSync(filePath, Buffer.from(await profilePicture.arrayBuffer()));
                let options = { destination: `profile-pictures/${user.username}-profile-picture.${ext}` };
                await storage.bucket("hellkeeperbucket").upload(filePath, options);
                unlinkSync(filePath);
                profilePicturePath = `https://storage.googleapis.com/hellkeeperbucket/${options.destination}`
            }

            if(banner?.size > 0){
                let ext = banner.name.split(".").at(-1);
                let filePath = `static/files/${user.username}-banner-temp.${ext}`;
                writeFileSync(filePath, Buffer.from(await banner.arrayBuffer()));
                let options = { destination: `banners/${user.username}-banner.${ext}` };
                await storage.bucket("hellkeeperbucket").upload(filePath, options);
                unlinkSync(filePath);
                bannerPath = `https://storage.googleapis.com/hellkeeperbucket/${options.destination}`;
            }

            await usersRef.updateOne({ username:user.username }, { $set:{ email, bio:bio.replaceAll("\n", "<br />"), displayName, profilePicture:profilePicturePath, banner:bannerPath } });
            return { err:false, msg:"Saved modifications" };
        } catch (err) {console.log(err);return { err:true, msg:err };}
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