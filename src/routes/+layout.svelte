<script>
    import "../app.css";
    import { Navbar, PageLoader } from "$lib/components";
    import { Toast } from 'flowbite-svelte';
    import { toasts, searchBar, pageMetaData } from "$lib/stores";
    import { navigating } from '$app/stores';
    import { onMount } from "svelte";
    import { io } from "$lib/socket";
    import { page } from '$app/stores';
    // import { fade } from 'svelte/transition';

    export let data;

    let messagesNotification = null
    $: user = data.user;
    $: if($toasts.length > 5) {$toasts = $toasts.slice(0, 5)};

    onMount(() => {
        io.emit("register", user.username);
        if($page.route.id !== "/dashboard/conversations/[id]"){
            io.on("message", async(message) => {
                messagesNotification = message;
            });
        }
    });
</script>


<svelte:head>
    <title>{$pageMetaData.title} - X</title>
    <meta name="description" content="{$pageMetaData.description}">
</svelte:head>

{#if messagesNotification}
    <div class="fixed top-2 left-0 w-full flex flex-row roudnded-full items-center justify-center">
        <a href="/dashboard/conversations/{messagesNotification.conversation}" class="max-w-sm flex w-full flex-row items-center h-12 rounded-full p-2 bg-neutral-900 gap-2">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src="{messagesNotification.sender.profilePicture}" alt="Profile picture" class="h-full aspect-square rounded-full">
            <p>New message from @{messagesNotification.sender.username}</p>
        </a>
    </div>
{/if}

<main class="min-h-screen transition-all w-full {user && $page.route.id !== "/dashboard/conversations/[id]" && "max-sm:pb-14"} flex flex-col items-center {$searchBar && "pt-14"}">
    <div class="w-full max-w-screen-lg max-sm:justify-center h-full flex flex-row pr-4">
        <Navbar user={data?.user}/>

        <!-- {#key data.url}
            <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }} class="w-full">
        {/key} -->
        {#if $navigating}
            <PageLoader />
        {:else}
            <slot />
        {/if} 
    </div>
</main>

<div class="fixed top-2 right-2 flex flex-col gap-2 z-50">
    {#each $toasts.reverse() as toast}
        {#if toast.type == "error"}
            <Toast color="red" class="bg-neutral-800 border border-red-600/70 text-neutral-400">
                <svelte:fragment slot="icon">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                </svelte:fragment>
                {toast.message}
            </Toast>
        {:else if toast.type == "success"}
            <Toast color="green" class="bg-neutral-800 border border-green-600/70 text-neutral-400">
                <svelte:fragment slot="icon">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                </svelte:fragment>
                {toast.message}
            </Toast>
        {:else}
            <Toast color="gray" class="bg-neutral-800 border border-neutral-600/70 text-neutral-400">
                <svg slot="icon" aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path></svg>
                {toast.message}
            </Toast>
        {/if}
    {/each}
</div>