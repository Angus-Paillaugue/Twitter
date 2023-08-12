<script>
    import { Post } from '$lib/components';
    import { onMount } from "svelte";
    import { pageMetaData } from "$lib/stores";
    import { fade } from 'svelte/transition';

    export let data;

    const { profile, user } = data;
    let bookmarks = user.bookmarks;
    let posts = data.posts;
    let subscriptions = user.subscriptions;
    let fullBio = false;
    let offset = 0;
    let isMorePosts = true;
    let bioP;
    $: isSubscribed = subscriptions.filter(el => el.username == profile.username).length > 0;

    $: offset = posts.length;
    $: if(fullBio){bioP.style.maxHeight = bioP.scrollHeight+16+"px";}else if(bioP){bioP.style.maxHeight = "24px";}

    onMount(() => {
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            if(currentScroll + 500 > documentHeight) loadPosts();
        });
    });

    async function toggleSubscription(username) {
        const res = await fetch("/api/toggleSubscription", { method:"POST", body:JSON.stringify({ username }) });
        const apiRes = await res.json();
        if(!apiRes.error)  subscriptions = apiRes.subscriptions;
    }

    async function loadPosts() {
        if(isMorePosts){
            const res = await fetch(`/api/getUserPosts/${profile.username}?offset=${offset}`, { method:"GET" });
            const apiRes = await res.json();
            if(!apiRes.error || !apiRes.message){
                posts = [...posts, ...apiRes.posts];
                isMorePosts = apiRes.morePosts
            }
        }
    }
    
    $pageMetaData.title = `${profile.username}'s profile.`;
    $pageMetaData.description = `${profile.username}'s profile.`;
</script>

<section class="w-full">
    <section class="border-b border-border">
        <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="height: 25vw; background-image: url('{profile.banner}');">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src="{profile.profilePicture}" alt="Profile picture" class="rounded-full lg:h-36 transition-all lg:w-36 md:h-24 md:w-24 w-16 h-16 absolute bottom-0 left-2 md:left-5 translate-y-3/4 ring-4 ring-neutral-800">
        </div>
        <div class="lg:h-[108px] md:h-[70px] h-[54px] mb-2 flex justify-between items-center lg:p-4 p-2 lg:pl-44 md:pl-32 pl-20">
            <div class="h-full flex items-start">
                <h1 class="lg:text-4xl text-2xl">{profile.username}</h1>
            </div>
            {#if user}
                <button class="button-primary" on:click={() => {toggleSubscription(profile.username)}}>
                    {#if isSubscribed}
                        Followed
                        <svg in:fade xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" class="transition-all" style="stroke-dasharray: 100;animation: dash 4s;" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {:else}
                        Follow
                    {/if}
                </button>    
            {/if}
        </div>
    
        <p bind:this={bioP} class="w-full transition-all overflow-hidden relative pl-2 duration-500 {fullBio && "py-4"}">
            {@html profile.bio}
        </p>
        {#if profile.bio.includes("<br />")}
            <button class="ml-2 mb-2 link" on:click={() => {fullBio = !fullBio}}>
                Show {fullBio ? "less" : "more"}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block transition-all duration-500 {!fullBio && "rotate-180"}"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>              
            </button>
        {/if}
    </section>
    
    <section class="flex flex-col max-w-lg mx-auto w-full border-x border-border">
        {#each posts as post}
            <Post post={post} bookmarks={bookmarks} />
        {/each}
    </section>
</section>