import { writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store'

export const toasts = writable([]);
export const deletePostModal = writable({ display:false, id:null });
export const searchBar = writable(false);
export const pageMetaData = writable({ title:"", description:"", headerText:"" });
export const preferences = persisted('preferences', {
  theme: 'light',
});