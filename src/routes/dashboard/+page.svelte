<script>
    import { onMount } from "svelte";
    import { Tooltip } from 'flowbite-svelte';
    import { enhance } from "$app/forms";
    import { Post } from '$lib/components';
    import { pageMetaData } from "$lib/stores";
    // import { isElementInViewPort } from "$lib/helpers";

    export let data;

    const { user } = data;
    const { bookmarks } = user;
    let posts = data.posts;
    let newPostModal = false;
    let morePostsLoading = false;
    let isMorePostsToLoad = true;
    let atMenuDisplay = false;
    let isNewPostLoading = false;
    let certificationModal = false;
    let mentionUsers = [];
    // let childrenMap = [];
    let newPostFiles = [];
    let offset = 0;
    let textarea;
    let postsContainer;
    
    $: offset = posts.length;
    $: lastNumberOfPosts = posts.length;
    // $: lastNumberOfPosts, setChildrenMap();
    // Limit file size to 3
    $: if(newPostFiles.length > 3) newPostFiles = newPostFiles.slice(0, 3);

    onMount(() => {
        // setChildrenMap();
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            // When the user is [modifier]px from the bottom, fire the event.
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadUserPosts();

            // let isVideoPlaying = false;
            // for(const post of childrenMap.reverse()){
            //     if(isElementInViewPort(post.el) && !isVideoPlaying && post.el.querySelector("video")) {
            //         isVideoPlaying = true;
            //         post.el.querySelector("video").play()
            //     }else if(post.el.querySelector("video")){
            //         post.el.querySelector("video").pause();
            //     }
            // }
        });
    });

    // const setChildrenMap = () => {
    //     if(!postsContainer) return
    //     for(const el of postsContainer.children){
    //         if(el.nodeName === "ARTICLE") childrenMap = [...childrenMap, { el, top:el.offsetTop, height:el.clientHeight }];
    //     }
    // }

    function newPostFileHandle(e) {
        newPostFiles = [...newPostFiles, ...e.target.files];
        e.target.value = "";
    }

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

    const  calcHeight = (value) => {return Math.min((value.match(/\n/g) || []).length+4, 10) * 20 + 16;}
    async function oninput(){
        if(textarea.value.length > user.certified ? 1000 : 100){
            textarea.value = textarea.value.slice(0, user.certified ? 1000 : 100);
        }
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
            return ;
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
        let start = textBeforeCaret.split("@");
        start.pop();
        textarea.value = start.join("@") + `@${username}`;
        textarea.focus();
    }

    $pageMetaData.title = "Dashboard";
    $pageMetaData.description = "Dashboard";
    $pageMetaData.currentPageName = "Dashboard";
</script>

