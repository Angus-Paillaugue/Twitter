<script>
    import { enhance } from "$app/forms";
    import { pageMetaData } from "$lib/stores";
    import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

    export let data;

    const { user, conversationsWithMe } = data;
    let followedUsers = data.followedUsers;
    let newConversationModal = false;
    let newConversationUsers = followedUsers.map(el => {return {...el, selected:false, display:false}});
    let newConversationInput;

    const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

    async function newConversationInputHandle() {
        if(newConversationInput.value.length === 0) return newConversationUsers = newConversationUsers.map(el => {return {...el, display:false}});
        let query = new RegExp( newConversationInput.value, 'i' );
        newConversationUsers = newConversationUsers.filter(el => el.selected || el.username.match(query)).map(el => {return {...el,display:true}});
    }

    $pageMetaData.title = "Messages";
    $pageMetaData.description = "Messages";
    $pageMetaData.currentPageName = "Messages";
</script>

<section class="w-full p-2">
    <button class="button-primary w-full" on:click={() => { newConversationModal = true;}}>New conversation</button>
    <div class="mt-6 flex flex-col gap-4">
        {#each conversationsWithMe as conversation}
            {#if conversation?.type === "dm"}
                {#if !user.blockedUsers.includes(conversation.users.filter(el => el.username !== user.username)[0].username)}
                    <a href="/dashboard/conversations/{conversation.id}" class="flex flex-row items-center gap-2 w-full transition-all hover:bg-neutral-800 rounded p-2 relative {(!conversation.lastMessage.seen && Object.keys(conversation.lastMessage).length > 0) && "bg-neutral-800"}">
                        {#if !conversation.lastMessage.seen && conversation.lastMessage.receiver === user.username}
                            <div class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 w-4 h-4 rounded-full"></div>
                        {/if}
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img src="{conversation.users.filter(el => el.username !== user.username)[0].profilePicture}" alt="Profile picture" class="h-12 aspect-square rounded-full">
                        <div class="flex flex-col gap-1">
                            <h6>
                                {conversation.users.filter(el => el.username !== user.username)[0].username}
                                {#if conversation.users.filter(el => el.username !== user.username)[0].certified}
                                    <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>
                                {/if}
                            </h6>
                            {#if Object.keys(conversation.lastMessage).length > 0}
                                <p class="text-neutral-600 line-clamp-1 text-ellipsis w-auto"><b>{conversation.lastMessage.sender === user.username ? "You" : conversation.lastMessage.sender}</b> : {conversation.lastMessage.message}</p>
                            {/if}
                        </div>
                    </a>
                {/if}
            {:else}
                <a href="/dashboard/conversations/{conversation.id}" class="flex flex-row items-center gap-2 w-full transition-all hover:bg-neutral-800 rounded p-2 relative">
                    <div class="flex flex-col gap-1">
                        <h6>{conversation.groupName}</h6>
                    </div>
                </a>
            {/if}
        {/each}
    </div>
</section>


<div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {newConversationModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full">
        <form method="POST" use:enhance={(e) => {e.formData.set("users",JSON.stringify(newConversationUsers.filter(el => el.selected).map(el => el.username)));return ({ update }) => update({ reset: false });}} action="?/newConversation" class="p-6 flex flex-col gap-2">
            <h4>New conversation</h4>
            <p class="text-xs mb-2">To chat with someone, you need to follow him/her.</p>
            <input type="text" placeholder="Username" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all" on:keyup={newConversationInputHandle} bind:this={newConversationInput}>
            <div class="flex flex-row flex-wrap gap-2">
                {#each newConversationUsers.filter(el => el.selected) as user (user.username)}
                    <label class="p-2 flex flex-row items-center gap-4 bg-neutral-900 hover:bg-neutral-800 border text-neutral-100 w-fit transition-all border-primary-600 rounded-3xl cursor-pointer hover:rounded-3xl" in:receive={{ key: user.username }} out:send={{ key: user.username }} animate:flip>
                        <input type="checkbox" value={user.username} class="hidden peer" bind:checked={user.selected}/>
                        <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                        <div class="flex flex-col"><h6>{ user.username }</h6></div>
                    </label>
                {/each}
            </div>
            <div class="flex flex-row flex-wrap gap-2">
                {#each newConversationUsers.filter(el => el.display && !el.selected) as user (user.username)}
                    <label class="p-2 flex flex-row items-center gap-4 bg-neutral-900 hover:bg-neutral-800 border border-border text-neutral-100 w-fit transition-all rounded-xl cursor-pointer hover:rounded-3xl" in:receive={{ key: user.username }} out:send={{ key: user.username }} animate:flip>
                        <input type="checkbox" value={user.username} class="hidden peer" bind:checked={user.selected}/>
                        <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                        <div class="flex flex-col"><h6>{ user.username }</h6></div>
                    </label>
                {/each}
            </div>
            <div class="flex flex-row justify-center gap-2">
                <button type="button" class="button-secondary" on:click={() => {newConversationModal = false;}}>No, cancel</button>
                <button type="submit" class="button-primary" disabled="{newConversationUsers.filter(el => el.selected).length === 0}">Start chatting</button>
            </div>
        </form>
    </div>
</div>