<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components"
    import { pageMetaData } from "$lib/stores"
    import { enhance } from '$app/forms'

    export let data;
    export let form;

    // const { usersAside } = data;
    // let isDown = false;
    let isMorePostsToLoad = true;
    let feed = data.feed;
    let lastNumberOfPosts = feed.length;
    let bookmarks = [];
    let offset = 0;
    let tabIndex = 0;
    // let startX;
    // let scrollLeft;
    let user;

    $: user = data.user;
    $: if(user) bookmarks = user.bookmarks;
    $: offset = feed.length;

    onMount(() => {
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            // When the user is [modifier]px from the bottom, fire the event.
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadSubsPosts();
        });
    });


    async function loadSubsPosts() {
        if(isMorePostsToLoad){
            const res = await fetch(`/api/getSubsPosts?offset=${offset}`, { method:"GET" });
            const apiRes = await res.json();
            if(!apiRes.error || !apiRes.message){
                feed = [ ...feed, ...apiRes.feed ];
                if(feed.length == lastNumberOfPosts){
                    isMorePostsToLoad = false
                }
                lastNumberOfPosts = feed.length
            }
        }
    }

    $pageMetaData.title = "Home";
    $pageMetaData.description = "Home page of this amazing social network.";
</script>

{#if !user}
    <section class="p-6 justify-between w-full grid grid-cols-1 gap-6 lg:grid-cols-2 min-h-screen items-center">
        <svg viewBox="0 0 24 24" class="max-h-96 mx-auto fill-neutral-100"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
        <div class="w-full max-lg:flex max-lg:items-center max-lg:flex-col">
            <h1>Happening now</h1>
            <h5 class="mt-16 mb-10">Join today.</h5>
            <div class="w-full max-w-md">
                <div class="border-b border-neutral-700 mb-2">
                    <div class="-mb-px text-sm font-medium text-center text-neutral-500 dark:text-neutral-400 flex flex-row justify-between relative">
                        <button class="inline-flex items-center justify-center p-4 group w-full transition-all border-b-2 {tabIndex === 0 ? "text-primary-500 border-primary-500" : "border-transparent hover:border-neutral-700 text-neutral-300"}" on:click={() => {tabIndex = 0}}>
                            Log-in
                        </button>
                        <button class="inline-flex items-center justify-center p-4 group w-full transition-all border-b-2 {tabIndex === 1 ? "text-primary-500 border-primary-500" : "border-transparent hover:border-neutral-700 text-neutral-300"}" on:click={() => {tabIndex = 1}}>
                            Sign-in
                        </button>
                    </div>
                </div>
                {#if tabIndex === 0}
                    <form class="w-full" use:enhance method="POST" action="?/login">
                        <label for="username" class="block mb-2">Username</label>
                        <input type="text" placeholder="Username" name="username" value="{form && form.formData.username}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
        
                        <label for="password" class="block mb-2">Password</label>
                        <input type="password" placeholder="Password" name="password" value="{form && form.formData.password}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
                
                        <button class="button-primary group w-full mb-4">
                            Log-in
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 group-hover:rotate-[-360deg] transition-all duration-300 delay-100"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </button>
                
                        {#if form?.success == false}
                            <div class="flex items-center p-4 text-sm border rounded-lg bg-neutral-800 text-red-400 border-red-800" role="alert">
                                <svg class="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>
                                {form.message}
                            </div>
                        {/if}
                    </form>
                {:else}
                    <form class="w-full" use:enhance method="POST" action="?/signin">
                        <label for="username" class="block mb-2">E-mail</label>
                        <input type="text" placeholder="E-mail" name="email" value="{form && form.formData.email}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">

                        <label for="username" class="block mb-2">Username</label>
                        <input type="text" placeholder="Username" name="username" value="{form && form.formData.username}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
        
                        <label for="password" class="block mb-2">Password</label>
                        <input type="password" placeholder="Password" name="password" value="{form && form.formData.password}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
                
                        <button class="button-primary group w-full mb-4">
                            Sign-in
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 group-hover:rotate-[-360deg] transition-all duration-300 delay-100"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </button>
                
                        {#if form?.success == false}
                            <div class="flex items-center p-4 text-sm border rounded-lg bg-neutral-800 text-red-400 border-red-800" role="alert">
                                <svg class="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>
                                {form.message}
                            </div>
                        {/if}
                    </form>
                {/if}
            </div>
        </div>
    </section>
{:else}

    <main class="flex md:flex-row flex-col-reverse justify-between md:items-start items-center h-full max-w-lg w-full">
        <section class="w-full flex flex-col h-full border-x border-border">
            {#each feed as post, index}
                <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
            {/each}
        </section>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <!-- <aside class="md:sticky md:top-0 md:w-96 max-w-md md:h-screen md:flex-col gap-6 mx-auto p-0 md:x-3 pb-4 md:overflow-y-auto md:overflow-x-hidden flex flex-row w-full overflow-x-auto will-change-transform cursor-pointer no-scrollbar transition-all duration-500 pt-6"
        on:mousedown={(e) => {let slider = e.target.closest("aside");isDown = true;slider.classList.add('cursor-grab');startX = e.pageX - slider.offsetLeft;scrollLeft = slider.scrollLeft;}} 
        on:mouseleave={(e) => {isDown = false;e.target.closest("aside").classList.remove('cursor-grab');}} 
        on:mouseup={(e) => {isDown = false;e.target.closest("aside").classList.remove('cursor-grab');}} 
        on:mousemove={(e) => {let slider = e.target.closest("aside");if(!isDown) return;e.preventDefault();const x = e.pageX - slider.offsetLeft;const walk = (x - startX) * 2; slider.scrollLeft = scrollLeft - walk;}}>
            {#each usersAside as user}
                <a href="/u/{user.username}" class="userCard md:h-auto h-40 md:w-auto w-10/12 shrink-0" type="user">
                    <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="aspect-ratio: 3/1;background-image: url('{user.banner}');" id="profileBanner">
                        <img id="profilePicture" alt="Profile picture" class="rounded-full h-16 w-16 absolute bottom-0 left-5 translate-y-3/4" src="{user.profilePicture}">
                    </div>
                    <div class="h-[48px] mb-2 pl-[104px]">
                        <p class="pr-2 text-lg leading-8 font-sans font-semibold">{user.username}</p>
                    </div>
                </a>
            {/each}
        </aside> -->
    </main>
{/if}