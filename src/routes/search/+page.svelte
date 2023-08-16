<script>
    import { PostWrapper } from "$lib/components";
    import { pageMetaData } from "$lib/stores"
    
    export let data;

    const { posts } = data;

    let bookmarks = data?.user?.bookmarks;

    $pageMetaData.title = "Search";
    $pageMetaData.description = "Search";
    $pageMetaData.currentPageName = "Search";
</script>

<main class="flex flex-col max-w-md w-full">
    {#if posts.length > 0}
        <PostWrapper bookmarks={bookmarks} loadMorePosts={() => {return}} posts={posts} borderTop={true}/>
    {/if}
</main>