<script>
    import { onMount } from "svelte";
    import { Post } from "$lib/components";
    import { pageMetaData } from "$lib/stores";
    import { fade } from 'svelte/transition';
    import { formatNumber, fileType } from "$lib/helpers";

    export let data;

    const { profile, user } = data;
    const gcpBucketBaseUrl = "https://storage.googleapis.com/hellkeeperbucket/";
    let bookmarks = user?.bookmarks ?? [];
    let posts = data.posts;
    let subscriptions = user?.subscriptions ?? [];
    let mediaModalSrc = {type:"", src:""};
    let fullBio = false;
    let isFullScreen = false;
    let morePostsLoading = false;
    let isMorePostsToLoad = true;
    // let childrenMap = [];
    let sectionsList = [];
    let offset = 0;
    let tabIndex = 0;
    let bioP;
    let postsContainer;
    let navLinkUnderline;
    let fullScreenModalVideoEl;
    let scrollTop = 0;
    let scaleDownProfilePicture = false
    $: isSubscribed = subscriptions.filter(el => el.username == profile.username).length > 0;
    $: offset = posts.length;
    $: if(fullBio){bioP.style.maxHeight = bioP.scrollHeight+24+"px";}else if(bioP){bioP.style.maxHeight = "24px";}
    $: offset = posts.length;
    $: setActiveTab(), tabIndex;
    $: {
        if(isFullScreen){
            if(mediaModalSrc.type === "video"){setTimeout(()=>{fullScreenModalVideoEl.play()},0)}
        }else {
            if(mediaModalSrc.type === "video"){fullScreenModalVideoEl.pause()}
        }
    }

    onMount(() => {
        sectionsList = document.querySelectorAll("section");
        scaleDownProfilePicture = document.body.scrollTop > 180 || document.documentElement.scrollTop > 180;

        setActiveTab();
        window.onresize = setActiveTab;
        // for(const el of postsContainer.children){
        //     if(el.nodeName === "ARTICLE") childrenMap = [...childrenMap, { el, top:el.offsetTop, height:el.clientHeight }];
        // }
        window.addEventListener("scroll", () => {
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            // When the user is [modifier]px from the bottom, fire the event.
            let modifier = 500; 
            if(currentScroll + modifier > documentHeight) loadPosts();

            scaleDownProfilePicture = document.body.scrollTop > 180 || document.documentElement.scrollTop > 180;

            // let bottomTrigger = window.scrollY + window.innerHeight/2;
            // let isVideoPlaying = false;
            // for(const post of childrenMap){
            //     if((post.top + post.height) > bottomTrigger){
            //         if(post.el.querySelector("video")){
            //             if(!isVideoPlaying){
            //                 post.el.querySelector("video").play();
            //                 isVideoPlaying = true;
            //                 continue;
            //             }
            //         }
            //     }else if(post.el.querySelector("video")){
            //         post.el.querySelector("video").pause();
            //     }
            // }
        });
    });

    function setActiveTab() {
        for(let i = 0;i < sectionsList.length;i++){
            if(i !== tabIndex){
                sectionsList[i].style.display = "none";
            }else {
                sectionsList[i].style.display = "";
                let activeButton = document.querySelector("[data-section*='"+sectionsList[i].id+"']");
                if(navLinkUnderline && activeButton){
                    navLinkUnderline.style.left = activeButton.offsetLeft +"px";
                    navLinkUnderline.style.width = activeButton.clientWidth +"px";
                }
            }
        }
    }
    
    async function loadPosts() {
        if(isMorePostsToLoad && !morePostsLoading && user){
            morePostsLoading = true;
            const res = await fetch(`/api/getUserPosts/${profile.username}?offset=${offset}`, { method:"GET" });
            const apiRes = await res.json();
            if(!apiRes.error || !apiRes.message){
                posts = [...posts, ...apiRes.posts];
                isMorePostsToLoad = apiRes.morePosts;
            }else newToast("error", apiRes.message);
            morePostsLoading = false;
        }
    }
    
    async function toggleSubscription(username) {
        const res = await fetch("/api/toggleSubscription", { method:"POST", body:JSON.stringify({ username }) });
        const apiRes = await res.json();
        if(apiRes?.subscriptions?.filter(el => el.username === profile.username)?.length >= 1) profile.noFollowers += 1; else profile.noFollowers -= 1;
        if(!apiRes.error) subscriptions = apiRes.subscriptions; else newToast("error", apiRes.message);
    }

    const showMediaFS = (type, src) => {
        mediaModalSrc.type = type;
        mediaModalSrc.src = src;
        isFullScreen = true;
    }

    $pageMetaData.title = `${profile.username}'s profile.`;
    $pageMetaData.description = `${profile.username}'s profile.`;
    $pageMetaData.currentPageName = "Profile";
