<script>
    import { enhance } from "$app/forms";
    import { pageMetaData } from "$lib/stores";

    export let data;

    const { user, conversationsWithMe } = data;
    let followedUsers = data.followedUsers;
    let newConversationModal = false;
    let newConversationUsers = [];
    let newConversationInput;
    let newConversationRadio;

    async function newConversationInputHandle() {
        if(newConversationInput.value.length === 0) return newConversationUsers = [];
        let query = new RegExp( newConversationInput.value, 'i' );
        newConversationUsers = followedUsers.filter(el => el.username.match(query) && el);
    }

    $pageMetaData.title = "Messages";
    $pageMetaData.description = "Messages";
    $pageMetaData.currentPageName = "Messages";
</script>

<section class="w-full p-2">
    <button class="button-primary w-full" on:click={() => { newConversationModal = true;}}>New conversation</button>
    <div class="mt-6 flex flex-col gap-4">
        {#each conversationsWithMe as conversation}
            {#if !user.blockedUsers.includes(conversation.user.username)}
                <a href="/dashboard/conversations/{conversation.id}" class="flex flex-row items-center gap-2 w-full transition-all hover:bg-neutral-800 rounded p-2 relative {(!conversation.lastMessage.seen && Object.keys(conversation.lastMessage).length > 0) && "bg-neutral-800"}">
                    {#if !conversation.lastMessage.seen && conversation.lastMessage.receiver === user.username}
                        <div class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 w-4 h-4 rounded-full"></div>
                    {/if}
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <img src="{conversation.user.profilePicture}" alt="Profile picture" class="w-12 h-12 rounded-full">
                    <div class="flex flex-col gap-1">
                        <h6>{conversation.user.username}</h6>
                        {#if Object.keys(conversation.lastMessage).length > 0}
                            <p class="text-neutral-600 line-clamp-1 text-ellipsis w-full"><b>{conversation.lastMessage.sender === user.username ? "You" : conversation.lastMessage.sender}</b> : {conversation.lastMessage.message}</p>
                        {/if}
                    </div>
                </a>
            {/if}
        {/each}
    </div>
</section>


<div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {newConversationModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full">
        <form method="POST" use:enhance action="?/newConversation" class="p-6 flex flex-col gap-2">
            <h4>New conversation</h4>
            <input type="text" placeholder="Username" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all" on:keyup={newConversationInputHandle} bind:this={newConversationInput}>
            {#if newConversationUsers.length > 0}
                <div class="flex flex-row flex-wrap gap-2">
                    {#each newConversationUsers as user}
                        <div>
                            <input type="radio" bind:group={newConversationRadio} name="newConversationRadioInputs" value={user.username} id="newConversationWith{user.username}" class="hidden peer" />
                            <label for="newConversationWith{user.username}" class="p-2 flex flex-row items-center gap-4 bg-neutral-900 hover:bg-neutral-800 border border-border text-neutral-100 w-fit transition-all rounded-xl peer-checked:border-primary-600 peer-checked:rounded-3xl cursor-pointer hover:rounded-3xl">
                                <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                                <div class="flex flex-col"><h6>{ user.username }</h6></div>
                            </label>
                        </div>
                    {/each}
                </div>
            {/if}
            <div class="flex flex-row justify-center gap-2">
                <button type="button" class="button-secondary" on:click={() => {newConversationModal = false;}}>No, cancel</button>
                <button type="submit" class="button-primary" disabled="{!newConversationRadio}">Start chatting</button>
            </div>
        </form>
    </div>
</div>