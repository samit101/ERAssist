const preset=[0,5,10,15,20,30,45,60];
export default function ReminderSelector({value,onChange}:{value:number;onChange:(n:number)=>void}){return <div className='flex flex-wrap gap-2'>{preset.map(m=><button key={m} className={value===m?'bg-slate-800 text-white border':'border'} onClick={()=>onChange(m)}>{m===0?'None':`${m} min`}</button>)}</div>}
