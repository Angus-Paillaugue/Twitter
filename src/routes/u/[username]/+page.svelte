<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components";
    import { pageMetaData, toasts } from "$lib/stores";
    import { fade } from 'svelte/transition';

    export let data;

    const { profile, user } = data;
    let bookmarks = user.bookmarks;
    let posts = data.posts;
    let subscriptions = user.subscriptions;
    let fullBio = false;
    let morePostsLoading = false;
    let isMorePostsToLoad = true;
    let childrenMap = [];
    let offset = 0;
    let bioP;
    let postsContainer;
    $: isSubscribed = subscriptions.filter(el => el.username == profile.username).length > 0;
    $: offset = posts.length;
    $: if(fullBio){bioP.style.maxHeight = bioP.scrollHeight+24+"px";}else if(bioP){bioP.style.maxHeight = "24px";}
    $: offset = posts.length;



    onMount(() => {
        for(const el of postsContainer.children){
            if(el.nodeName === "ARTICLE") childrenMap = [...childrenMap, { el, top:el.offsetTop, height:el.clientHeight }];
        }
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            // When the user is [modifier]px from the bottom, fire the event.
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadPosts();

            let bottomTrigger = window.scrollY + window.innerHeight/2;
            let isVideoPlaying = false;
            for(const post of childrenMap){
                if((post.top + post.height) > bottomTrigger){
                    if(post.el.querySelector("video")){
                        if(!isVideoPlaying){
                            post.el.querySelector("video").play();
                            isVideoPlaying = true;
                            continue;
                        }
                    }
                }else if(post.el.querySelector("video")){
                    post.el.querySelector("video").pause();
                }
            }
        });
    });
    
    async function loadPosts() {
        if(isMorePostsToLoad && !morePostsLoading){
            morePostsLoading = true;
            const res = await fetch(`/api/getUserPosts/${profile.username}?offset=${offset}`, { method:"GET" });
            const apiRes = await res.json();
            if(!apiRes.error || !apiRes.message){
                posts = [...posts, ...apiRes.posts];
                isMorePostsToLoad = apiRes.morePosts;
            }else $toasts = [...$toasts, { type:"error", message:apiRes.message }];
            morePostsLoading = false;
        }
    }
    
    async function toggleSubscription(username) {
        const res = await fetch("/api/toggleSubscription", { method:"POST", body:JSON.stringify({ username }) });
        const apiRes = await res.json();
        if(!apiRes.error)  subscriptions = apiRes.subscriptions; else $toasts = [...$toasts, { type:"error", message:apiRes.message }];
    }

    $pageMetaData.title = `${profile.username}'s profile.`;
    $pageMetaData.description = `${profile.username}'s profile.`;
    $pageMetaData.currentPageName = "Profile";
</script>

<main class="w-full">
    <section class="border-b border-border">
        <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="height: 25vw; background-image: url('{profile.banner}');">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src="{profile.profilePicture}" alt="Profile picture" class="rounded-full lg:h-36 transition-all lg:w-36 md:h-24 md:w-24 w-16 h-16 absolute bottom-0 left-2 md:left-5 translate-y-3/4 ring-4 ring-neutral-800">
        </div>
        <div class="lg:h-[108px] md:h-[70px] mb-2 flex flex-col sm:flex-row items-start md:items-center gap-2 lg:p-4 p-2 max-sm:pt-14 lg:pl-44 md:pl-32 pl-2">
            <div class="h-full flex flex-col items-start">
                <h2>{profile.displayName}</h2>
                <p class="text-sm">@{profile.username}</p>
            </div>
            {#if user}
                <button class="button-primary ml-auto" on:click={() => {toggleSubscription(profile.username)}}>
                    {#if isSubscribed}
                        Followed
                        <svg in:fade xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" class="transition-all" style="stroke-dasharray: 100;animation: dash 4s;" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {:else}
                        Follow
                    {/if}
                </button>
            {/if}
        </div>
    
        <p bind:this={bioP} class="w-full transition-all overflow-hidden relative px-2 duration-500 {fullBio && "py-4"}" style="max-height: 24px;">
            {@html profile.bio}
        </p>
        {#if profile.bio.includes("<br />")}
            <button class="ml-2 mb-2 link" on:click={() => {fullBio = !fullBio}}>
                Show {fullBio ? "less" : "more"}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block transition-all duration-500 {!fullBio && "rotate-180"}"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>              
            </button>
        {/if}
    </section>
    
    <section class="flex flex-col max-w-md mx-auto w-full">
        <div class="w-full flex flex-col h-full border-x border-border" bind:this={postsContainer}>
            {#each posts as post, index}
                <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
            {/each}
        </div>
    </section>
</main>