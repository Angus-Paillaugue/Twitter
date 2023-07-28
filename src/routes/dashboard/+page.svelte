<script>
    import { Tooltip } from 'flowbite-svelte';
    import { enhance } from "$app/forms"
    import { Post } from '$lib/components';
    import { onMount } from "svelte";
    import { pageMetaData } from "$lib/stores"

    export let data;

    const { user } = data;
    const { bookmarks } = user;
    let posts = data.posts
    let offset = 0;
    let newPostModal = false;

    $: offset = posts.length;

    onMount(() => {
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadUserPosts();
        });
    });

    async function loadUserPosts() {
        const res = await fetch(`/api/getSubsPosts?offset=${offset}`, { method:"GET" });
        const apiRes = await res.json();
        if(!apiRes.error || !apiRes.message){
            posts = [ ...posts, ...apiRes.feed ];
        }
    }

    $pageMetaData.title = "Dashboard";
    $pageMetaData.description = "Dashboard";
    $pageMetaData.headerText = "Dashboard";
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="fixed top-0 left-0 bg-neutral-600 bg-opacity-50 w-full h-full flex flex-col justify-center items-center transition-all p-4 {newPostModal ? "z-40 opacity-100" : "-z-10 opacity-0"}">
    <form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col w-full max-w-md relative max-h-full">
        <button type="button" on:click={() => {newPostModal = false;}} class="absolute top-2.5 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white group">
            <svg class="w-3 h-3 group-hover:rotate-90 transition-all" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            <span class="sr-only">Close modal</span>
        </button>
        <div class="w-full border border-gray-200 rounded-t-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <div class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
                <div class="flex flex-wrap items-center divide-gray-200 sm:divide-x dark:divide-gray-600">
                    <div class="flex items-center space-x-1 sm:pr-4">
                        <label for="file" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20"><path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/><path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/></svg>
                            <span class="sr-only">Upload image</span>
                        </label>
                        <Tooltip type="auto">Add image/video</Tooltip>
                        <input type="file" name="file" id="file" class="hidden"/>
                    </div>
                </div>
            </div>
            <div class="px-4 py-2 bg-white dark:bg-gray-800">
                <textarea name="text" rows="8" class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write your new post..."></textarea>
            </div>
        </div>
        <button type="submit" class="focus:outline-none text-white bg-primary-600 hover:bg-primary-700 font-medium text-sm px-5 py-2.5 flex flex-row gap-2 items-center justify-center disabled:bg-primary-400 disabled:cursor-not-allowed shadow-primary-700 dark:shadow-primary-500 hover:shadow-lg hover:dark:shadow-sm transition-all rounded-b-lg">Publish post</button>
    </form>
</div>


<section class="max-w-lg mx-auto flex flex-col gap-4 p-4 rounded-lg text-neutral-content">
    <h1 class="text-5xl font-semibold">{data.user.username}</h1>
    <hr>
    <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <a href="/dashboard/bookmarks" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
            My bookmarks
            <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300 absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">{bookmarks.length}</span>
        </a>

        <button on:click={() => {newPostModal=true}} class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            New post
        </button>

        <a href="/dashboard/settings" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Settings
        </a>

        <a href="/log-out" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            Log-out
        </a>
    </div>
</section>

<section class="flex flex-col max-w-lg mx-auto md:gap-6 gap-2 px-4 md:my-6 my-2 h-full">
    {#each posts as post}
        <Post post={post} bookmarks={bookmarks} />
    {/each}
</section>