<div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {certificationModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full">
        <div class="p-6 flex flex-col gap-6 bg-no-repeat items-center rounded-t-lg" style="background-image: url(https://abs.twimg.com/sticky/illustrations/twitter_blue_images_v2/background-600W.png); background-position: 0px -150px;">
            <div class="rounded-2xl bg-neutral-900 p-2 w-full flex flex-row">
                <h4 class="leading-7 my-auto h-fit">Premium subscribers will get a blue checkmark once approved.</h4>
                <img alt="illustration" draggable="false" src="https://abs.twimg.com/responsive-web/client-web/verification-card-v2@3x.8ebee01a.png" class="h-full w-1/4 my-auto">
            </div>
            <ul class="list-inside list-disc w-full pl-4 text-neutral-100">
                <li>Only add a magnificent <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg> icon next to your profile for the low-low price of <b>$19,99</b>!</li>
            </ul>
            <div class="w-full gap-2 grid grid-cols-2">
                <button type="button" class="button-secondary" on:click={() => {certificationModal = false;}}>No, cancel</button>
                <a href="/buy-certification" class="button-primary">Buy for 19,99€</a>
            </div>
        </div>
    </div>
</div>

<div class="fixed top-0 left-0 bg-neutral-600 bg-opacity-50 w-full h-full flex flex-col justify-center items-center transition-all md:p-4 p-1 {newPostModal ? "z-40 opacity-100" : "-z-10 opacity-0"}">
    <form method="POST" enctype="multipart/form-data" use:enhance={(e) => {isNewPostLoading = true;for(let i=0;i <newPostFiles.length;i++){e.formData.set(`file-${i}`, newPostFiles[i], newPostFiles[i].name);}return ({ update }) => {isNewPostLoading = false;update({ reset: false });}}} class="flex flex-col w-full max-w-md relative max-h-full" action="?/newPost">
        <button type="button" on:click={() => {newPostModal = false;}} class="absolute top-2.5 right-2.5 text-neutral-400 bg-transparent rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center hover:bg-neutral-800 hover:text-neutral-100 group">
            <svg class="w-3 h-3 group-hover:rotate-90 transition-all" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            <span class="sr-only">Close modal</span>
        </button>
        <div class="w-full border rounded-t-lg bg-neutral-700 border-neutral-600">
            <div class="flex items-center px-3 py-2 border-b border-neutral-600">
                <div class="flex flex-wrap items-center sm:divide-x divide-neutral-600">
                    <div class="flex items-center space-x-1 pr-4">
                        <label for="files" class="p-2 rounded cursor-pointer text-neutral-400 hover:text-neutral-100 hover:bg-neutral-600">
                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20"><path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/><path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/></svg>
                            <span class="sr-only">Upload image</span>
                        </label>
                        <Tooltip type="dark">Add image/video</Tooltip>
                        <input type="file" name="files" id="files" accept="image/*,video/*" class="hidden" on:change={newPostFileHandle} multiple/>
                    </div>
                </div>
                <p class="ml-auto pr-10">{textarea?.value?.length}/{user.certified ? "1000" : "100"}</p>
            </div>
            
            {#if newPostFiles.length > 0}
                <div class="flex flex-row flex-wrap p-2">
                    {#each newPostFiles as file, index}
                        <div class="relative group px-2">
                            <p class="pr-4">{file.name.length > 10 ? file.name.slice(0, 7)+"..."+file.name.split(".").at(-2).slice(-3)+"."+file.name.split(".").at(-1) : file.name}</p>
                            <div class="w-full h-full bg-neutral-900/50 rounded-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all flex flex-row justify-end items-center">
                                <button class="pr-2" type="button" on:click={() => {newPostFiles = newPostFiles.filter((_, i) => i!==index)}}>
                                    <svg class="w-3 h-3 transition-all text-neutral-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
            <div class="px-4 py-2 bg-neutral-800">
                <textarea name="text" rows="4" class="block w-full px-0 text-sm border-0 bg-neutral-800 focus:ring-0 text-neutral-100 placeholder-neutral-400 max-h-80 min-h-[96px]" placeholder="Write your new post..." bind:this={textarea} on:keyup={oninput}></textarea>
                {#if atMenuDisplay}
                    <div class="flex flex-row flex-wrap gap-2">
                        {#each mentionUsers as user}
                            <button class="p-2 flex flex-row items-center gap-4 bg-neutral-900 hover:bg-neutral-950 border border-border text-neutral-100 w-fit rounded-xl transition-all" data-username="{user.username}" on:click={() => {identifyUser(user.username)}}>
                                <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                                <div class="flex flex-col"><h6>{ user.username }</h6></div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
        <button type="submit" class="focus:outline-none text-neutral-100 bg-primary-600 hover:bg-primary-700 font-medium text-sm px-5 py-2.5 flex flex-row gap-2 items-center justify-center disabled:bg-primary-400 disabled:cursor-not-allowed transition-all rounded-b-lg">
            {#if isNewPostLoading}
                <div role="status">
                    <svg aria-hidden="true" class="inline w-4 h-4 mr-2 animate-spin text-neutral-100 fill-primary-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span class="sr-only">Loading...</span>
                </div>
            {:else}
                Publish post
            {/if}
        </button>
    </form>
</div>

<section class="w-full">
    <div class="flex flex-row gap-2 items-center mt-4">
        <a href="/u/{user.username}" name="yourProfile">
            <img src="{user.profilePicture}" alt="" class="w-14 h-14 rounded-full">
        </a>
        <div class="flex flex-col">
            <h2>
                {user.displayName}
                {#if user.certified}
                    <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>
                {/if}
            </h2>
            <p class="text-sm">@{user.username}</p>
        </div>
    </div>
    <hr>
    <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <a href="/dashboard/bookmarks" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
            My bookmarks
            <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300 absolute top-2 sm:top-0 right-2 sm:right-0 sm:-translate-y-1/2 sm:translate-x-1/2">{bookmarks.length}</span>
        </a>

        <a href="/dashboard/conversations" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            Messages
        </a>

        <button on:click={() => {newPostModal=true}} class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
            New post
        </button>

        <a href="/dashboard/settings" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Settings
        </a>

        {#if !user.certified}
            <button on:click={() => {certificationModal = true;}} class="card-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                Certification
            </button>
        {/if}

        <a href="/log-out" class="card-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            Log-out
        </a>
    </div>

    <section class="flex flex-col w-full mt-4 border-t border-border">
        <div class="w-full flex flex-col max-w-lg mx-auto h-full border-x border-border" bind:this={postsContainer}>
            {#each posts as post}
                <Post post={post} bookmarks={bookmarks} borderTop={false} />
            {/each}
        </div>
    </section>
</section>