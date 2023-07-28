import { auth } from "$lib/server/auth"
import { redirect } from "@sveltejs/kit";

export const handle = async ({ event, resolve }) => {
    const { url, cookies, locals } = event;

    const token = cookies.get('token') || false;
    if(token) {
        const user = await auth(token);
        if(!user.error) {
            locals.user = user;
        } else {
            cookies.delete("token"); 
            throw redirect(303, "/log-in");
        }
    } else {
        locals.user = false;
    }

    if(url.pathname.startsWith("/dashboard") && !locals.user){
        cookies.delete("token"); 
        throw redirect(303, `/log-in?redirect=${url.pathname}`);
    }

    if((url.pathname.startsWith("/log-in") || url.pathname.startsWith("/sign-in")) && locals.user){
        throw redirect(303, "/dashboard");
    }

    return resolve(event);
}