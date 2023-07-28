import { usersRef } from "$lib/server/db"

export async function POST({ locals, request }) {
    const { user } = locals;

    if(user){
        const formData = await request.json();
        const { id } = formData;

        if(user.bookmarks.filter(bookmark => bookmark.id == id).length >= 1){
            await usersRef.updateOne({ username:user.username }, { $pull: { bookmarks: { id }} });
        }else{
            await usersRef.updateOne({ username:user.username }, { $push: { bookmarks: { id }} });
        }

        let newUser = await usersRef.findOne({ username:user.username })

        return new Response(JSON.stringify({ error:false, message:"OK", bookmarks:newUser.bookmarks }));
    }

    return new Response(JSON.stringify({ error:true, message:"Not logged-in!" }));
};
