import { usersRef } from "$lib/server/db"

export async function POST({ locals, request }) {
    const { user } = locals;

    if(user){
        const formData = await request.json();
        const { username } = formData;

        if(user.subscriptions.filter(subscription => subscription.username == username).length >= 1){
            await usersRef.updateOne({ username:user.username }, { $pull: { subscriptions: { username }} });
            await usersRef.updateOne({ username }, { $inc: { noFollowers: -1} });
        }else{
            await usersRef.updateOne({ username:user.username }, { $push: { subscriptions: { username }} });
            await usersRef.updateOne({ username }, { $inc: { noFollowers: 1} });
        }
        
        let newUser = await usersRef.findOne({ username:user.username });

        return new Response(JSON.stringify({ error:false, message:"OK", subscriptions:newUser.subscriptions }));
    }

    return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
};
