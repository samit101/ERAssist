import { AppState } from '../types';
const KEY='er-threadkeeper-v1';
export const defaultState:AppState={patientSeenCount:0,patientTarget:12,patientCases:[],taskThreads:[],fieldNotes:[],recentlyClearedCaseIds:[]};
export const loadState=():AppState=>{try{const raw=localStorage.getItem(KEY);return raw?{...defaultState,...JSON.parse(raw)}:defaultState;}catch{return defaultState;}};
export const saveState=(state:AppState)=>localStorage.setItem(KEY,JSON.stringify(state));
