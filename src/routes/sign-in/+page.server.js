import { usersRef } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { AUTH_TOKEN_SECRET } from "$env/static/private"

export const actions = {
    default: async ({ cookies, request, url }) => {
        const formData = Object.fromEntries(await request.formData());
        const { email, username, password } = formData;

        const userExists = await usersRef.findOne({ email:email });
        if(userExists) return { success:false, formData:formData, message:"This email is already in use in another account!" };

        const usernameIsTaken = await usersRef.findOne({ username:username });
        if(usernameIsTaken) return { success:false, formData:formData, message:"This username is already taken!" };

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await usersRef.insertOne({ username: username, email:email, password:hash, profilePicture:"/defaultProfilePicture.png", banner:"/defaultBanner.jpg", bookmarks:[], subscriptions:[], joined:new Date(), bio:"No bio for now" });

        cookies.set("token", generateAccessToken(username), { path:"/", httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
        if(url.searchParams.get("redirect")){
            throw redirect(303, url.searchParams.get("redirect"));
        }else{
            throw redirect(301, "/dashboard");
        }
    }
};

function generateAccessToken(username) {return jwt.sign(username, AUTH_TOKEN_SECRET);}