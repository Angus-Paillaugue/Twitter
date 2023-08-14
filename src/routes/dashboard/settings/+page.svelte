<script>
    import { Tooltip  } from 'flowbite-svelte';
    import { pageMetaData, toasts } from "$lib/stores";
    import { enhance } from '$app/forms';
    import { onMount } from "svelte";

    export let data;
    export let form;

    $: if(form) $toasts = [...$toasts, { type:form.err ? "error" : "success", message:form.msg }];

    const { user } = data;
    let deleteAccountModal = false;
    let tabIndex = 0;
    let sectionsList = [];
    let navLinkUnderline;
    let profilePicture = form?.profilePicture ?? user.profilePicture
    let banner = form?.banner ?? user.banner

    $: setActiveTab(), tabIndex;

    onMount(() => {
        sectionsList = document.querySelectorAll("section");

        setActiveTab();
        window.onresize = setActiveTab;
    });

    function setActiveTab() {
        for(let i = 0;i < sectionsList.length;i++){
            if(i !== tabIndex){
                sectionsList[i].style.display = "none";
            }else {
                sectionsList[i].style.display = "flex"
                let activeButton = document.querySelector("[data-section*="+sectionsList[i].id+"]");
                if(activeButton.getAttribute("data-section") === "Danger") navLinkUnderline.classList.add("bg-red-500"); else navLinkUnderline.classList.remove("bg-red-500")
                navLinkUnderline.style.left = activeButton.offsetLeft+"px";
                navLinkUnderline.style.width = activeButton.clientWidth+"px";
            }
        }
    }

    $pageMetaData.title = "Settings";
    $pageMetaData.description = "Settings";
    $pageMetaData.currentPageName = "Settings";
</script>

<div class="w-full">
    <div class="font-medium text-center text-neutral-400 flex flex-row justify-between relative">
        <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all {tabIndex === 0 ? "rounded-t-lg text-primary-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 0}} data-section="Profile">Profile</button>
        <button class="inline-flex items-center justify-center p-4 border-b-2 border-transparent group w-full transition-all {tabIndex === 1 ? "rounded-t-lg text-red-500" : "rounded-t-lg hover:border-neutral-700 hover:text-neutral-300"}" on:click={() => {tabIndex = 1}} data-section="Danger">Danger</button>
        <span bind:this={navLinkUnderline} class="h-1 transition-all bottom-0 bg-primary-600 absolute ease-in-out duration-300"></span>
    </div>
    <div class="w-full mt-4 p-4 bg-neutral-950 border border-border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <section class="w-full" id="Profile">
            <form use:enhance={(e) => {e.formData.set("profilePicture",profilePicture);e.formData.set("banner", banner);return ({ update }) => update({ reset: false });}} method="POST" action="?/save" class="flex flex-col gap-6 w-full">
                <div>
                    <label for="email" class="block mb-2">E-mail</label>
                    <input type="email" placeholder="E-mail" name="email" value="{form?.email ?? user.email}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all">
                </div>
                <div>
                    <label for="bio" class="block mb-2">Bio</label>
                    <textarea id="bio" name="bio" rows="4" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all" placeholder="Your bio...">{(form?.bio ?? user.bio).replaceAll("<br />", "\n")}</textarea>
                </div>
                <div>
                    <label for="username" class="block mb-2">
                        Username
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block ml-1 cursor-pointer"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                        <Tooltip class="text-center">You can <b>not</b> change your username<br>You should have thought twice</Tooltip>
                    </label>
                    <input type="text" placeholder="Username" name="username" readonly value="{user.username}" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all">
                </div>
                <div class="flex flex-col gap-2 text-neutral-300">
                    Profile picture
                    <label for="profilePicture" class="cursor-pointer group relative h-20 w-20 rounded-full overflow-hidden">
                        <img src="{profilePicture}" alt="" class="w-full h-full">
                        <input type="file" name="profilePicture" id="profilePicture" class="hidden" accept="image/*" on:change={(e) => {
                            const reader = new FileReader();
                            let file = e?.target?.files[0];
                            reader.addEventListener("load", () => {
                                profilePicture = reader.result;
                            },false,);
                            if (file) reader.readAsDataURL(file);
                        }}>
                        <div class="hover:bg-neutral-900/50 group-hover:opacity-100 opacity-0 transition-all z-10 absolute inset-0 flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </div>
                    </label>
                </div>
                <div class="flex flex-col gap-2 text-neutral-300">
                    Banner
                    <label for="banner" class="cursor-pointer group relative">
                        <img src="{banner}" alt="" class="aspect-[3/1] w-full">
                        <input type="file" name="banner" id="banner" class="hidden" accept="image/*" on:change={(e) => {
                            const reader = new FileReader();
                            let file = e?.target?.files[0];
                            reader.addEventListener("load", () => {
                                banner = reader.result;
                            },false,);
                            if (file) reader.readAsDataURL(file);
                        }}>
                        <div class="hover:bg-neutral-900/50 group-hover:opacity-100 opacity-0 transition-all z-10 absolute inset-0 flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </div>
                    </label>
                </div>
                <button class="button-primary w-full" type="submit">
                    Save
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray: 100;animation: dash 2s;" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                    </svg>
                </button>
            </form>
            {#if form?.err}
                <div class="mt-2 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert"><strong>Error : </strong>{form?.msg ?? "An error occurred"}</div>
            {/if}
        </section>
        <section class="w-full p-0" id="Danger">
            <div class="flex flex-col gap-6 w-full">
                <button class="button-danger w-full" type="button" on:click={() => {deleteAccountModal = !deleteAccountModal}}>
                    Delete account 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path style="stroke-dasharray: 100;animation: dash 2s;" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                </button>
            </div>
        </section>
    </div>
</div>

<div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {deleteAccountModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full">
        <form use:enhance action="?/deleteAccount" method="POST" class="p-6 text-center">
            <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete your account?</h3>
            <div class="flex flex-row justify-center gap-2">
                <button type="button" class="button-secondary" on:click={() => {deleteAccountModal = false;}}>No, cancel</button>
                <button class="button-primary" type="submit">Yes, I'm sure</button>
            </div>
        </form>
    </div>
</div>