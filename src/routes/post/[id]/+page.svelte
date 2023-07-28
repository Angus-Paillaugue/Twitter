<script>
    import { Post } from "$lib/components";
    import { pageMetaData } from "$lib/stores"

    export let data;

    const { post, user } = data;
    let bookmarks = user?.bookmarks;

    $pageMetaData.title = `${post.username}'s post'`;
    $pageMetaData.description = `${post.username}'s post'`;
    $pageMetaData.headerText = `${post.username}'s post'`;
</script>

<section class="w-full flex flex-col max-w-md md:gap-6 gap-2 mx-auto md:my-6 my-2 h-full">
    <Post post={post} bookmarks={bookmarks} />
</section>