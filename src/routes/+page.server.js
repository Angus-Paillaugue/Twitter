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
            let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:post.username }))
            post.replies = await Promise.all(post.replies.map(async (replie) => {
                let user = (({ password, email, bookmarks, subscriptions, blockedUsers, _id, ...o }) => o)(await usersRef.findOne({ username:replie.username }))
                if(!user?.hidden || locals.user.admin) return{ ...replie, user }
            }));
            post.replies = post.replies.sort(function(a,b){return new Date(b.date) - new Date(a.date);});
            if(!user?.hidden || locals.user.admin) return{ ...post, user }
        })));

        return { feed:feed.filter(n => n) };
    }else {
        return { feed:[] };
    }
};

export const actions = {
    login: async ({ cookies, request }) => {
        try{
            const formData = Object.fromEntries(await request.formData());
            const { username, password } = formData;
            
            const userExists = await usersRef.findOne({ username:username });
            if(!userExists) return { logIn:{success:false, formData, message:"No account with this username!"} };
            const compare = await bcrypt.compare(password, userExists.password);
            if(compare){
                cookies.set("token", generateAccessToken(username), { path:"/", maxAge: 60 * 60 * 24 * 10 });
                throw redirect(303, "/dashboard");
            }
            return { logIn:{success:false, formData, message:"Incorrect password!"} };
        }catch(err){
            console.log(err);
        }
    },
    signin: async ({ cookies, request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { email, username, password } = formData;

        const userExists = await usersRef.findOne({ email:email });
        if(userExists) return { signIn:{success:false, formData, message:"This email is already in use in another account!"} };

        const usernameIsTaken = await usersRef.findOne({ username:username });
        if(usernameIsTaken) return { signIn:{success:false, formData, message:"This username is already taken!"} };

        const isASCII = (str) => {return /^[\x00-\x7F]*$/.test(str);}
        if(!isASCII(username)) return { signIn:{success:false, formData, message:"Usernames can only be composed of letters, numbers and special characters!"} };

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await usersRef.insertOne({ username: username, displayName:username, email:email, password:hash, profilePicture:"/defaultProfilePicture.png", banner:"/defaultBanner.jpg", bookmarks:[], subscriptions:[], joined:new Date(), bio:"No bio for now", blockedUsers: [], noFollowers:0, verified:false });

        cookies.set("token", generateAccessToken(username), { path:"/", maxAge: 60 * 60 * 24 * 10 });
        throw redirect(301, "/dashboard/settings");
    }
};

function generateAccessToken(username) {return jwt.sign(username, AUTH_TOKEN_SECRET);}