import { usersRef } from "$lib/server/db";

export async function POST({ locals, request }) {
    if(locals.user){
        const intent = await request.json();
        
        if(intent.status === "succeeded" && intent.amount === 1999 && intent.currency === "eur"){
            await usersRef.updateOne({ username:locals.user.username }, { $set:{ certified:true } });
            locals.user.certified = true;
        }

        return new Response(JSON.stringify({ error:false, message:"You are now certified! (refresh page to see the change appear)" }));
    }else {
        return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
    }
};