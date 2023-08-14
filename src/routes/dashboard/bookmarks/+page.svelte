<script>
    import { Post } from '$lib/components';
    import { onMount } from "svelte";
    import { pageMetaData } from "$lib/stores"

    export let data;

    const { subscriptions } = data;
    let bookmarks = data.bookmarks;
    let tabIndex = 0;
    let sectionsList = [];
    let navLinkUnderline;
    let activeButton;

    $: setActiveTab(), tabIndex;

    onMount(() => {
        sectionsList = document.querySelectorAll("section");

        setActiveTab();
        window.onresize = setActiveTab;
    });

    function setActiveTab() {
        for(let i = 0;i < sectionsList.length;i++){
            if(i !== tabIndex){
                sectionsList[i].style.display = "none";
            }else {
                sectionsList[i].style.display = "flex";
                activeButton = document.querySelector("[data-section*='"+sectionsList[i].id+"']");
                if(navLinkUnderline){
                    navLinkUnderline.style.left = activeButton.offsetLeft +"px";
                    navLinkUnderline.style.width = activeButton.clientWidth +"px";
                }
            }
        }
    }
    
    $pageMetaData.title = "Bookmarks";
    $pageMetaData.description = "Bookmarks";
    $pageMetaData.currentPageName = "Bookmarks";
</script>

<main class="flex flex-col w-full">
    <div class="w-full font-medium text-center text-neutral-400 flex flex-row justify-between relative">
        <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all {tabIndex === 0 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 0}} data-section="Posts">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="{tabIndex === 0 ? "w-4 h-4 mr-2 text-primary-500" : "-4 h-4 mr-2 text-neutral-500 group-hover:text-neutral-300"}"><path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" /></svg>
            Posts
        </button>
        <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all {tabIndex === 1 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 1}} data-section="Users">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="{tabIndex === 1 ? "w-4 h-4 mr-2 text-primary-500" : "-4 h-4 mr-2 text-neutral-500 group-hover:text-neutral-300"}"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Users
        </button>
        <span bind:this={navLinkUnderline} class="h-1 transition-all bottom-0 bg-primary-600 absolute ease-in-out duration-300"></span>
    </div>

    <section class="flex flex-col w-full border-x border-border max-w-md mx-auto" id="Posts">
        {#each bookmarks as post, index}
            <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
        {/each}
    </section>
    <section class="flex flex-col w-full max-w-md mx-auto" style="display: none;" id="Users">
        {#each subscriptions as user}
            <a href="/u/{user.username}" class="userCard md:h-auto h-40 w-full shrink-0">
                <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="aspect-ratio: 3/1;background-image: url('{user.banner}');" id="profileBanner">
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <img id="profilePicture" alt="Profile picture" class="rounded-full h-16 w-16 absolute bottom-0 left-5 translate-y-3/4 ring-4 ring-neutral-800" src="{user.profilePicture}">
                </div>
                <div class="h-[48px] mb-2 pl-[104px]">
                    <p class="pr-2 text-lg leading-8 font-sans font-semibold">{user.username}</p>
                </div>
            </a>
        {/each}
    </section>
</main>