<script>
    import { deletePostModal, toasts } from "$lib/stores"
    import { Spinner } from 'flowbite-svelte';

    let isDeleting = false;

    async function deletePost() {
        isDeleting = true;
        const res = await fetch("/api/deletePost", { method:"POST", body:JSON.stringify({ id:$deletePostModal.id }) });
        const apiRes = await res.json();
        if(apiRes.error) $toasts = [ ...$toasts, { type:"error", message:apiRes.message }];
        isDeleting = false;
        $deletePostModal.display = false;
    }
</script>

{#if $deletePostModal.display}
    <div class="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center z-40">
        <div tabindex="-1" class="p-4 overflow-x-hidden overflow-y-auto h-[calc(100%-1rem)] max-h-full">
            <div class="relative w-full max-w-md max-h-full">
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"  on:click={() => {$deletePostModal.display=false}}>
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    <div class="p-6 text-center">
                        <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this product?</h3>
                        <div class="flex flex-row gap-2 justify-center">
                            <button type="button" class="button-border-gray">No, cancel</button>
    
                            <button type="button" class="button-primary" on:click={deletePost}>
                                {#if isDeleting}
                                    <Spinner size={4} />
                                {:else}
                                Yes, I'm sure
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}