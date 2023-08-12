<script>
    import { page } from '$app/stores';
    import { pageMetaData } from "$lib/stores"

    $pageMetaData.title = `${$page.status || "404"} Error`;
    $pageMetaData.description = "Error";
    $pageMetaData.currentPageName = "Error";
</script>

<div class="max-w-lg mx-auto mt-10 w-full flex flex-col items-center">
    <h1 class="mb-6 text-7xl tracking-tight font-extrabold lg:text-9xl">{$page.status || "404"}</h1>
    <p class="mb-6 text-2xl tracking-tight font-bold">{$page.error.message || "Page not found"}</p> 

    <a href="{$page.error.link || "/"}" class="mx-auto button-primary w-fit group">
        {$page.error.buttonText || "Back to Homepage"} 
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 transition-all delay-150 duration-200 group-hover:rotate-[-360deg]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
    </a>
</div>