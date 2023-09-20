<script>
    import { enhance } from "$app/forms"
    import { pageMetaData } from "$lib/stores";
    import { parseMentionsOnReceive, parseLink, parseMentionsOnSend } from "$lib/helpers";
    import { Tooltip } from "flowbite-svelte";
    import { io } from 'socket.io-client';

    export let data;
    export let form;

    $: if(form?.groupName){conversation.groupName = form.groupName;}
    
    const { user } = data;
    let { chattingWith, conversation, followedUsers } = data;
    followedUsers = followedUsers.map(el => {return {...el, display:false}});
    const socket = io("http://localhost:5171/", { query:`conversationId=${conversation.id}` });
    user.blockedUsers = form?.blockedUsers ?? user.blockedUsers;
    const maxFileSizeMo = 4.4;
    let messages = data.messages ?? [];
    let mentionUsers = [];
    let encodedFiles = [];
    let moreModal = false;
    let addUserForm = false;
    let atMenuDisplay = false;
    let textarea;
    let fileInput;
    let messagesContainer;
    let addUserToConversationInput;
    $: if(messagesContainer) {scrollToBottom();}

    socket.on('message', async(message) => {
        await fetch("/api/seenMessage", { method:"POST", body:JSON.stringify({ id:message.id }) });
        messages = [...messages, message];
    });

    async function addUserToConversationInputHandle() {
        if(addUserToConversationInput.value.length === 0) return followedUsers = followedUsers.map(el => {return {...el, display:false}});
        let query = new RegExp( addUserToConversationInput.value, 'i' );
        followedUsers = followedUsers.map(el => {if(chattingWith.filter(a => el.username.match(query)?.input === a.username).length > 0){return {...el, display:false}} else if(el.username.match(query)) { return {...el, display:true}}else return {...el, display:false}})
    }

    async function encodeFile(e) {
		const files = e.target.files;
		if (files.length == 0) return;
        let file = files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (fileSize(reader.result) / 1e6 > maxFileSizeMo) {
                newToast("error", "Your file is too large");
            } else {
                encodedFiles = [{ name: file.name, payload: reader.result }];
            }
            fileInput.value = '';
        };
        reader.onerror = (error) => {newToast("error", error);};
	}

    async function sendMessage() {
        let messageText = parseMentionsOnSend(textarea.value.trim());
        if(messageText.length === 0) return;

        let message = { message:messageText, messageId:(Date.now()+Math.floor(Math.random() * 10000)).toString(), receiver:chattingWith.filter(el => el !== user.username), conversation:conversation.id, sender:{username:user.username}, files:encodedFiles };

        messages = [...messages, message];

        socket.emit("message", message);
        await fetch("/api/newMessage", { method:"POST", body:JSON.stringify({message, id:conversation.id}) });
        textarea.value = "";
        encodedFiles = [];
    }
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
        let start = textBeforeCaret.split("@");
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

    const scrollToBottom = async (behavior = "smooth") => {
        messagesContainer.scroll({ top: messagesContainer.scrollHeight, behavior });
    };

    async function removeUserFromGroup(username) {
        const res = await fetch("/api/removeUserFromGroup", { method:"POST", body:JSON.stringify({ conversationId:conversation.id, username }) });
        const data = await res.json();
        if(data.error) return console.log(data.error); 
        conversation.users = conversation.users.filter(el => el.username !== username);
        chattingWith = chattingWith.filter(el => el.username !== username);
    }
    async function addUserToGroup(el) {
        const res = await fetch("/api/addUserToGroup", { method:"POST", body:JSON.stringify({ conversationId:conversation.id, username:el.username }) });
        const data = await res.json();
        if(data.error) return console.log(data.error); 
        followedUsers = followedUsers.map(el => {if(el.username === el.username){return {...el, display:false}}else {return el}});
        chattingWith = [...chattingWith, el];
        addUserToConversationInput.value = "";
    }

    if(conversation?.type === "dm"){
        $pageMetaData.title = `Chatting with ${chattingWith.filter(el => el.username !== user.username)[0].username}`;
        $pageMetaData.description = `Chatting with ${chattingWith.filter(el => el.username !== user.username)[0].username}`;
    }else {
        $pageMetaData.title = `Chatting in ${conversation.groupName}`;
        $pageMetaData.description = `Chatting in ${conversation.groupName}`;
    }
    $pageMetaData.currentPageName = "Messages";
</script>

