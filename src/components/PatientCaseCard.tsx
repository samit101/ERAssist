import { useState } from 'react';
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
  const [selectedDispo, setSelectedDispo] = useState<string[]>([]);
  const [showKaiser, setShowKaiser] = useState(false);

  const toggleDispo = (label: string) => {
    const nextSelected = selectedDispo.includes(label)
      ? selectedDispo.filter((d) => d !== label)
      : [...selectedDispo, label];
    setSelectedDispo(nextSelected);

    if (label === 'Adm' && nextSelected.includes('Adm') && !showKaiser) {
      if (window.confirm('Add Kaiser as a dispo button?')) setShowKaiser(true);
    }
  };

  return (
    <div className='card space-y-2'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='font-semibold'>Room {pc.room}</h3>
        </div>
        <div className='flex gap-2'>
          <button className='text-xs border px-2 py-1' onClick={() => setLastSeenAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}>{lastSeenAt ? `Seen ${lastSeenAt}` : 'Seen'}</button>
          <button className='text-xs border px-2 py-1' onClick={onClear}>Clear</button>
        </div>
      </div>
      <p className='text-xs text-slate-600'>{ACUITY_LABELS[pc.acuityScore]}</p>
      <p className='text-xs'>{open.length} open threads · {due.length} due now</p>
      <AcuitySelector value={pc.acuityScore} onChange={onAcuity} />
      <div className='space-y-1'>
        <p className='text-xs text-slate-600'>Dispo</p>
        <div className='flex flex-wrap gap-2'>
          {['Adm', 'ICU', 'D/C', 'SW', ...(showKaiser ? ['Kaiser'] : [])].map((d) => (
            <button
              key={d}
              className={`text-xs border rounded-full px-2 py-1 ${selectedDispo.includes(d) ? 'bg-teal-600 text-white' : ''}`}
              onClick={() => toggleDispo(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
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
