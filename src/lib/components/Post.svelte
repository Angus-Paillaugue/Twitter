<script>
    import { formatDate, parseMentions, fileType, parseLink } from "$lib/helpers";
    import { toasts } from "$lib/stores";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    export let post;
    export let bookmarks;
    export let borderTop;

    let mediaModalSrc = {type:"", src:""};
    let isFullScreen = false;
    let isDeleted = false;
    let deletePostModal = false;
    let readMoreToggle = false;
    let isReadMore = false;
    let replieModal = false;
    let postText;
    let newReplieText;
    
    $: if(readMoreToggle){postText.style.maxHeight = postText.scrollHeight+24+"px";}else if(postText){postText.style.maxHeight = 14*24+"px";}
    $: if(postText?.clientHeight >= 14*24){isReadMore = true;}

    async function toggleBookmark() {
        const res = await fetch("/api/toggleBookmark", { method:"POST", body:JSON.stringify({ id:post.id }) });
        const apiRes = await res.json();
        if(!apiRes.error) bookmarks = apiRes.bookmarks; else $toasts = [ ...$toasts, { type:"error", message:apiRes.message } ]
        if($page.route.id.includes("bookmarks") && bookmarks.filter(bookmark => bookmark.id == post.id).length == 0) isDeleted = true;
    }

    async function deletePost() {
        const res = await fetch("/api/deletePost", { method:"POST", body:JSON.stringify({ id:post.id }) });
        const apiRes = await res.json();
        if(!apiRes.error) {
            isDeleted = true;
            deletePostModal = false;
        }else {
            $toasts = [ ...$toasts, { type:"error", message:apiRes.message } ];
        }
    }

    const showMediaFS = (index) => {
        mediaModalSrc.type = fileType(post.file[index]);
        mediaModalSrc.src = post.file[index];
        isFullScreen = true;
    }

    async function publishReplie() {
        const res = await fetch("/api/newReplie", { method:"POST", body:JSON.stringify({ text:newReplieText, id:post.id}) });
        const data = await res.json()
        if(!data.error) goto(`/post/${post.id}`);
    }
</script>

