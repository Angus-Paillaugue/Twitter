<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components";
    import { pageMetaData } from "$lib/stores"
    
    export let data;

    const { posts } = data;
    let bookmarks = data?.user?.bookmarks;
    let postsContainer;
    let childrenMap = [];

    onMount(() => {
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
    });

    $pageMetaData.title = "Search";
    $pageMetaData.description = "Search";
    $pageMetaData.currentPageName = "Search";
</script>

<main class="flex flex-col max-w-md w-full">
    {#if posts.length > 0}
        <div class="w-full flex flex-col h-full border-x border-border" bind:this={postsContainer}>
            {#each posts as post, index}
                <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
            {/each}
        </div>
    {/if}
</main>