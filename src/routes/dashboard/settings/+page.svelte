<script>
    import { Tabs, TabItem, Tooltip  } from 'flowbite-svelte';
    import { pageMetaData } from "$lib/stores"
    import { enhance } from '$app/forms'

    export let data;
    export let form;

    const { user } = data;
    let deleteAccountModal = false;

    $pageMetaData.title = "Settings";
    $pageMetaData.description = "Settings";
</script>

<div class="max-w-md mx-auto w-full mt-10">
    <h1 class="text-5xl font-semibold">Settings</h1>
    <div class="w-full mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 flex flex-col gap-6">
        <Tabs style="full" defaultClass="flex rounded-lg divide-x divide-gray-200 shadow dark:divide-gray-700 w-full">
            <TabItem class="w-full" open>
                <span slot="title">Profile</span>
                <form use:enhance={() => {return ({ update }) => update({ reset: false });}} method="POST" action="?/save" class="flex flex-col gap-6">
                    <div>
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">E-mail</label>
                        <input type="email" placeholder="E-mail" name="email" value="{form?.email ?? user.email}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                    </div>
                    <div>
                        <label for="bio" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bio</label>
                        <textarea id="bio" name="bio" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Your bio...">{(form?.bio ?? user.bio).replaceAll("<br />", "\n")}</textarea>
                    </div>
                    <div>
                        <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block ml-1"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                            <Tooltip class="text-center">You can <b>not</b> change your username<br>You should have thought twice</Tooltip>
                        </label>
                        <input type="text" placeholder="Username" name="username" readonly value="{user.username}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                    </div>
                    <button class="button-primary w-full" type="submit">Save</button>
                </form>
                {#if form?.err}
                    <div class="mt-2 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert"><strong>Error : </strong>{form?.msg ?? "An error occurred"}</div>
                {/if}
            </TabItem>
            <TabItem class="w-full p-0">
                <span slot="title">Danger</span>
                <div class="flex flex-col gap-6">
                    <button class="button-red w-full" type="button" on:click={() => {deleteAccountModal = !deleteAccountModal}}>
                        Delete account 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    </button>
                </div>
            </TabItem>
        </Tabs>
    </div>
</div>

<div class="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 transition-opacity flex flex-col justify-center items-center {deleteAccountModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <form use:enhance action="?/deleteAccount" method="POST" class="p-6 text-center">
                <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete your account?</h3>
                <div class="flex flex-row justify-center gap-2">
                    <button type="button" class="button-border-gray" on:click={() => {deleteAccountModal = false;}}>No, cancel</button>
                    <button class="button-red" type="submit">Yes, I'm sure</button>
                </div>
            </form>
        </div>
    </div>
</div>