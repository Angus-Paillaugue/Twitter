<script>
    import { formatDate, parseMentions, fileType, parseLink, formatNumber } from "$lib/helpers";
    import { newToast } from "$lib/stores";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    // ! Change this if needed
    const gcpBucketBaseUrl = "https://storage.googleapis.com/hellkeeperbucket/";

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
    let isDeletingPost = false;
    let repostModal = false;
    let deleteReplieModal = false;
    let deleteReplieId = null;
    let postText;
    let newReplieText;
    
    $: if(readMoreToggle){postText.style.maxHeight = postText.scrollHeight+24+"px";}else if(postText){postText.style.maxHeight = 14*24+"px";}
    $: if(postText?.clientHeight >= 14*24){isReadMore = true;}

    async function toggleBookmark() {
        const res = await fetch("/api/toggleBookmark", { method:"POST", body:JSON.stringify({ id:post.id }) });
        const apiRes = await res.json();
        if(!apiRes.error) bookmarks = apiRes.bookmarks; else newToast("error", apiRes.message)
        if($page.route.id.includes("bookmarks") && bookmarks.filter(bookmark => bookmark.id == post.id).length == 0) isDeleted = true;
    }

    async function deletePost() {
        isDeletingPost = true;
        const res = await fetch("/api/deletePost", { method:"POST", body:JSON.stringify({ id:post.id }) });
        const apiRes = await res.json();
        if(!apiRes.error) {
            isDeleted = true;
            deletePostModal = false;
        }else {
            newToast("error", apiRes.message)
        }
        isDeletingPost = false;
    }

    const showMediaFS = (index) => {
        mediaModalSrc.type = fileType(post.file[index]);
        mediaModalSrc.src = post.file[index];
        isFullScreen = true;
    }

    async function publishReplie() {
        const res = await fetch("/api/newReplie", { method:"POST", body:JSON.stringify({ text:newReplieText, id:post.id}) });
        const data = await res.json();
        post.replies = [...post.replies, data.replie];
        newReplieText = "";
    }

    async function repost() {
        const res = await fetch("/api/repost", { method:"POST", body:JSON.stringify({ id:post.id }) })
        const data = await res.json();
        if(!data.error) goto(`/post/${data.id}`);
    }

    async function deleteReplie() {
        const res = await fetch("/api/deleteReplie", { method:"POST", body:JSON.stringify({ id:deleteReplieId, postId:post.id }) });
        const data = await res.json();
        if(!data.error){
            deleteReplieModal = false;
            post.replies = post.replies.filter(replie => replie.id !== deleteReplieId);
        }
    }
</script>

