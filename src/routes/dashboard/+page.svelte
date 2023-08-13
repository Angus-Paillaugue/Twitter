<script>
    import { Tooltip } from 'flowbite-svelte';
    import { enhance } from "$app/forms"
    import { Post } from '$lib/components';
    import { onMount } from "svelte";
    import { pageMetaData } from "$lib/stores";

    export let data;

    const { user } = data;
    const { bookmarks } = user;
    let posts = data.posts
    let offset = 0;
    let newPostModal = false;
    let morePostsLoading = false;
    let isMorePostsToLoad = true;
    let atMenuDisplay = false;
    let mentionUsers = []
    let files;
    let textarea;
    
    $: offset = posts.length;
    $: lastNumberOfPosts = posts.length;
    // Limit file size to 3
    $: if(files?.length > 3) files = [files[0], files[1], files[2]];

    onMount(() => {
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadUserPosts();
        });
    });

    async function loadUserPosts() {
        if(isMorePostsToLoad && !morePostsLoading){
            morePostsLoading = true;
            const res = await fetch(`/api/getUserPosts/${user.username}?offset=${offset}`, { method:"GET" });
            const apiRes = await res.json();
            if(!apiRes.error || !apiRes.message) posts = [ ...posts, ...apiRes.posts ];
            if(posts.length === lastNumberOfPosts) isMorePostsToLoad = false;
            lastNumberOfPosts = posts.length;
            morePostsLoading = false;
        }
    }

    const  calcHeight = (value) => {return Math.min((value.match(/\n/g) || []).length+1, 10) * 20 + 16;}
    async function oninput(){
        textarea.style.height = calcHeight(textarea.value) + "px";
        const positionIndex = textarea.selectionStart;
        const textBeforeCaret = textarea.value.slice(0, positionIndex);
        const tokens = textBeforeCaret.split(/\s/);
        const lastToken = tokens[tokens.length - 1];
        const triggerIdx = textBeforeCaret.endsWith(lastToken) ? textBeforeCaret.length - lastToken.length : -1;
        const maybeTrigger = textBeforeCaret[triggerIdx];
        const keystrokeTriggered = maybeTrigger === '@';
        if(!keystrokeTriggered) { 
            atMenuDisplay = false; 
            return 
        }
        const query = textBeforeCaret.slice(triggerIdx+1);

        atMenuDisplay = true;
        const res = await fetch(`/api/getMentionUser?query=${query}`, { method:"GET" });
        mentionUsers = await res.json();
    }

    function identifyUser(username){
        atMenuDisplay = false; 
        const positionIndex = textarea.selectionStart;
        const textBeforeCaret = textarea.value.slice(0, positionIndex);
        let start = textBeforeCaret.split("@")
        start.pop();
        textarea.value = start.join("@") + `@${username}`;
        textarea.focus();
    }

    $pageMetaData.title = "Dashboard";
    $pageMetaData.description = "Dashboard";
    $pageMetaData.currentPageName = "Dashboard";
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="fixed top-0 left-0 bg-neutral-600 bg-opacity-50 w-full h-full flex flex-col justify-center items-center transition-all p-4 {newPostModal ? "z-40 opacity-100" : "-z-10 opacity-0"}">
    <form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col w-full max-w-md relative max-h-full">
        <button type="button" on:click={() => {newPostModal = false;}} class="absolute top-2.5 right-2.5 text-neutral-400 bg-transparent rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center hover:bg-neutral-600 hover:text-neutral-100 group">
            <svg class="w-3 h-3 group-hover:rotate-90 transition-all" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            <span class="sr-only">Close modal</span>
        </button>
        <div class="w-full border rounded-t-lg bg-neutral-700 border-neutral-600">
            <div class="flex items-center justify-between px-3 py-2 border-b border-neutral-600">
                <div class="flex flex-wrap items-center sm:divide-x divide-neutral-600">
                    <div class="flex items-center space-x-1 pr-4">
                        <label for="files" class="p-2 rounded cursor-pointer text-neutral-400 hover:text-neutral-100 hover:bg-neutral-600">
                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20"><path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/><path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/></svg>
                            <span class="sr-only">Upload image</span>
                        </label>
                        <Tooltip type="dark">Add image/video</Tooltip>
                        <input type="file" name="files" id="files" accept="image/*,video/*" bind:files class="hidden" multiple/>
                    </div>
                </div>
            </div>
            
            {#if files?.length > 0}
                <div class="flex flex-row flex-wrap p-2">
                    {#each files as file, index}
                        <div class="relative group px-2">
                            <p class="pr-4">{file.name.length > 10 ? file.name.slice(0, 7)+"..."+file.name.split(".").at(-2).slice(-3)+"."+file.name.split(".").at(-1) : file.name}</p>
                            <div class="w-full h-full bg-neutral-900/50 rounded-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all flex flex-row justify-end items-center">
                                <button class="pr-2" type="button" on:click={() => {files.splice(index, 1)}}>
                                    <svg class="w-3 h-3 transition-all text-neutral-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
            <div class="px-4 py-2 bg-neutral-800">
                <textarea name="text" rows="1" class="block w-full px-0 text-sm border-0 bg-neutral-800 focus:ring-0 text-neutral-100 placeholder-neutral-400" placeholder="Write your new post..." bind:this={textarea} on:keyup={oninput}></textarea>
                {#if atMenuDisplay}
                    <div class="w-full p-4">
                        <div class="flex flex-row flex-wrap gap-4">
                            {#each mentionUsers as user}
                                <button class="p-2 flex flex-row justify-start gap-4 bg-neutral-900 hover:bg-neutral-950 border border-border text-neutral-100 w-fit rounded-xl transition-all" data-username="{user.username}" on:click={() => {identifyUser(user.username)}}>
                                    <div class="p-2 flex flex-row justify-start items-center gap-4 w-fit">
                                        <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                                        <div class="flex flex-col"><h6>{ user.username }</h6></div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        <button type="submit" class="focus:outline-none text-neutral-100 bg-primary-600 hover:bg-primary-700 font-medium text-sm px-5 py-2.5 flex flex-row gap-2 items-center justify-center disabled:bg-primary-400 disabled:cursor-not-allowed shadow-primary-700 dark:shadow-primary-500 hover:shadow-lg hover:dark:shadow-sm transition-all rounded-b-lg">Publish post</button>
    </form>
</div>

<section class="w-full">
    <section class="w-full p-2">
        <h1 class="mt-4">{data.user.username}</h1>
        <hr>
        <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
            <a href="/dashboard/bookmarks" class="card-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                My bookmarks
                <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300 absolute top-2 sm:top-0 right-2 sm:right-0 sm:-translate-y-1/2 sm:translate-x-1/2">{bookmarks.length}</span>
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
    
    <section class="flex flex-col max-w-lg mx-auto border-x border-border mt-4">
        {#each posts as post, index}
            <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
        {/each}
    </section>
</section>