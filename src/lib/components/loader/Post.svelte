<script>
    export let borderTop = false;
</script>

<div class="postCard {borderTop ? "border-y" : "border-b"} border-border">
    <div class="flex flex-row justify-between items-center gap-2 w-full">
        <div class="flex flex-row gap-2 items-center">
            <svg class="w-12 h-12 text-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
            </svg>
            <div class="flex flex-col gap-2">
                <div class="h-2.5 rounded-full bg-neutral-700 w-52"></div>
                <div class="h-2 rounded-full bg-neutral-700 w-32"></div>
            </div>
        </div>
        <div class="h-1.5 rounded-full bg-neutral-700 w-8"></div>
    </div>
    <div class="w-full sm:pl-12 flex flex-col gap-2">
        <div role="status" class="space-y-2.5 animate-pulse max-w-lg">
            <div class="flex items-center w-full space-x-2">
                <div class="h-2.5 rounded-full bg-neutral-700 w-32"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-24"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
            </div>
            <div class="flex items-center w-full space-x-2 max-w-[480px]">
                <div class="h-2.5 rounded-full bg-neutral-700 w-full"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-24"></div>
            </div>
            <div class="flex items-center w-full space-x-2 max-w-[400px]">
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
                <div class="h-2.5 rounded-full bg-neutral-700 w-80"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
            </div>
            <div class="flex items-center w-full space-x-2 max-w-[480px]">
                <div class="h-2.5 rounded-full bg-neutral-700 w-full"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-24"></div>
            </div>
            <div class="flex items-center w-full space-x-2 max-w-[440px]">
                <div class="h-2.5 rounded-full bg-neutral-600 w-32"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-24"></div>
                <div class="h-2.5 rounded-full bg-neutral-700 w-full"></div>
            </div>
            <div class="flex items-center w-full space-x-2 max-w-[360px]">
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
                <div class="h-2.5 rounded-full bg-neutral-700 w-80"></div>
                <div class="h-2.5 rounded-full bg-neutral-600 w-full"></div>
            </div>
        </div>
        <div class="flex items-center justify-center w-full h-48 rounded bg-neutral-700">
            <svg class="w-10 h-10 text-neutral-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
            </svg>
        </div>
        <div class="w-full flex flex-row justify-between items-center">
            <button name="Replies" class="flex flex-row gap-1 items-center transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 rounded-full">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
            </button>
            <button name="addToBookmarks" class="transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>
            </button>
        </div>
    </div>
</div>