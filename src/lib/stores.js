import { writable } from 'svelte/store';

export const toasts = writable([]);
export const deletePostModal = writable({ display:false, id:null });
export const searchBar = writable(false);
export const pageMetaData = writable({ title:"", description:"" });