</script>

<main class="w-full">
    <div class="w-full relative bg-no-repeat bg-center bg-cover max-h-64 lg:max-h-80 -z-10" style="height: 25vw; background-image: url('{profile.banner}');"></div>
    <div class="lg:h-[108px] md:h-[70px] mb-2 flex flex-col sm:flex-row items-start gap-2 lg:p-4 p-2 max-sm:-mt-10 transition-all sm:pl-0">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <div class="rounded-full transition-all {scaleDownProfilePicture ? "lg:h-24 lg:w-24 md:h-20 md:w-20 w-14 h-14" : "lg:h-36 lg:w-36 md:h-24 md:w-24 w-16 h-16"} bottom-0 ring-4 ring-neutral-800 sm:-translate-y-1/3 bg-center bg-cover" style="background-image: url({profile.profilePicture});">
        </div>
            
        <div>
            <h2 class="max-md:text-lg">
                {profile.displayName}
                {#if profile.certified}
                    <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>
                {/if}
            </h2>
            <p class="text-sm">@{profile.username}</p>
        </div>
        {#if user && user.username !== profile.username}
            <button class="button-primary ml-auto" on:click={() => {toggleSubscription(profile.username)}}>
                {#if isSubscribed}
                    Followed
                    <svg in:fade xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" class="transition-all" style="stroke-dasharray: 100;animation: dash 4s;" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                {:else}
                    Follow
                {/if}
            </button>
        {/if}
    </div>

    <p class="px-2 text-xs mb-2"><b>{formatNumber(profile.noFollowers)}</b> {profile.noFollowers <= 1 ? "follower" : "followers"}</p>

    <p bind:this={bioP} class="w-full transition-all overflow-hidden relative px-2 duration-500 {fullBio && "py-4"}" style="max-height: 24px;">
        {@html profile.bio}
    </p>
    {#if profile.bio.includes("<br />")}
        <button class="ml-2 mb-2 link" on:click={() => {fullBio = !fullBio}}>
            Show {fullBio ? "less" : "more"}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block transition-all duration-500 {!fullBio && "rotate-180"}"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
        </button>
    {/if}
    
    
    <div class="flex flex-col w-full mt-4 border border-border">
        <div class="font-medium text-center text-neutral-400 flex flex-row justify-between relative">
            <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all no-scale {tabIndex === 0 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 0}} data-section="Posts">Posts</button>
            <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all no-scale {tabIndex === 1 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 1}} data-section="Videos">Videos</button>
            <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all no-scale {tabIndex === 2 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 2}} data-section="Photos">Photos</button>
            <span bind:this={navLinkUnderline} class="h-1 transition-all bottom-0 bg-primary-600 absolute ease-in-out duration-300"></span>
        </div>
        <section class="w-full flex flex-col h-full" id="Posts" bind:this={postsContainer}>
            {#each posts as post}
                <Post post={post} bookmarks={bookmarks} borderTop={false} />
            {/each}
        </section>
        <section class="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2 h-full" id="Videos" bind:this={postsContainer}>
            {#each posts as post}
                {#if post.file}
                    {#each post.file as file}
                        {#if fileType(file) === "video"}
                            <!-- svelte-ignore a11y-media-has-caption -->
                            <video src={gcpBucketBaseUrl+file} class="rounded-lg cursor-pointer mx-auto" on:click={(e) => {showMediaFS("video", e.target.src);}}></video>
                        {/if}
                    {/each}
                {/if}
            {/each}
        </section>
        <section class="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2 h-full" id="Photos" bind:this={postsContainer}>
            {#each posts as post}
                {#if post.file}
                    {#each post.file as file}
                        {#if fileType(file) === "image"}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <img class="rounded-lg w-full cursor-pointer mx-auto" src={gcpBucketBaseUrl+file} alt="Post image" on:click={(e) => {showMediaFS("image", e.target.src);}}>
                        {/if}
                    {/each}
                {/if}
            {/each}
        </section>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="bg-neutral-800/50 fixed top-0 left-0 w-full h-full transition-all flex flex-col items-center justify-center {isFullScreen ? "opacity-100 z-50" : "opacity-0 -z-10"}" on:click={() => isFullScreen = false}>
        <img src={mediaModalSrc.src} alt="" class="rounded-lg max-h-full max-w-full {mediaModalSrc.type !== "image" && "hidden"}">
            <!-- svelte-ignore a11y-media-has-caption -->
        <video src={mediaModalSrc.src} playsinline loop controls bind:this={fullScreenModalVideoEl} class="max-h-full max-w-full {mediaModalSrc.type !== "video" && "hidden"}"></video>
    </div>
</main>