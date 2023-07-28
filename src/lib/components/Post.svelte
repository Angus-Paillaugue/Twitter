<script>
    import { formatDate, parseMentions, fileType } from "$lib/helpers"
    import { toasts } from "$lib/stores"
    import { page } from "$app/stores"

    export let post;
    export let bookmarks;

    let isFullScreen = false;
    let isDeleted = false;
    let deletePostModal = false;

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
</script>

{#if !isDeleted}
    <div class="postCard">
        <div class="flex flex-row justify-between gap-2 w-full">
            <div class="flex flex-row gap-2">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <a href="/u/{post.user.username}"><img src="{post.user.profilePicture}" class="rounded-full h-10 w-10" alt="Profile picture"></a>
                <h3>{post.user.username}</h3>
            </div>
            <p>{formatDate(post.date)}</p>
        </div>
        <div class="w-full pl-12 flex flex-col gap-2">
            {#if post.text}
                <p class="leading-6">{@html post.text ? parseMentions(post.text.replaceAll("\n", "<br>")) : ""}</p>
            {/if}
            {#if post.file}
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="{isFullScreen ? "fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 z-50 flex flex-col justify-center items-center" : "w-full h-full"}" on:click={() => {isFullScreen = !isFullScreen;}}>
                    {#if fileType(post.file) == "image"}
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img class="rounded-lg {isFullScreen ? "w-auto h-auto max-h-full max-w-full" : "w-full cursor-pointer"} mx-auto" src="/files/{post.file}" alt="Post image">
                    {:else if fileType(post.file) == "video"}
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video src="/files/{post.file}" controls class="rounded-lg {isFullScreen ? "w-auto h-auto max-h-full max-w-full" : "w-full cursor-pointer"} mx-auto relative"></video>
                    {/if}
                </div>
            {/if}
            <div class="w-full flex flex-row justify-between items-center">
                {#if bookmarks}
                    <div class="flex flex-row justify-between w-full gap-4">
                        <button on:click={() => {toggleBookmark(post.id)}}>
                            {#if bookmarks.filter(bookmark => bookmark.id == post.id).length == 1}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
                            {/if}
                        </button>
                    </div>
                {/if}
                {#if $page.data.user.username == post.username}
                    <button on:click={() => {deletePostModal = true;}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>                          
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<div class="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 transition-opacity flex flex-col justify-center items-center {deletePostModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="p-6 text-center">
                <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this post?</h3>
                <div class="flex flex-row justify-center gap-2">
                    <button type="button" class="button-border-gray" on:click={() => {deletePostModal = false;}}>No, cancel</button>
                    <button type="button" class="button-primary" on:click={deletePost}>Yes, I'm sure</button>
                </div>
            </div>
        </div>
    </div>
</div>