<div class="flex flex-col justify-between w-full h-screen relative">
    <header class="p-4 pb-2 flex flex-row gap-2 items-center bg-neutral-900">
        <a href="/dashboard/conversations" class="material-button round">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </a>
        {#if conversation?.type === "dm"}
            <img src="{chattingWith.filter(el => el.username !== user.username)[0].profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full"/>
            <h4>
                @{chattingWith.filter(el => el.username !== user.username)[0].username}
                {#if chattingWith.filter(el => el.username !== user.username)[0].certified}
                    <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>
                {/if}
            </h4>
            <button class="ml-auto text-neutral-100" on:click={() => {moreModal = true;}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
            </button>
        {:else}
            <h4>{conversation.groupName}</h4>
            <button class="ml-auto text-neutral-100" on:click={() => {moreModal = true;}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
            </button>
        {/if}
    </header>
    <div class="grid grid-cols-12 gap-y-2 md:p-4 p-1 overflow-y-auto grow h-full no-scrollbar" bind:this={messagesContainer}>
        {#each messages as message}
            <div class="{message.sender.username === user.username ? "md:col-start-5 col-start-2 col-end-13" : "col-start-1 md:col-end-9 col-end-11"} rounded-lg">
                <div class="flex {message.sender.username === user.username ? "flex-row-reverse" : "flex-row"} items-end gap-3">
                    {#if message.sender.username !== user.username}
                        <a href="/u/{message.sender.username}">
                            <img src="{chattingWith.filter(el => el.username === message.sender.username)[0].profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                        </a>
                    {:else}
                        <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                    {/if}
                    <div class="relative {message.sender.username === user.username ? "bg-primary-900 rounded-br-none" : "bg-neutral-800 rounded-bl-none"} text-sm py-2 px-4 rounded-xl max-w-full">
                        {#if message.files.length > 0}
                            <div class="flex flex-row w-full flex-wrap text-neutral-100">
                                {#each message.files as file}
                                    <a href="{file.payload}" download="{file.name}" class="flex flex-row justify-start items-center">
                                        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20"><path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/></svg>
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
    {#if chattingWith.length === 2 && chattingWith?.blockedUsers?.includes(user.username)}
        <div class="w-full p-2 bg-neutral-800 text-center">
            <p>You have been blocked by this user</p>
        </div>
    {/if}
    <form on:submit|preventDefault={sendMessage} class="w-full bg-neutral-900">
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
                    {#each encodedFiles as file, index}
                        <div class="relative group px-2 bg-neutral-800 transition-all hover:bg-neutral-950/50 rounded-full">
                            <p class="pr-4">{file.name.length > 20 ? file.name.slice(0, 17)+"..."+file.name.split(".").at(-2).slice(-3)+"."+file.name.split(".").at(-1) : file.name}</p>
                            <div class="w-full h-full rounded-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all flex flex-row justify-end items-center">
                                <button class="pr-2" type="button" on:click={() => {encodedFiles = encodedFiles.filter((_, i) => i!==index)}}>
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

<div class="fixed top-0 left-0 w-full h-full bg-neutral-600/50 transition-opacity flex flex-col justify-center items-center {moreModal ? "z-40 opacity-100": "-z-10 opacity-0"}">
    <div class="relative rounded-lg shadow bg-neutral-900 max-w-md max-h-full w-full p-4">
        <button type="button" on:click={() => {moreModal = false;}} class="absolute top-2.5 right-2.5 text-neutral-400 bg-transparent rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center hover:bg-neutral-800 hover:text-neutral-100 group">
            <svg class="w-3 h-3 group-hover:rotate-90 transition-all" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            <span class="sr-only">Close modal</span>
        </button>
        <h4>Details</h4>
        {#if conversation?.type === "group"}
            {#if conversation.admin === user.username}
                <h5 class="mt-6">Group settings</h5>
                <form use:enhance action="?/deleteGroup" method="POST" class="flex flex-col gap-2">
                    <button class="button-danger w-full">Delete group</button>
                </form>

                <form use:enhance action="?/renameGroup" method="POST" class="mt-4">
                    <input type="text" placeholder="Group name" name="name" value={form?.name ?? conversation.groupName} class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all mb-2">
                    <button class="button-primary w-full">Rename</button>
                </form>

                <h5 class="mt-6">Manage users</h5>
                <button class="button-primary button-sm w-full mb-2" on:click={() => {addUserForm = !addUserForm;}}>
                    Add user
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
                <div class="overflow-hidden {addUserForm ? "max-h-56 mb-2" :"max-h-0"} transition-all">
                    {#if followedUsers.filter(el => el.display).length > 0}
                        <div class="flex flex-row flex-wrap gap-2 mb-2">
                            {#each followedUsers as user}
                                {#if user.display}
                                    <button class="p-2 flex flex-row items-center gap-4 bg-neutral-900 hover:bg-neutral-800 border border-border text-neutral-100 w-fit transition-all rounded-xl cursor-pointer hover:rounded-3xl" on:click={() => {addUserToGroup(user)}}>
                                        <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                                        <div class="flex flex-col"><h6>{ user.username }</h6></div>
                                    </button>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                    <input type="text" placeholder="Username" class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all" on:keyup={addUserToConversationInputHandle} bind:this={addUserToConversationInput}>
                </div>
                <div class="flex flex-row flex-wrap gap-2">
                    {#each chattingWith.filter(el =>el.username !== user.username) as user}
                        <div class="p-2 flex flex-row items-center gap-4 bg-neutral-900 border text-neutral-100 w-fit transition-all border-border rounded-3xl cursor-pointer hover:rounded-xl overflow-hidden relative group">
                            <img src="{user.profilePicture}" alt="Avatar" class="h-8 w-8 rounded-full flex-shrink-0"/>
                            <div class="flex flex-col"><h6>{ user.username }</h6></div>
                            <div class="absolute top-0 left-0 w-full h-full opacity-0 transition-all bg-neutral-800/50 group-hover:opacity-100 flex flex-row items-center justify-end">
                                <button class="h-full aspect-square flex flex-row items-center justify-center" on:click={() => {removeUserFromGroup(user.username)}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 transition-all">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <form use:enhance action="?/leaveGroup" method="POST" class="flex flex-col gap-2 mt-6">
                    <button class="button-danger w-full">Leave group</button>
                </form>
            {/if}
        {/if}
        {#if conversation?.type === "dm"}
            <form use:enhance action="?/blockUser" method="POST" class="flex flex-col gap-2 mt-6">
                <button class="button-danger w-full" on:click={() => {
                    if(user.blockedUsers.includes(chattingWith.username)){
                        user.blockedUsers = user.blockedUsers.filter(username => username !==chattingWith.username);
                    }else {
                        user.blockedUsers = [...user.blockedUsers, chattingWith.username];
                    }
                }}>
                    {#if user.blockedUsers.includes(chattingWith.username)}
                        Unblock
                    {:else}
                        Block
                    {/if}
                    user
                </button>
            </form>
        {/if}
    </div>
</div>