{#if !isDeleted && post?.user}
    <article class="postCard {borderTop ? "border-y" : "border-b"}">
        {#if post?.repostedBy}
            <p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-3.5 h-3.5 inline-block" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/></svg>
                {post.repostedBy.username} reposted
            </p>
        {/if}
        <div class="flex flex-row justify-between items-center gap-2 w-full">
            <div class="flex flex-row gap-2 items-center">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <a href="/u/{post.user.username}" class="bg-center bg-cover rounded-full h-12 w-12" style="background-image: url({post.user.profilePicture});">
                </a>
                <div class="flex flex-col">
                    <h5>
                        {post.user.displayName}
                        {#if post.user.certified}
                            <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>
                        {/if}
                    </h5>
                    <p class="text-xs">@{post.user.username}</p>
                </div>
            </div>
            <p class="text-xs">{formatDate(post.date)}</p>
        </div>
        <div class="w-full sm:pl-12 flex flex-col gap-2">
            {#if post.text}
                <p class="leading-6 overflow-hidden transition-all duration-500 {readMoreToggle && "py-4"}" style="max-height: {14*24}px;" bind:this={postText}>{@html parseMentions(parseLink(post.text.replaceAll("\n", "<br>")))}</p>
                {#if isReadMore}
                    <button class="link w-fit" name="read-{readMoreToggle ? "less" : "more"}" on:click={() => {readMoreToggle = !readMoreToggle}}>
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
                            <video src={gcpBucketBaseUrl+file} loop controls playsinline class="rounded-lg cursor-pointer mx-auto"></video>
                        {:else if fileType(file) === "image"}
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <img class="rounded-lg w-full cursor-pointer mx-auto" src={gcpBucketBaseUrl+file} alt="Post image" on:click={() => {showMediaFS(index);}}>
                        {/if}
                    {/each}
                </div>
            {/if}
            <div class="w-full flex flex-row justify-between items-center">
                <button on:click={() => {replieModal = true}} name="Replies" class="flex flex-row gap-1 items-center transition-all hover:text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 rounded-full">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    {formatNumber(post.replies.length)}
                </button>
                <button on:click={() => {repostModal = true}} class="transition-all hover:text-green-600" name="Repost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/></svg>
                </button>
                {#if bookmarks}
                    <button on:click={() => {toggleBookmark(post.id)}} name="addToBookmarks" class="transition-all hover:text-yellow-600">
                        {#if bookmarks.filter(bookmark => bookmark.id == post.id).length === 1}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
                        {/if}
                    </button>
                {/if}
                {#if ($page.data?.user?.username ?? "") === post.username}
                    <button on:click={() => {deletePostModal = true;}} name="deletePost" class="transition-all hover:text-red-600">
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
                    <button type="button" class="button-primary" on:click={deletePost}>
                        {#if isDeletingPost}
                            <div role="status">
                                <svg aria-hidden="true" class="inline w-4 h-4 mr-2 animate-spin text-neutral-900 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span class="sr-only">Loading...</span>
                            </div>
                        {:else}
                            Yes, I'm sure
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {repostModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
        <div class="relative rounded-lg shadow bg-neutral-900 max-w-screen-sm max-h-full w-full p-4 overflow-y-auto">
            <h4>Repost</h4>
            <p class="my-4">Do you want to repost this publication by <b>@{post.user.username}</b></p>
            <div class="flex md:flex-row flex-col gap-2 w-full">
                <button class="button-secondary grow" on:click={() => {repostModal = false}}>No, cancel</button>
                <button class="button-primary grow" on:click={repost}>Yes, repost</button>
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
                <button type="submit" class="focus:outline-none text-neutral-100 bg-primary-600 hover:bg-primary-700 font-medium text-sm px-5 py-2.5 flex flex-row gap-2 items-center justify-center disabled:bg-primary-400 disabled:cursor-not-allowed shadow-primary-500 hover:shadow-sm transition-all rounded-b-lg w-full no-scale" on:click={publishReplie}>Publish replie</button>
            </div>
            {#if post.replies.length > 0}
                <ol class="relative border-l border-neutral-700 mt-4">
                    {#each post.replies as replie, index}
                        <li class="{index !== post.replies.length-1 && "mb-10"} ml-4">
                            <div class="absolute w-3 h-3 rounded-full mt-1.5 -left-1.5 bg-neutral-700"></div>
                            <div class="flex flex-row gap-2 relative">
                                <a href="/u/{replie.user.username}">
                                    <!-- svelte-ignore a11y-img-redundant-alt -->
                                    <img src="{replie.user.profilePicture}" alt="Profile picture" class="h-10 w-10 rounded-full">
                                </a>
                                <div class="flex flex-col">
                                    <h5>{replie.user.displayName}</h5>
                                    <p class="text-xs">@{replie.user.username}</p>
                                </div>
                                <small class="ml-auto">
                                    {formatDate(replie.date)}
                                </small>
                                {#if ($page.data?.user?.username ?? "") === replie.username}
                                    <button class="absolute top-10 right-2 hover:text-red-600 transition-all" on:click={() => {deleteReplieModal = true; deleteReplieId = replie.id;}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    </button>
                                {/if}
                            </div>
                            <p>{@html replie.text.replace("\n", "<br />")}</p>
                        </li>
                    {/each}
                </ol>
            {/if}
        </div>
    </div>

    <div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {deleteReplieModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
        <div class="relative rounded-lg shadow bg-neutral-900 max-w-screen-sm max-h-full w-full p-4 overflow-y-auto">
            <h4>Delete replie</h4>
            <p class="my-4">Are you sure you want to delete this replie ?<br>This operation is irreversible!</p>
            <div class="flex md:flex-row flex-col gap-2 w-full">
                <button class="button-secondary grow" on:click={() => {deleteReplieModal = false}}>No, cancel</button>
                <button class="button-primary grow" on:click={deleteReplie}>Yes, delete</button>
            </div>
        </div>
    </div>


    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="bg-neutral-800/50 fixed top-0 left-0 w-full h-full transition-all flex flex-col items-center justify-center {isFullScreen ? "opacity-100 z-50" : "opacity-0 -z-10"}" on:click={() => isFullScreen = false}>
        {#if mediaModalSrc.type === "image"}
            <img src={gcpBucketBaseUrl+mediaModalSrc.src} alt="" class="rounded-lg max-h-full max-w-full">
        {:else if mediaModalSrc.type === "video"}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video src={gcpBucketBaseUrl+mediaModalSrc.src} class="max-h-full max-w-full"></video>
        {/if}
    </div>
{/if}
