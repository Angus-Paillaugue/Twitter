<script>
    import { Post } from '$lib/components';
    import { pageMetaData } from "$lib/stores"
    
    export let data;

    const { posts } = data;

    let bookmarks = data?.user?.bookmarks;

    $pageMetaData.title = "Search";
    $pageMetaData.description = "Search";
    $pageMetaData.currentPageName = "Search";
</script>

<main class="flex flex-col">
    {#if posts.length > 0}
        <section class="w-full flex flex-col max-w-lg mx-auto border-x border-border h-full">
            {#each posts as post, index}
                <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
            {/each}
        </section>
    {/if}
</main>