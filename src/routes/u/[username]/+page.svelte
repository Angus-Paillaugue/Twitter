<script>
    import { Post } from '$lib/components';
    import { onMount } from "svelte";
    import { pageMetaData } from "$lib/stores"

    export let data;

    const { profile, user } = data;
    let bookmarks = user.bookmarks;
    let posts = data.posts
    let subscriptions = user.subscriptions;
    let bio = user.bio.split("<br />")[0];
    let fullBio = false;
    let offset = 0;

    $: offset = posts.length;

    onMount(() => {
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            // When the user is [modifier]px from the bottom, fire the event.
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadPosts();
        });
    });

    async function toggleSubscription(username) {
        const res = await fetch("/api/toggleSubscription", { method:"POST", body:JSON.stringify({ username }) });
        const apiRes = await res.json();
        if(!apiRes.error){
            subscriptions = apiRes.subscriptions;
        }
    }

    async function loadPosts() {
        const res = await fetch(`/api/getUserPosts/${profile.username}?offset=${offset}`, { method:"GET" });
        const apiRes = await res.json();
        if(!apiRes.error || !apiRes.message){
            posts = [...posts, ...apiRes.posts];
        }
    }

    function toggleBio() {
        if(fullBio) {
            bio = profile.bio.split("<br />")[0];
        }else {
            bio = profile.bio;
        }
        fullBio = !fullBio;
    }
    
    $pageMetaData.title = `${profile.username}'s profile.`;
    $pageMetaData.description = `${profile.username}'s profile.`;
    $pageMetaData.headerText = `${profile.username}'s profile`;
</script>

<section>
    <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="height: 25vw; background-image: url('{profile.banner}');">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src="{profile.profilePicture}" alt="Profile picture" class="rounded-full lg:h-36 lg:w-36 h-24 w-24 absolute bottom-0 left-5 translate-y-3/4 ring-4 ring-white">
    </div>
    <div class="lg:h-[108px] h-[70px] mb-2 flex justify-between items-center lg:p-4 p-2 dark:text-white text-neutral-900 lg:pl-44 pl-32">
        <div class="h-full flex items-start">
            <h1 class="lg:text-4xl text-2xl">{profile.username}</h1>
        </div>
        {#if user}
            {#if subscriptions.filter(el => el.username == profile.username).length > 0 }
                <button class="button-red" on:click={() => {toggleSubscription(profile.username)}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Subscribed
                </button>    
            {:else}
                <button class="button-red" on:click={() => {toggleSubscription(profile.username)}}>Subscribe</button>    
            {/if}
        {/if}
    </div>

    <p class="text-lg p-2">{@html bio}</p>

    <button class="ml-2 mb-2 link" on:click={toggleBio}>
        {#if fullBio}
            Show less
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>              
        {:else}
            Show more
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        {/if}
    </button>

    <div class="flex flex-col max-w-lg md:gap-6 gap-2 mx-auto p-2">
        {#each posts as post}
            <Post post={post} bookmarks={bookmarks} />
        {/each}
    </div>

</section>