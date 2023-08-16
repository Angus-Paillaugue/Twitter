<script>
    import { io } from "$lib/socket";
    import { onMount } from "svelte";
    import { pageMetaData, toasts } from "$lib/stores";
    import { parseMentionsOnReceive, parseMentionsOnSend, parseLink } from "$lib/helpers";
    import { Tooltip } from "flowbite-svelte";

    export let data;

    const { conversation, chattingWithUser, user } = data;
    const maxFileSizeMo = 4.4;
    let messages = data.messages ?? [];
    let mentionUsers = [];
    let encodedFiles = [];
    let atMenuDisplay = false;
    let textarea;
    let fileInput;

    async function encodeFile(e) {
		const files = e.target.files;
		if (files.length == 0) return;
        let file = files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (fileSize(reader.result) / 1e6 > maxFileSizeMo) {
                $toasts = [...$toasts , { title: 'Error', message: 'Your file is too large!', type: 'error' }];
            } else {
                encodedFiles = [{ name: file.name, payload: reader.result }];
            }
            fileInput.value = '';
        };
        reader.onerror = (error) => {$toasts = [...$toasts , { title: 'Error', message: error, type: 'error' }]};
	}

    async function sendMessage() {
        let messageText = parseMentionsOnSend(textarea.value.trim());
        if(messageText.length === 0) return;

        const message = { message:messageText, messageId:(Date.now()+Math.floor(Math.random() * 10000)).toString(), conversation, sender:user.username, receiver:chattingWithUser.username, files:encodedFiles };

        io.emit("message", message);
        await fetch("/api/newMessage", { method:"POST", body:JSON.stringify({message, id:conversation}) });
        messages = [...messages, message];
        textarea.value = "";
        encodedFiles = [];
    }

    onMount(() => {
        io.on("message", async(message) => {
            await fetch("/api/seenMessage", { method:"POST", body:JSON.stringify({ id:message.id }) })
            messages = [...messages, message];
        });
        io.emit("register", user.username);
    });

    const calcHeight = (value) => {return 42 + Math.min((value.match(/\n/g) || []).length, 3) * 20;}

    async function oninput(){
        textarea.style.height = calcHeight(textarea.value) + "px";
        const positionIndex = textarea.selectionStart;
        const textBeforeCaret = textarea.value.slice(0, positionIndex);
        const tokens = textBeforeCaret.split(/\s/);
        const lastToken = tokens[tokens.length - 1];
        const triggerIdx = textBeforeCaret.endsWith(lastToken) ? textBeforeCaret.length - lastToken.length : -1;
        const maybeTrigger = textBeforeCaret[triggerIdx];
        const keystrokeTriggered = maybeTrigger === '@';
        if(!keystrokeTriggered) { 
            atMenuDisplay = false; 
            return;
        }
        const query = textBeforeCaret.slice(triggerIdx+1);

        atMenuDisplay = true;
        const res = await fetch(`/api/getMentionUser?query=${query}`, { method:"GET" });
        mentionUsers = await res.json();
    }

    function identifyUser(username){
        atMenuDisplay = false; 
        const positionIndex = textarea.selectionStart;
        const textBeforeCaret = textarea.value.slice(0, positionIndex);
        let start = textBeforeCaret.split("@")
        start.pop();
        textarea.value = start.join("@") + `@${username}`;
        textarea.focus();
    }

    function fileSize(object) {
		var objectList = [];
		var stack = [object];
		var bytes = 0;
		while (stack.length) {
			var value = stack.pop();
			if (typeof value === 'boolean') {
				bytes += 4;
			} else if (typeof value === 'string') {
				bytes += value.length * 2;
			} else if (typeof value === 'number') {
				bytes += 8;
			} else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
				objectList.push(value);
				for (var i in value) {
					stack.push(value[i]);
				}
			}
		}
		return bytes;
	}

    $pageMetaData.title = `Chatting with ${chattingWithUser.username}`;
    $pageMetaData.description = `Chatting with ${chattingWithUser.username}`;
    $pageMetaData.currentPageName = "Messages";
