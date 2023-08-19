<script>
    import { navigating } from '$app/stores';
    import Post from './Post.svelte';

    $: path = $navigating?.to?.route?.id;
</script>

<main class="h-screen overflow-y-hidden w-full">
    {#if path === "/" || path.startsWith("/search")}
        <section class="flex md:flex-row flex-col-reverse justify-between md:items-start items-center h-full w-full max-w-md">
            <div class="w-full flex flex-col h-full border-x border-border">
                {#each {length : 10} as _, index}
                    <Post borderTop={index === 0} />
                {/each}
            </div>
        </section>
    {:else if path ==="/dashboard"}
        <section class="w-full animate-pulse">
            <div class="flex flex-row gap-2 items-center mt-4">
                <svg class="w-14 h-14 text-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                </svg>
                <div class="flex flex-col gap-2">
                    <div class="h-3 rounded-full bg-neutral-700 w-52"></div>
                    <div class="h-2.5 rounded-full bg-neutral-700 w-32"></div>
                </div>
            </div>
            <hr>
            <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
                <div class="card-button">
                    <div class="w-6 h-6 rounded-full bg-neutral-700"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-24"></div>
                </div>
        
                <div class="card-button">
                    <div class="w-6 h-6 rounded-full bg-neutral-700"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-24"></div>
                </div>
        
                <div class="card-button">
                    <div class="w-6 h-6 rounded-full bg-neutral-700"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-24"></div>
                </div>
        
                <div class="card-button">
                    <div class="w-6 h-6 rounded-full bg-neutral-700"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-24"></div>
                </div>
        
                <div class="card-button">
                    <div class="w-6 h-6 rounded-full bg-neutral-700"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-24"></div>
                </div>
            </div>
        
            <section class="flex flex-col w-full mt-4 border-t border-border">
                <div class="w-full flex flex-col max-w-lg mx-auto h-full border-x border-border">
                    {#each { length : 4} as _, index}
                        <Post borderTop={index === 0} />
                    {/each}
                </div>
            </section>
        </section>
    {:else if path === "/dashboard/bookmarks"}
        <section class="w-full animate-pulse">
            <div class="w-full font-medium text-center text-neutral-400 flex flex-row justify-between sticky top-0 bg-neutral-900">
                <div class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all rounded-t-lg text-neutral-700">
                    <div class="h-4 mr-2 rounded-full bg-neutral-700 w-4"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-16"></div>
                </div>
                <div class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all rounded-t-lg text-neutral-700">
                    <div class="h-4 mr-2 rounded-full bg-neutral-700 w-4"></div>
                    <div class="h-3 rounded-full bg-neutral-700 w-16"></div>
                </div>
            </div>
            <section class="flex flex-col w-full max-w-md mx-auto">
                <div class="w-full flex flex-col h-full border-x border-border">
                    {#each { length : 4} as _, index}
                        <Post borderTop={index === 0} />
                    {/each}
                </div>
            </section>
        </section>
    {:else if path === "/dashboard/settings"}
        <section class="w-full animate-pulse">
            <div class="w-full text-center flex flex-row justify-between">
                <div class="inline-flex items-center justify-center p-4 border-b-2 border-transparent w-full">
                    <div class="h-3 rounded-full bg-neutral-700 w-16"></div>
                </div>
                <div class="inline-flex items-center justify-center p-4 border-b-2 border-transparent w-full">
                    <div class="h-3 rounded-full bg-neutral-700 w-16"></div>
                </div>
            </div>
            <div class="flex flex-col gap-6 w-full mt-4 p-4 bg-neutral-950 border border-border rounded-lg">
                <div>
                    <div class="w-28 mb-2 h-4 rounded-full bg-neutral-700"></div>
                    <div class="w-full h-8 rounded-lg bg-neutral-700"></div>
                </div>
                <div>
                    <div class="w-28 mb-2 h-4 rounded-full bg-neutral-700"></div>
                    <div class="w-full h-32 rounded-lg bg-neutral-700"></div>
                </div>
                <div>
                    <div class="w-28 mb-2 h-4 rounded-full bg-neutral-700"></div>
                    <div class="w-full h-8 rounded-lg bg-neutral-700"></div>
                </div>
                <div>
                    <div class="w-28 mb-2 h-4 rounded-full bg-neutral-700"></div>
                    <div class="w-full h-8 rounded-lg bg-neutral-700"></div>
                </div>
                <svg class="w-14 h-14 text-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                </svg>

                <div class="flex items-center justify-center aspect-[3/1] w-full rounded bg-neutral-700">
                    <svg class="w-10 h-10 text-neutral-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                    </svg>
                </div>

                <div class="w-full mb-2 h-12 rounded-3xl bg-neutral-700"></div>
            </div>
        </section>
    {:else if path === "/dashboard/conversations"}
        <section class="w-full p-2 animate-pulse">
            <div class="w-full mb-2 h-12 rounded-3xl bg-neutral-700"></div>
            <div class="mt-6 flex flex-col gap-4">
                {#each { length : 4} as _}
                    <div class="flex flex-row items-center gap-2 w-full transition-all hover:bg-neutral-800 rounded p-2 relative">
                        <svg class="w-12 h-12 text-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                        </svg>
                        <div class="flex flex-col gap-1">
                            <div class="flex flex-col gap-2">
                                <div class="h-3 rounded-full bg-neutral-700 w-32"></div>
                                <div class="h-2 rounded-full bg-neutral-700 w-52"></div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    {:else if path.startsWith("/dashboard/conversations/")}
        <section class="w-full p-2 animate-pulse h-full flex flex-col">
            <header class="p-4 pb-0 flex flex-row gap-2 items-center">
                <svg class="w-8 h-8 text-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                </svg>
                <div class="h-3 rounded-full bg-neutral-700 w-32"></div>
                <div class="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                </div>
            </header>
            <div class="mt-auto w-full flex gap-2 flex-row">
                <div class="h-10 rounded-lg bg-neutral-700 w-10"></div>
                <div class="h-10 rounded-lg bg-neutral-700 grow"></div>
                <div class="h-10 rounded-lg bg-neutral-700 w-10"></div>
            </div>
        </section>
    {/if}
    
</main>
