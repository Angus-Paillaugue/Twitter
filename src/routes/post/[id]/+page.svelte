<script>
    import { Post } from "$lib/components";
    import { pageMetaData } from "$lib/stores"

    export let data;

    const { post, user } = data;
    let bookmarks = user?.bookmarks;

    $pageMetaData.title = `${post.username}'s post`;
    $pageMetaData.description = `${post.username}'s post`;
    $pageMetaData.currentPageName = "Post";
</script>

<section class="flex flex-col max-w-lg w-full border border-b-0 border-border h-full">
    <Post post={post} bookmarks={bookmarks} />
</section>