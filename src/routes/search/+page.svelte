<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components";
    import { pageMetaData } from "$lib/stores"
    
    export let data;

    const { results } = data;
    let bookmarks = data?.user?.bookmarks;
    let postsContainer;
    let childrenMap = [];

    onMount(() => {
        if(results.length > 0) {
            for(const el of postsContainer.children){
                if(el.nodeName === "ARTICLE") childrenMap = [...childrenMap, { el, top:el.offsetTop, height:el.clientHeight }];
            }
            window.addEventListener("scroll", () => {
                let bottomTrigger = window.scrollY + window.innerHeight/2;
                let isVideoPlaying = false;
                for(const post of childrenMap){
                    if((post.top + post.height) > bottomTrigger && post.el.querySelector("video") && !isVideoPlaying){
                        post.el.querySelector("video").play();
                        isVideoPlaying = true;
                        continue;
                    }else if(post.el.querySelector("video")){
                        post.el.querySelector("video").pause();
                    }
                }
            });
        }
    });

    $pageMetaData.title = "Search";
    $pageMetaData.description = "Search";
    $pageMetaData.currentPageName = "Search";
</script>

<main class="flex flex-col max-w-md w-full">
    {#if results.length > 0}
        <div class="w-full flex flex-col h-full border-x border-border" bind:this={postsContainer}>
            {#each results as post, index}
                {#if post.type === "user"}
                    <a href="/u/{post.username}" class="w-full overflow-hidden flex flex-col justify-start {index === 0 ? "border-y" : "border-b"} border-border bg-neutral-900">
                        <div class="w-full relative bg-no-repeat bg-center bg-cover h-16 lg:h-24" style="background-image: url('{post.banner}');">
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <img src="{post.profilePicture}" alt="Profile picture" class="rounded-full lg:h-20 lg:w-20 h-14 w-14 absolute bottom-0 left-5 translate-y-3/4 ring-4 ring-neutral-800">
                        </div>
                        <div class="h-20 pl-24 lg:pl-28 flex items-start flex-col">
                            <h4>{post.displayName}</h4>
                            <p class="text-xs">@{post.username}</p>
                        </div>
                    </a>
                {:else}
                    <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
                {/if}
            {/each}
        </div>
    {/if}
</main>