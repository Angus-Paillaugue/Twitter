<script>
    import { Post } from '$lib/components';
    import { pageMetaData } from "$lib/stores"
    
    export let data;

    const { posts, usersAside } = data;

    let bookmarks = data?.user?.bookmarks;
    // let isDown = false;
    // let startX;
    // let scrollLeft;

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
    <!-- {#if usersAside.length > 0}
        <aside class="md:sticky md:top-0 md:h-full md:w-96 max-w-md md:flex-col gap-6 mx-auto mt-6 p-0 md:p-3 pb-4 md:overflow-y-auto md:overflow-x-hidden flex flex-row w-full overflow-x-auto will-change-transform cursor-pointer no-scrollbar"
        on:mousedown={(e) => {let slider = e.target.closest("aside");isDown = true;slider.classList.add('cursor-grab');startX = e.pageX - slider.offsetLeft;scrollLeft = slider.scrollLeft;}} 
        on:mouseleave={(e) => {isDown = false;e.target.closest("aside").classList.remove('cursor-grab');}} 
        on:mouseup={(e) => {isDown = false;e.target.closest("aside").classList.remove('cursor-grab');}} 
        on:mousemove={(e) => {let slider = e.target.closest("aside");if(!isDown) return;e.preventDefault();const x = e.pageX - slider.offsetLeft;const walk = (x - startX) * 2; slider.scrollLeft = scrollLeft - walk;}}>
            {#each usersAside as user}
                <a href="/u/{user.username}" class="userCard md:h-auto h-40 md:w-auto w-10/12 shrink-0" type="user">
                    <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80" style="aspect-ratio: 3/1;background-image: url('{user.banner}');" id="profileBanner">
                        <img id="profilePicture" alt="Profile picture" class="rounded-full h-16 w-16 absolute bottom-0 left-5 translate-y-3/4" src="{user.profilePicture}">
                    </div>
                    <div class="h-[48px] mb-2 pl-[104px]">
                        <p class="pr-2 text-lg leading-8 font-sans font-semibold">{user.username}</p>
                    </div>
                </a>
            {/each}
        </aside>
    {/if} -->
</main>