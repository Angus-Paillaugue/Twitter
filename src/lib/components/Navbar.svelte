<script>
    import { Tooltip } from 'flowbite-svelte';
    import { searchBar, pageMetaData } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

    export let user;

    let display;
    let searchInput;
    let query;
    let searchHint = [];
    let newConversationModal = false;
    let newConversationUsers = $page?.data?.followedUsers?.map(el => {return {...el, selected:false, display:false}}) ?? [];
    let newConversationInput;
    $: display = user && $page.route.id !== "/dashboard/conversations/[id]";
    $: if($searchBar && searchInput) searchInput.focus();
    $: getSearchHint(), query;

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

    async function newConversation() {
        const res = await fetch("/api/newConversation", { method:"POST", body:JSON.stringify({ users:newConversationUsers.filter(el => el.selected).map(el => el.username) }) });
        const data = await res.json();
        if(data?.id){
            goto('/').then(() => goto(`/dashboard/conversations/${data.id}`));
        }
    }
    async function newConversationInputHandle() {
        if(newConversationInput.value.length === 0) return newConversationUsers = newConversationUsers.map(el => {return {...el, display:false}});
        let query = new RegExp( newConversationInput.value, 'i' );
        newConversationUsers = newConversationUsers.filter(el => el.selected || el.username.match(query)).map(el => {return {...el,display:true}});
    }

    async function getSearchHint() {
        if(query?.length > 0){
            const res = await fetch("/api/searchAutocomplete", { method:"POST", body:JSON.stringify({ q:query }) });
            const apiRes = await res.json();
            if(!apiRes.error) searchHint = apiRes.results;
        }else searchHint = [];
    }

    function highlightSearchedText(text) {
        const regexExp = new RegExp(query, "gi")
        return text.replaceAll(regexExp, function(match) {
            return `<b class="font-extrabold">${match}</b>`;
        });
    }

    $: if(browser){
        for(const el of document.querySelectorAll("[data-navbar-section]")){
            el.classList.remove("bg-neutral-800");
        }
        let section;
        if($searchBar){
            section = document.querySelector("[data-navbar-section*='Search']");
        }else {
            section = document.querySelector("[data-navbar-section*='"+$pageMetaData.currentPageName ?? "Home"+"']");
        }
        if(section) section.classList.add("bg-neutral-800"); else document.querySelector("[data-navbar-section*='Home']")?.classList.add("bg-neutral-800")
    }
</script>

