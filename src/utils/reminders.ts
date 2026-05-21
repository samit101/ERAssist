import { TaskThread } from '../types';
export const nowIso=()=>new Date().toISOString();
export const isDue=(t:TaskThread,n=Date.now())=>!t.isCompleted&&!!t.dueAt&&new Date(t.dueAt).getTime()<=n;
export const relDue=(t:TaskThread,n=Date.now())=>{if(!t.dueAt) return 'no reminder'; const d=Math.ceil((new Date(t.dueAt).getTime()-n)/60000); if(d<=0)return 'due now'; return `in ${d} min`;};
export const dueCount=(tasks:TaskThread[])=>tasks.filter((t)=>isDue(t)).length;
