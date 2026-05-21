import { TaskThread } from '../types';
export const registerServiceWorker=()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});};
export const requestAlerts=async()=>('Notification'in window)?Notification.requestPermission():'denied';
export const fireDueAlert=async(tasks:TaskThread[])=>{if(!tasks.length)return; if(navigator.vibrate) navigator.vibrate([200,100,200]); if('Notification'in window&&Notification.permission==='granted'){const body=`${tasks.length} threads due now`;const reg=await navigator.serviceWorker?.ready; if(reg?.showNotification) await reg.showNotification('ER Threadkeeper',{body}); else new Notification('ER Threadkeeper',{body}); }};