{#if user}
    <div class="{$searchBar ? "sm:h-[calc(100vh-3.5rem)] sm:top-14" : "sm:h-screen sm:top-0"} transition-all max-sm:w-full h-14 sm:border-r sm:border-border max-sm:bg-neutral-900/80 backdrop-blur md:mr-4 max-sm:z-40 fixed sm:sticky max-sm:left-0 bottom-0 flex flex-row max-sm:justify-between sm:flex-col gap-4 text-neutral-100 text-lg p-2 sm:p-4 {!display && "lg:w-[500px]"}">
        {#if display}
            <a href="/" name="Home" class="hover:bg-neutral-800 p-2 ml-2 rounded-full w-fit max-sm:hidden">
                <img src="/logo.svg" alt="" class="fill-neutral-100 w-6 sm:w-8">
            </a>
            <a href="/" class="flex flex-row gap-2 items-center px-4 py-2 transition-all rounded-full border border-transparent hover:border-border" draggable="false" data-navbar-section="Home">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 sm:w-8 aspect-square transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                <span class="max-md:hidden">Home</span>
            </a>
            <button on:click={() => {$searchBar = !$searchBar}} class="flex flex-row gap-2 items-center px-4 py-2 transition-all rounded-full border border-transparent hover:border-border" data-navbar-section="Search">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 sm:w-8 aspect-square transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <span class="max-md:hidden">Search</span>
            </button>
            <a href="/dashboard/conversations" draggable="false" class="flex flex-row gap-2 items-center px-4 py-2 transition-all rounded-full border border-transparent hover:border-border" data-navbar-section="Messages">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 sm:w-8 aspect-square transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                <span class="max-md:hidden">Messages</span>
            </a>
            <a href="/dashboard/bookmarks" draggable="false" class="hidden sm:flex flex-row gap-2 items-center px-4 py-2 transition-all rounded-full border border-transparent hover:border-border" data-navbar-section="Bookmarks">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 sm:w-8 aspect-square transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                <span class="max-md:hidden">Bookmarks</span>
            </a>
            <a href="/dashboard/settings" draggable="false" class="hidden sm:flex flex-row gap-2 items-center px-4 py-2 transition-all rounded-full border border-transparent hover:border-border" data-navbar-section="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 sm:w-8 aspect-square transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                <span class="max-md:hidden">Settings</span>
            </a>
            <a href="/dashboard" draggable="false" class="flex flex-row gap-2 items-center px-4 py-2 transition-all rounded-full border border-transparent hover:border-border sm:mt-auto" data-navbar-section="Dashboard">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 sm:w-8 aspect-square transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span class="max-md:hidden">Dashboard</span>
            </a>
        {:else}
            <button class="button-primary w-full" on:click={() => { newConversationModal = true;}}>New conversation</button>
            {#each ($page?.data?.conversationsWithMe ?? []) as conversation}
                {#if conversation?.type === "dm"}
                    {#if !user.blockedUsers.includes(conversation.users.filter(el => el.username !== user.username)[0].username)}
                        <a href="/dashboard/conversations/{conversation.id}" class="flex flex-row items-center gap-2 w-full transition-all hover:bg-neutral-800 rounded p-2 relative border-2 {(!conversation.lastMessage.seen && Object.keys(conversation.lastMessage).length > 0) && "bg-neutral-800"} {$page.params.id === conversation.id ? "border-border" : "border-transparent"}">
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
                    <a href="/dashboard/conversations/{conversation.id}" class="flex flex-row items-center gap-2 w-full transition-all hover:bg-neutral-800 rounded p-2 relative border-2 {$page.params.id === conversation.id ? "border-border" : "border-transparent"}">
                        <div class="flex flex-row items-center justify-between gap-2 w-full">
                            <h6>{conversation.groupName}</h6>
                            <div class="flex -space-x-4">
                                {#each conversation.users as user, index}
                                    {#if index < 4}
                                        <img class="w-10 h-10 border-2 rounded-full border-neutral-600" src="{user.profilePicture}" alt="">
                                    {/if}
                                {/each}
                                {#if conversation.users.length > 4}
                                    <div class="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-neutral-600 border-2 rounded-full border-neutral-800">+{conversation.users.length - 4}</div>
                                {/if}
                            </div>
                        </div>
                    </a>
                {/if}
            {/each}
        {/if}
    </div>



    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex flex-col gap-2 items-start transition-opacity {$searchBar ? "opacity-100 z-40" : "opacity-0 -z-10 "}" on:click={() => {$searchBar = false;}}>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <form action="/search" method="GET" class="w-full h-14 flex flex-row items-center transition-all {$searchBar ? "translate-y-0" : "-translate-y-full"}" on:click={(e) => {e.stopPropagation();}} on:submit= {() => {$searchBar = false; goto(`/search?q=${query}`)}}>
            <label for="q" class="mb-2 text-sm font-medium sr-only text-neutral-100">Search</label>
            <div class="relative w-full h-full">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input type="search" id="q" bind:value={query} name="q" class="block w-full p-4 pl-10 h-full text-sm border rounded-b-lg bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus:ring-primary-500 focus:border-primary-500" autocomplete="off" placeholder="Search posts or users" required bind:this={searchInput}>
                <button type="submit" class="absolute top-1/2 right-0 -translate-y-1/2 button-primary">Search</button>
            </div>
        </form>
        <div class="flex flex-col w-full max-w-md max-h-full overflow-y-auto transition-all mx-auto border-x border-border {searchHint.length > 0 ? "opacity-100" : "opacity-0"}" on:click={(e) => {e.stopPropagation();}} >
            {#each searchHint as hint, index}
                {#if index < 5}
                    {#if hint.type === "user"}
                        <a href="/u/{hint.username}" class="w-full overflow-hidden flex flex-col justify-start {index === 0 ? "border-y" : "border-b"} border-border bg-neutral-900">
                            <div class="w-full relative bg-no-repeat bg-center bg-cover h-16 lg:h-24" style="background-image: url('{hint.banner}');">
                                <div class="rounded-full lg:h-20 h-14 aspect-square absolute bottom-0 left-5 translate-y-3/4 ring-4 ring-neutral-800 bg-center bg-cover" style="background-image: url({hint.profilePicture});"></div>
                            </div>
                            <div class="h-20 pl-24 lg:pl-28 flex items-start flex-col">
                                <h5>{@html highlightSearchedText(hint.displayName)}</h5>
                                <p class="text-xs">@{@html highlightSearchedText(hint.username)}</p>
                            </div>
                        </a>
                    {:else}
                        <a href="/post/{hint.id}" class="w-full overflow-hidden flex flex-row border-border {index === 0 ? "border-y" : "border-b"} bg-neutral-900">
                            <div class="rounded-full lg:h-20 aspect-square h-14 ring-4 m-2 ring-neutral-800 bg-center bg-cover" style="background-image: url({hint.user.profilePicture});"></div>
                            <Tooltip>{hint.username}</Tooltip>
                            <p class="p-2 line-clamp-3 text-ellipsis h-20 overflow-hidden">
                                {@html highlightSearchedText(hint.text)}
                            </p>
                        </a>
                    {/if}
                {/if}
            {/each}
        </div>
    </div>


    <div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {newConversationModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
        <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full">
            <form method="POST" on:submit|preventDefault={newConversation} class="p-6 flex flex-col gap-2">
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
{/if}