</script>


<div class="h-screen mx-auto w-full">
    <div class="flex flex-col h-full justify-between w-full">
        <div>
            <header class="p-4 pb-0 flex flex-row gap-2 items-center">
                <img src="{chattingWithUser.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full"/>
                <h4>@{chattingWithUser.username}</h4>
            </header>
            <div class="grid grid-cols-12 gap-y-2 p-4 overflow-y-auto">
                {#each messages as message}
                    <div class="{message.sender === user.username ? "col-start-5 col-end-13" : "col-start-1 col-end-9"} p-3 rounded-lg">
                        <div class="flex {message.sender === user.username ? "flex-row-reverse" : "flex-row"} items-end">
                            {#if message.sender !== user.username}
                                <a href="/u/{chattingWithUser.username}">
                                    <img src="{chattingWithUser.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                                </a>
                            {:else}
                                <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                            {/if}
                            <div class="relative {message.sender === user.username ? "mr-3 bg-primary-900 rounded-br-none" : "ml-3 bg-neutral-800 rounded-bl-none"} text-sm py-2 px-4 rounded-xl">
                                {#if message.files.length > 0}
                                    <div class="flex flex-row w-full flex-wrap text-neutral-100">
                                        {#each message.files as file}
                                            <a href="{file.payload}" download="{file.name}" class="flex flex-row justify-start items-center">
                                                <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                                                    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
                                                </svg>
                                                {file.name}
                                            </a>
                                        {/each}
                                    </div>
                                {/if}
                                <p>{@html parseMentionsOnReceive(parseLink(message.message))}</p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
          
        <form on:submit|preventDefault={sendMessage} class="w-full sticky bottom-0 z-20">
            <div class="flex flex-row items-center px-3 py-2 rounded-lg relative">
                {#if atMenuDisplay}
                    <div class="absolute top-0 left-0 w-full -translate-y-full p-2 bg-neutral-900">
                        <div class="flex flex-row flex-wrap gap-2">
                            {#each mentionUsers as user}
                                <button class="p-2 flex flex-row items-center gap-4 bg-neutral-900 hover:bg-neutral-800 border border-border text-neutral-100 w-fit rounded-xl transition-all" data-username="{user.username}" on:click={() => {identifyUser(user.username)}}>
                                    <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                                    <div class="flex flex-col"><h6>{ user.username }</h6></div>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
                <label for="fileInput" class="p-2 rounded-lg cursor-pointer text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all mr-2 relative">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                        <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
                    </svg>
                    <span class="sr-only">Upload image</span>
                    <input type="file" name="fileInput" id="fileInput" class="hidden" bind:this={fileInput} on:change={encodeFile}>
                </label>
                <Tooltip type="dark">Add a file</Tooltip>
                {#if encodedFiles.length > 0}
                    <div class="absolute top-0 left-0 w-fit flex flex-row gap-4 -translate-y-full">
                        {#each encodedFiles as file}
                            <div class="relative group px-2 bg-neutral-800 transition-all hover:bg-neutral-950/50 rounded-full">
                                <p class="pr-4">{file.name.length > 20 ? file.name.slice(0, 17)+"..."+file.name.split(".").at(-2).slice(-3)+"."+file.name.split(".").at(-1) : file.name}</p>
                                <div class="w-full h-full rounded-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all flex flex-row justify-end items-center">
                                    <button class="pr-2" type="button" on:click={() => {encodedFiles = []}}>
                                        <svg class="w-3 h-3 transition-all text-neutral-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
                <textarea rows="1" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all resize-none" placeholder="Your message..." bind:this={textarea} on:input={(e) => textarea.style.height = calcHeight(textarea.value) + "px"} on:input={oninput}></textarea>
                <button type="submit" class="inline-flex justify-center p-2 rounded-full cursor-pointer text-primary-600/90 hover:bg-neutral-700 transition-all">
                    <svg class="w-5 h-5 rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                        <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
                    </svg>
                    <span class="sr-only">Send message</span>
                </button>
            </div>
        </form>
    </div>
</div>