{#if !isDeleted && post?.user}
    <article class="postCard {borderTop ? "border-y" : "border-b"}">
        <div class="flex flex-row justify-between items-center gap-2 w-full">
            <div class="flex flex-row gap-2 items-center">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <a href="/u/{post.user.username}"><img src="{post.user.profilePicture}" class="rounded-full h-12 w-12" alt="Profile picture"></a>
                <div class="flex flex-col">
                    <h5>{post.user.displayName}</h5>
                    <p class="text-xs">@{post.user.username}</p>
                </div>
            </div>
            <p class="text-xs">{formatDate(post.date)}</p>
        </div>
        <div class="w-full sm:pl-12 flex flex-col gap-2">
            {#if post.text}
                <p class="leading-6 overflow-hidden transition-all duration-500 {readMoreToggle && "py-4"}" style="max-height: {14*24}px;" bind:this={postText}>{@html parseMentions(parseLink(post.text.replaceAll("\n", "<br>")))}</p>
                {#if isReadMore}
                    <button class="link w-fit" on:click={() => {readMoreToggle = !readMoreToggle}}>
                        Read {readMoreToggle ? "less" : "more"}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block transition-all duration-500 {!readMoreToggle && "rotate-180"}"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </button>
                {/if}
            {/if}
            {#if post.file}
                <div class="mx-auto grid {post.file.length === 1 ? "grid-cols-1" :  "grid-cols-2"} gap-2">
                    {#each post.file as file, index}
                        {#if fileType(file) === "video"}
                            <!-- svelte-ignore a11y-media-has-caption -->
                            <video src="/files/{file}" loop controls playsinline class="rounded-lg cursor-pointer mx-auto"></video>
                        {:else if fileType(file) === "image"}
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <img class="rounded-lg w-full cursor-pointer mx-auto" src="/files/{file}" alt="Post image" on:click={() => {showMediaFS(index);}}>
                        {/if}
                    {/each}
                </div>
            {/if}
            <div class="w-full flex flex-row justify-between items-center">
                <button on:click={() => {replieModal = true}} class="flex flex-row gap-1 items-center transition-all hover:text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 rounded-full">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    {post.replies.length}
                </button>
                {#if bookmarks}
                    <button on:click={() => {toggleBookmark(post.id)}} class="transition-all hover:text-green-600">
                        {#if bookmarks.filter(bookmark => bookmark.id == post.id).length === 1}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
                        {/if}
                    </button>
                {/if}
                {#if $page.data.user.username === post.username}
                    <button on:click={() => {deletePostModal = true;}} class="transition-all hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>                          
                    </button>
                {/if}
            </div>
        </div>
    </article>
    <div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {deletePostModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
        <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full">
            <div class="p-6 text-center">
                <svg class="mx-auto mb-4 text-neutral-100 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                <h3 class="mb-5">Are you sure you want to delete this post?</h3>
                <div class="flex flex-row justify-center gap-2">
                    <button type="button" class="button-secondary" on:click={() => {deletePostModal = false;}}>No, cancel</button>
                    <button type="button" class="button-primary" on:click={deletePost}>Yes, I'm sure</button>
                </div>
            </div>
        </div>
    </div>

    <div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {replieModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
        <div class="relative rounded-lg shadow bg-neutral-900 max-w-screen-md max-h-full w-full p-4 overflow-y-auto">
            <button type="button" on:click={() => {replieModal = false;}} class="absolute top-2.5 right-2.5 text-neutral-400 bg-transparent rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center hover:bg-neutral-800 hover:text-neutral-100 group">
                <svg class="w-3 h-3 group-hover:rotate-90 transition-all" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                <span class="sr-only">Close modal</span>
            </button>
            <h6>Replies to @{post.user.username}</h6>
            <div class="text-center mt-4">
                <textarea name="text" rows="6" class="block w-full p-2 rounded-t-lg text-sm border-0 bg-neutral-800 focus:ring-0 text-neutral-100 placeholder-neutral-400" placeholder="Write your replie..." bind:value={newReplieText}></textarea>
                <button type="submit" class="focus:outline-none text-neutral-100 bg-primary-600 hover:bg-primary-700 font-medium text-sm px-5 py-2.5 flex flex-row gap-2 items-center justify-center disabled:bg-primary-400 disabled:cursor-not-allowed shadow-primary-700 dark:shadow-primary-500 hover:shadow-lg hover:dark:shadow-sm transition-all rounded-b-lg w-full" on:click={publishReplie}>Publish replie</button>
            </div>
            {#if post.replies.length > 0}
                <div class="flex flex-col gap-2 mt-4">
                    {#each post.replies as replie, index}
                        <div class="{index === 0 ? "border-y" : "border-b"} border-border py-2 flex flex-col gap-2">
                            <div class="flex flex-row gap-2">
                                <a href="/u/{replie.user.username}">
                                    <img src="{replie.user.profilePicture}" alt="" class="h-10 w-10 rounded-full">
                                </a>
                                <div class="flex flex-col">
                                    <h5>{replie.user.displayName}</h5>
                                    <p class="text-xs">@{replie.user.username}</p>
                                </div>
                                <p class="ml-auto">
                                    {formatDate(post.date)}
                                </p>
                            </div>
                            <p>{replie.text}</p>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/if}

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="bg-neutral-800/50 fixed top-0 left-0 w-full h-full transition-all flex flex-col items-center justify-center {isFullScreen ? "opacity-100 z-50" : "opacity-0 -z-10"}" on:click={() => isFullScreen = false}>
    {#if mediaModalSrc.type === "image"}
        <img src="/files/{mediaModalSrc.src}" alt="" class="rounded-lg max-h-full max-w-full">
    {:else if mediaModalSrc.type === "video"}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video src="/files/{mediaModalSrc.src}" class="max-h-full max-w-full"></video>
    {/if}
</div>