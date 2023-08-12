<script>
    import { Post } from '$lib/components';
    import { pageMetaData } from "$lib/stores"
    
    export let data;

    const { posts } = data;

    let bookmarks = data?.user?.bookmarks;

    $pageMetaData.title = "Search";
    $pageMetaData.description = "Search";
</script>

<main class="flex md:flex-row flex-col-reverse justify-between md:px-6 md:gap-6 px-2 gap-2 md:items-start items-center h-full">
    {#if posts.length > 0}
        <section class="w-full flex flex-col max-w-md mx-auto border-x border-border h-full">
            {#each posts as post, index}
                <Post post={post} bookmarks={bookmarks} borderTop={index === 0} />
            {/each}
        </section>
    {/if}
</main>