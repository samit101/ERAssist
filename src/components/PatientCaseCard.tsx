import { PatientCase, TaskThread, AcuityScore, PredefinedTask } from '../types';
import TaskItem from './TaskItem';
import AcuitySelector, { ACUITY_LABELS } from './SwagSelector';
import TaskComposer from './TaskComposer';

const sources = [
  { key: 'crisp', label: 'CRISP' },
  { key: 'priorEmr', label: 'Prior EMR' },
  { key: 'family', label: 'Family' },
  { key: 'ems', label: 'EMS' },
] as const;

export default function PatientCaseCard({
  pc,
  tasks,
  onAcuity,
  onToggleTask,
  onSnooze,
  onClear,
  onSaveInlineTask,
  inlineOpen,
  inlineTaskText,
  setInlineTaskText,
  inlineReminder,
  setInlineReminder,
  predefinedTasks,
  onMarkSource,
  onResetSources,
}: {
  pc: PatientCase;
  tasks: TaskThread[];
  onAcuity: (v: AcuityScore) => void;
  onToggleTask: (id: string) => void;
  onSnooze: (id: string, m: number) => void;
  onClear: () => void;
  onSaveInlineTask: () => void;
  inlineOpen: boolean;
  inlineTaskText: string;
  setInlineTaskText: (v: string) => void;
  inlineReminder: number;
  setInlineReminder: (v: number) => void;
  predefinedTasks: PredefinedTask[];
  onMarkSource: (source: 'crisp' | 'priorEmr' | 'family' | 'ems') => void;
  onResetSources: () => void;
}) {
  const open = tasks.filter((t) => !t.isCompleted);
  const due = open.filter((t) => t.dueAt && new Date(t.dueAt) <= new Date());

  return (
    <div className='card space-y-2'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='font-semibold'>Room {pc.room}</h3>
          <span className='text-sm'>Acuity {pc.acuityScore}</span>
        </div>
        <button className='text-xs border px-2 py-1' onClick={onClear}>Clear</button>
      </div>
      <p className='text-xs text-slate-600'>{ACUITY_LABELS[pc.acuityScore]}</p>
      <p className='text-xs'>{open.length} open threads · {due.length} due now</p>
      <AcuitySelector value={pc.acuityScore} onChange={onAcuity} />
      <div>
        <p className='text-xs text-slate-500 mb-1'>Info Sources</p>
        <div className='flex flex-wrap gap-2'>
          {sources.filter((s)=>!pc.infoSources?.[s.key]).map((s) => (
            <button key={s.key} className='text-xs border rounded-full px-2 py-1' onClick={() => onMarkSource(s.key)}>{s.label}</button>
          ))}
          <button className='text-xs underline text-slate-500' onClick={onResetSources}>Reset sources</button>
        </div>
      </div>
      <div className='space-y-2'>
        {open
          .sort((a, b) => (a.dueAt ? 0 : 1) - (b.dueAt ? 0 : 1))
          .slice(0, 6)
          .map((t) => (
            <TaskItem key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onSnooze={(m) => onSnooze(t.id, m)} />
          ))}
      </div>
      <button className='border w-full' onClick={() => setInlineTaskText(inlineOpen ? '' : inlineTaskText)}>+ Task</button>
      {inlineOpen ? (
        <TaskComposer
          title={`Add thread to Room ${pc.room}`}
          text={inlineTaskText}
          setText={setInlineTaskText}
          reminder={inlineReminder}
          setReminder={setInlineReminder}
          onSave={onSaveInlineTask}
          predefinedTasks={predefinedTasks}
        />
      ) : null}
    </div>
  );
}
import { PatientCase, TaskThread } from '../types';import TaskItem from './TaskItem';import SwagSelector,{SWAG_LABELS} from './SwagSelector';
export default function PatientCaseCard({pc,tasks,onSwag,onAddTask,onToggleTask,onSnooze,onClear}:{pc:PatientCase;tasks:TaskThread[];onSwag:(v:1|2|3|4|5)=>void;onAddTask:()=>void;onToggleTask:(id:string)=>void;onSnooze:(id:string,m:number)=>void;onClear:()=>void}){const open=tasks.filter(t=>!t.isCompleted);const due=open.filter(t=>t.dueAt&&new Date(t.dueAt)<=new Date());return <div className='card space-y-2'><div className='flex justify-between'><h3 className='font-semibold'>Room {pc.room}</h3><span>SWAG {pc.acuitySwag}</span></div><p className='text-xs text-slate-600'>{SWAG_LABELS[pc.acuitySwag]}</p><p className='text-xs'>{open.length} open threads · {due.length} due now</p><SwagSelector value={pc.acuitySwag} onChange={onSwag}/><div className='space-y-2'>{open.sort((a,b)=>(a.dueAt?0:1)-(b.dueAt?0:1)).slice(0,5).map(t=><TaskItem key={t.id} task={t} onToggle={()=>onToggleTask(t.id)} onSnooze={(m)=>onSnooze(t.id,m)}/>)}</div><div className='flex gap-2'><button className='border flex-1' onClick={onAddTask}>+ Task</button><button className='border flex-1' onClick={onClear}>Clear from consciousness</button></div></div>}
