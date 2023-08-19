<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components";
    import { pageMetaData, toasts } from "$lib/stores";
    import { enhance } from '$app/forms';

    export let data;
    export let form;

    let feed = data.feed;
    let isMorePostsToLoad = true;
    let morePostsLoading = false;
    let bookmarks = [];
    let sectionsList = [];
    // let childrenMap = [];
    let offset = 0;
    let tabIndex = 0;
    let user;
    let navLinkUnderline;
    let postsContainer;

    $: user = data.user;
    $: if(user) bookmarks = user.bookmarks;
    $: offset = feed.length;
    $: setActiveTab(), tabIndex;
    $: lastNumberOfPosts = feed.length;
    $: lastNumberOfPosts, setChildrenMap();

    onMount(() => {
        if(!user){
            sectionsList = document.querySelectorAll("form.no-user");
            setActiveTab();
            window.onresize = setActiveTab;
        }else {
            // setChildrenMap();
            window.addEventListener("scroll", () => {
                let documentHeight = document.body.scrollHeight;
                let currentScroll = window.scrollY + window.innerHeight;
                // When the user is [modifier]px from the bottom, fire the event.
                let modifier = 500; 
                if(currentScroll + modifier > documentHeight) loadMorePosts();

                // let isVideoPlaying = false;
                // for(const post of childrenMap){
                //     console.log(isElementInViewPort(post.el), !isVideoPlaying, post.el.querySelector("video"));
                //     if(isElementInViewPort(post.el) && !isVideoPlaying && post.el.querySelector("video")) {
                //         isVideoPlaying = true;
                //         post.el.querySelector("video").play();
                //         break;
                //     }else if(post.el.querySelector("video")){
                //         post.el.querySelector("video").pause();
                //     }
                // }
            });
        }
    });

    // function isElementInViewPort(element){
    //     let rect = element.getBoundingClientRect();

    //     return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight || document.documentElement.clientHeight && rect.right <= window.innerWidth || document.documentElement.clientWidth);
    // }

    const setChildrenMap = () => {
        if(!postsContainer) return
        for(const el of postsContainer.children){
            if(el.nodeName === "ARTICLE") childrenMap = [...childrenMap, { el, top:el.offsetTop, height:el.clientHeight }];
        }
    }
    
    async function loadMorePosts() {
        if(isMorePostsToLoad && !morePostsLoading){
            morePostsLoading = true;
            const res = await fetch(`/api/getSubsPosts?offset=${offset}`, { method:"GET" });
            const apiRes = await res.json();
            if(!apiRes.error || !apiRes.message){
                feed = [ ...feed, ...apiRes.posts ];
                if(feed.length === lastNumberOfPosts) isMorePostsToLoad = false;
                lastNumberOfPosts = feed.length;
            }else $toasts = [...$toasts, { type:"error", message:apiRes.message }];
            morePostsLoading = false;
        }
    }

    function setActiveTab() {
        for(let i = 0;i < sectionsList.length;i++){
            if(i === tabIndex){
                let activeButton = document.querySelector("[data-section*='"+sectionsList[i].id+"']");
                navLinkUnderline.style.left = activeButton.offsetLeft+"px";
                navLinkUnderline.style.width = activeButton.clientWidth+"px";
            }
        }
    }

    $pageMetaData.title = "Home";
    $pageMetaData.description = "Home page of this amazing social network.";
    $pageMetaData.currentPageName = "Home";
</script>

{#if !user}
    <section class="justify-between w-full grid grid-cols-1 gap-6 lg:grid-cols-2 min-h-screen items-center">
        <svg viewBox="0 0 24 24" class="lg:max-h-96 max-h-64 mx-auto fill-neutral-100"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
        <div class="w-full max-lg:flex max-lg:items-center max-lg:flex-col p-2">
            <h1>Happening now</h1>
            <h5 class="mt-16 mb-10">Join today.</h5>
            <div class="w-full max-w-md">
                <div class="w-full font-medium text-center text-neutral-400 flex flex-row justify-between relative mb-2">
                    <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all {tabIndex === 0 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 0}} data-section="Log-in">Log-in</button>
                    <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all {tabIndex === 1 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 1}} data-section="Sign-in">Sign-in</button>
                    <span bind:this={navLinkUnderline} class="h-1 transition-all bottom-0 bg-primary-600 absolute ease-in-out duration-300"></span>
                </div>

                <div class="relative overflow-hidden grid grid-cols-2 w-full">
                    <form class="w-[200%] no-user transition-all ease-in-out duration-300 p-2 {tabIndex === 0 ? "translate-x-0" : "translate-x-full"}" use:enhance method="POST" action="?/login" id="Log-in">
                        <label for="username" class="block mb-2">Username</label>
                        <input type="text" placeholder="Username" name="username" value="{form?.logIn?.formData?.username ?? ''}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4" maxlength="15">
        
                        <label for="password" class="block mb-2">Password</label>
                        <input type="password" placeholder="Password" name="password" value="{form?.logIn?.formData?.password ?? ''}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
                
                        <button class="button-primary group w-full mb-4">
                            Log-in
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 group-hover:rotate-[-360deg] transition-all duration-300 delay-100"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </button>
                
                        {#if form?.logIn?.success === false}
                            <div class="flex items-center p-4 text-sm border rounded-lg bg-neutral-800 text-red-400 border-red-800" role="alert">
                                <svg class="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>
                                {form?.logIn?.message}
                            </div>
                        {/if}
                    </form>
                    <form class="w-[200%] no-user transition-all ease-in-out duration-300 p-2 {tabIndex === 1 ? "-translate-x-1/2" : "-translate-x-[150%]"}" use:enhance method="POST" action="?/signin" id="Sign-in">
                        <label for="username" class="block mb-2">E-mail</label>
                        <input type="text" placeholder="E-mail" name="email" value="{form?.signIn?.formData?.email ?? ''}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
    
                        <label for="username" class="block mb-2">Username</label>
                        <input type="text" placeholder="Username" name="username" value="{form?.signIn?.formData?.username ?? ''}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4" maxlength="15">
        
                        <label for="password" class="block mb-2">Password</label>
                        <input type="password" placeholder="Password" name="password" value="{form?.signIn?.formData?.password ?? ''}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-4">
                
                        <button class="button-primary group w-full mb-4">
                            Sign-in
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 group-hover:rotate-[-360deg] transition-all duration-300 delay-100"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </button>
                
                        {#if form?.signIn?.success === false}
                            <div class="flex items-center p-4 text-sm border rounded-lg bg-neutral-800 text-red-400 border-red-800" role="alert">
                                <svg class="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>
                                {form?.signIn?.message}
                            </div>
                        {/if}
                    </form>
                </div>
            </div>
        </div>
    </section>
{:else}
    <main class="flex md:flex-row flex-col-reverse justify-between md:items-start items-center h-full w-full max-w-md">
        <div class="w-full flex flex-col h-full border-x border-border" bind:this={postsContainer}>
            {#each feed as post, index}
                <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
            {/each}
        </div>
    </main>
{/if}