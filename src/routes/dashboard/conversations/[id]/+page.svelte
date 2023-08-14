<script>
    import { io } from "$lib/socket";
    import { onMount } from "svelte";
    import { pageMetaData } from "$lib/stores";
    import { parseMentionsOnReceive, parseMentionsOnSend, parseLink } from "$lib/helpers";

    export let data;

    const { conversation, chattingWithUser, user } = data;
    let messages = data.messages ?? [];
    let textarea;
    let atMenuDisplay = false;
    let mentionUsers = [];

    async function sendMessage() {
        let messageText = parseMentionsOnSend(textarea.value.trim());
        if(messageText.length === 0) return;

        const message = { message:messageText, conversation, sender:user.username, receiver:chattingWithUser.username };
        
        io.emit("message", message);
        const res = await fetch("/api/newMessage", { method:"POST", body:JSON.stringify({message:messageText, id:conversation}) })
        messages = [...messages, message];
        textarea.value = "";
    }

    onMount(() => {
        io.on("message", message => {
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
            return ;
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

    $pageMetaData.title = `Chatting with ${chattingWithUser.username}`;
    $pageMetaData.description = `Chatting with ${chattingWithUser.username}`;
    $pageMetaData.currentPageName = "Messages";
</script>


<div class="h-screen mx-auto w-full">
    <div class="flex flex-col h-full justify-between w-full">
        <div>
            <header class="p-4 pb-0">
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
                            <div class="relative {message.sender === user.username ? "mr-3 bg-primary-900" : "ml-3 bg-neutral-500"} text-sm py-2 px-4 shadow rounded-xl">
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
                <textarea id="chat" rows="1" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all resize-none" placeholder="Your message..." bind:this={textarea} on:input={(e) => textarea.style.height = calcHeight(textarea.value) + "px"} on:input={oninput}></textarea>
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