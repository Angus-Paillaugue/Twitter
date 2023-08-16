<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components";

    export let bookmarks 
    export let posts
    export let loadMorePosts;
    export let borderTop = true;

    let childrenMap = [];
    let postsContainer;

    onMount(() => {
        for(const el of postsContainer.children){
            if(el.nodeName === "ARTICLE") childrenMap = [...childrenMap, { el, top:el.offsetTop, height:el.clientHeight }];
        }
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            // When the user is [modifier]px from the bottom, fire the event.
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadMorePosts();

            let bottomTrigger = window.scrollY + window.innerHeight/2;
            let isVideoPlaying = false;
            for(const post of childrenMap){
                if((post.top + post.height) > bottomTrigger){
                    if(post.el.querySelector("video")){
                        if(!isVideoPlaying){
                            post.el.querySelector("video").play();
                            isVideoPlaying = true;
                            continue;
                        }
                    }
                }else if(post.el.querySelector("video")){
                    post.el.querySelector("video").pause();
                }
            }
        });
    });
</script>

<div class="w-full flex flex-col h-full border-x border-border" bind:this={postsContainer}>
    {#each posts as post, index}
        <Post post={post} bookmarks={bookmarks} borderTop={borderTop && index === 0} />
    {/each}
</div>