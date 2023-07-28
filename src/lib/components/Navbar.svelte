<script>
    import { Tooltip } from 'flowbite-svelte'
    import { searchBar } from "$lib/stores"
    import { goto } from "$app/navigation"
    import { fileType } from "$lib/helpers"

    export let user;

    let display;
    let searchInput;
    let query;
    let searchHint = [];

    $: display = user;

    $: if($searchBar && searchInput) searchInput.focus();

    $: getSearchHint(), query;

    async function getSearchHint() {
        if(query?.length > 0){
            const res = await fetch("/api/searchAutocomplete", { method:"POST", body:JSON.stringify({ q:query }) });
            const apiRes = await res.json();
            if(!apiRes.error) searchHint = apiRes.results;
        }else searchHint = [];
    }

    function highlightSearchedText(text) {
            const regexExp = new RegExp(query, "gi")
            return text.replaceAll(regexExp, function(match) {
                return `<b class="font-extrabold">${match}</b>`;
            });
        }
</script>

{#if display}
    <div class=" h-16 bg-white backdrop-blur border border-gray-200 rounded-full dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 dark:border-gray-600 grid max-w-lg grid-cols-3 mx-auto fixed z-30 w-full px-2 -translate-x-1/2 bottom-2 sm:bottom-4 left-1/2 shadow-lg">
        <a href="/" class="inline-flex flex-col items-center justify-center rounded-l-full px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-all duration-200 hover:bg-opacity-40 dark:hover:bg-opacity-40">
            <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            <span class="sr-only">Home</span>
        </a>
        <Tooltip>Home</Tooltip>
        <div class="flex items-center justify-center">
            <button type="button" on:click={() => {$searchBar = !$searchBar}} class="inline-flex items-center justify-center w-10 h-10 font-medium bg-primary-600 rounded-full hover:bg-primary-700 group focus:ring-4 focus:ring-primary-300 focus:outline-none dark:focus:ring-primary-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>                          
                <span class="sr-only">Search</span>
            </button>
        </div>
        <Tooltip>Search</Tooltip>
        <a href="/dashboard" class="inline-flex flex-col items-center justify-center px-5 rounded-r-full hover:bg-gray-50 dark:hover:bg-gray-800 group transition-all duration-200 hover:bg-opacity-40 dark:hover:bg-opacity-40">
            <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-all duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/></svg>
        </a>
        <Tooltip>Profile</Tooltip>
    </div>
{/if}


<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex flex-col gap-2 items-start transition-opacity {$searchBar ? "opacity-100 z-40" : "opacity-0 -z-10 "}" on:click={() => {$searchBar = false;}}>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <form action="/search" method="GET" class="w-full h-14 flex flex-row items-center transition-all {$searchBar ? "translate-y-0" : "-translate-y-full"}" on:click={(e) => {e.stopPropagation();}} on:submit= {() => {$searchBar = false; goto(`/search?q=${query}`)}}>
        <label for="q" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative w-full h-full">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input type="search" id="q" bind:value={query} name="q" class="block w-full p-4 pl-10 h-full text-sm text-gray-900 border border-gray-300 rounded-b-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" autocomplete="off" placeholder="Search posts or users" required bind:this={searchInput}>
            <button type="submit" class="absolute top-1/2 right-2.5 -translate-y-1/2 button-primary">Search</button>
        </div>
    </form>
    <div class="flex flex-col gap-2 w-full max-w-xl max-h-full overflow-y-auto transition-opacity mx-auto {searchHint.length > 0 ? "opacity-100" : "opacity-0"}" on:click={(e) => {e.stopPropagation();}} >
        {#each searchHint as hint}
            {#if hint.type == "user"}
                <a href="/u/{hint.username}" class="w-full overflow-hidden flex flex-col justify-start dark:bg-gray-700 rounded-lg bg-gray-50">
                    <div class="w-full relative bg-no-repeat bg-center bg-cover h-16 lg:h-24" style="background-image: url('{hint.banner}');">
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img src="{hint.profilePicture}" alt="Profile picture" class="rounded-full lg:h-20 lg:w-20 h-14 w-14 absolute bottom-0 left-5 translate-y-3/4 ring-4 ring-white">
                    </div>
                    <div class="h-16 lg:h-24 pl-24 lg:pl-28">
                        <div class="h-full flex items-start">
                            <h1 class="lg:text-4xl text-2xl font-semibold">{@html highlightSearchedText(hint.username)}</h1>
                        </div>
                    </div>
                </a>
            {:else}
                <a href="/post/{hint.id}" class="w-full overflow-hidden flex flex-row justify-start items-center dark:bg-gray-700 rounded-lg bg-gray-50">
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <img src="{hint.user.profilePicture}" alt="Profile picture" class="rounded-full lg:h-20 lg:w-20 h-14 w-14 ring-4 ring-white">
                    <Tooltip>{hint.username}</Tooltip>
                    {#if hint.file}
                        {#if fileType(hint.file) == "image"}
                            <img src="/files/{hint.file}" alt="" class="h-24">
                        {/if}
                    {/if}
                    <p class="line-clamp-3 text-ellipsis p-2">
                        {@html highlightSearchedText(hint.text)}
                    </p>
                </a>
            {/if}
        {/each}
    </div>
</div>