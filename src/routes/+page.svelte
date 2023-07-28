<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components"
    import { pageMetaData } from "$lib/stores"

    export let data;

    const { usersAside } = data;
    let isDown = false;
    let bookmarks = [];
    let offset = 0;
    let startX;
    let scrollLeft;
    let feed = data.feed;
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
        const res = await fetch(`/api/getSubsPosts?offset=${offset}`, { method:"GET" });
        const apiRes = await res.json();
        if(!apiRes.error || !apiRes.message){
            feed = [ ...feed, ...apiRes.feed ];
        }
    }

    $pageMetaData.title = "Home";
    $pageMetaData.description = "Home page of this amazing social network.";
    $pageMetaData.headerText = "Home";
</script>

{#if !user}
    <section class="bg-primary-100 dark:bg-primary-700/30 p-6 justify-between w-full grid grid-cols-1 xl:grid-cols-2 text-center min-h-screen items-center">
        <div class="flex flex-col justify-center">
            <h2 class="font-bold leading-snug text-gray-700 dark:text-neutral-100 mb-4">Angus's template</h2>
            <p class="mb-10">This is a template for sveltekit, tailwindcss and mongodb</p>
            <a href="/sign-in" class="button-primary w-fit mx-auto mb-10">
                Sign up now
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 transition-all"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>    
            </a>
        </div>
        <img class="mx-auto" src="/hero.svg" alt="" />
    </section>
{:else}
    <main class="flex md:flex-row flex-col-reverse justify-between md:px-6 md:gap-6 px-2 gap-2 md:items-start items-center h-full">
        <section class="w-full flex flex-col max-w-md md:gap-6 gap-2 mx-auto md:my-6 mt-2 h-full">
            {#each feed as post}
                <Post post={post} bookmarks={bookmarks} />
            {/each}
        </section>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <aside class="md:sticky md:top-0 md:h-full md:w-96 max-w-md md:flex-col gap-6 mx-auto p-0 md:x-3 pb-4 pt-6 md:overflow-y-auto md:overflow-x-hidden flex flex-row w-full overflow-x-auto will-change-transform cursor-pointer no-scrollbar"
        on:mousedown={(e) => {let slider = e.target.closest("aside");isDown = true;slider.classList.add('cursor-grab');startX = e.pageX - slider.offsetLeft;scrollLeft = slider.scrollLeft;}} 
        on:mouseleave={(e) => {isDown = false;e.target.closest("aside").classList.remove('cursor-grab');}} 
        on:mouseup={(e) => {isDown = false;e.target.closest("aside").classList.remove('cursor-grab');}} 
        on:mousemove={(e) => {let slider = e.target.closest("aside");if(!isDown) return;e.preventDefault();const x = e.pageX - slider.offsetLeft;const walk = (x - startX) * 2; slider.scrollLeft = scrollLeft - walk;}}>
            {#each usersAside as user}
                <a href="/u/{user.username}" class="userCard md:h-auto h-40 md:w-auto w-10/12 shrink-0" type="user">
                    <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="aspect-ratio: 3/1;background-image: url('{user.banner}');" id="profileBanner">
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img id="profilePicture" alt="Profile picture" class="rounded-full h-16 w-16 absolute bottom-0 left-5 translate-y-3/4" src="{user.profilePicture}">
                    </div>
                    <div class="h-[48px] mb-2 pl-[104px]">
                        <p class="pr-2 text-lg leading-8 font-sans font-semibold">{user.username}</p>
                    </div>
                </a>
            {/each}
        </aside>
    </main>
{/if}