import { postsRef, usersRef } from "$lib/server/db"
import { redirect } from "@sveltejs/kit";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { AUTH_TOKEN_SECRET } from "$env/static/private"

export async function load({ locals }) {
    let feed;
    if(locals.user){
        const { user } = locals;
        
        if(user.subscriptions.length === 0){
            feed = await postsRef.find({  }).sort({date:-1}).limit(20).toArray();
        }else{
            feed = await postsRef.find({ username:{ $in:[...user.subscriptions.map(sub => sub.subscriptions)] } }).sort({date:-1}).limit(20).toArray();
        }

        if(feed.length < 20){
            let temp = await postsRef.find({  }).sort({date:-1}).limit(20-feed.length).toArray();
            feed.push(...temp);
        }

        feed = structuredClone(await Promise.all(feed.map(async (post) => {
            return{ ...post, user: await usersRef.findOne({ username:post.username })}
        })));

        return { feed };
    }else {
        return { feed:[] }
    }
};

export const actions = {
    login: async ({ cookies, request }) => {
        try{
            const formData = Object.fromEntries(await request.formData());
            const { username, password } = formData;
            
            const userExists = await usersRef.findOne({ username:username });
            if(!userExists) return { success:false, formData:formData, message:"No account with this username!" };
            const compare = await bcrypt.compare(password, userExists.password);
            if(compare){
                cookies.set("token", generateAccessToken(username), { path:"/", httpOnly: true, sameSite:"strict", maxAge: 60 * 60 * 24 });
                throw redirect(303, "/dashboard");
            }
            return { success:false, formData:formData, message:"Incorrect password!" };
        }catch(err){
            console.log(err);
        }
    },
    signin: async ({ cookies, request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { email, username, password } = formData;

        const userExists = await usersRef.findOne({ email:email });
        if(userExists) return { success:false, formData:formData, message:"This email is already in use in another account!" };

        const usernameIsTaken = await usersRef.findOne({ username:username });
        if(usernameIsTaken) return { success:false, formData:formData, message:"This username is already taken!" };

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await usersRef.insertOne({ username: username, email:email, password:hash, profilePicture:"/defaultProfilePicture.png", banner:"/defaultBanner.jpg", bookmarks:[], subscriptions:[], joined:new Date(), bio:"No bio for now" });

        cookies.set("token", generateAccessToken(username), { path:"/", httpOnly: true, sameSite:"strict", maxAge: 60 * 60 * 24 });
        throw redirect(301, "/dashboard");
    }
};

function generateAccessToken(username) {return jwt.sign(username, AUTH_TOKEN_SECRET);}