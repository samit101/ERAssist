import { useEffect, useMemo, useState } from 'react';
import { AppState, PredefinedTask } from './types';
import { defaultPredefinedTasks, defaultState, loadState, saveState } from './utils/storage';
import HeaderSummary from './components/HeaderSummary';
import FieldNotes from './components/FieldNotes';
import TaskComposer from './components/TaskComposer';
import PatientCaseCard from './components/PatientCaseCard';
import AcuitySelector from './components/SwagSelector';
import { isDue, nowIso } from './utils/reminders';
import { sortCases } from './utils/sorting';
import { fireDueAlert, requestAlerts } from './utils/notifications';

const id = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export default function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [page, setPage] = useState<'board' | 'admin'>('board');
  const [menuOpen, setMenuOpen] = useState(false);
  const [room, setRoom] = useState('');
  const [acuity, setAcuity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [taskText, setTaskText] = useState('');
  const [reminder, setReminder] = useState(0);
  const [inlineCaseId, setInlineCaseId] = useState<string | null>(null);
  const [inlineTaskText, setInlineTaskText] = useState('');
  const [inlineReminder, setInlineReminder] = useState(0);
  const [toast, setToast] = useState('');
  const [newPredef, setNewPredef] = useState('');

  useEffect(() => setState(loadState()), []);
  useEffect(() => saveState(state), [state]);

  const activeCases = state.patientCases.filter((c) => !c.isCleared);
  const activeTasks = state.taskThreads.filter((t) => !t.isCompleted);
  const dueTasks = activeTasks.filter((t) => isDue(t));

  useEffect(() => {
    const check = () => {
      const unalerted = state.taskThreads.filter((t) => isDue(t) && !t.lastAlertedAt);
      if (!unalerted.length) return;
      fireDueAlert(unalerted);
      setState((s) => ({
        ...s,
        taskThreads: s.taskThreads.map((t) =>
          unalerted.find((u) => u.id === t.id) ? { ...t, lastAlertedAt: nowIso() } : t,
        ),
      }));
    };
    const iv = setInterval(check, 20000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [state.taskThreads]);

  const sorted = useMemo(() => sortCases(activeCases, state.taskThreads), [activeCases, state.taskThreads]);

  const addTask = (caseId: string | null, text: string, mins: number) => {
    const dueAt = mins ? new Date(Date.now() + mins * 60000).toISOString() : null;
    setState((s) => ({
      ...s,
      taskThreads: [{ id: id(), caseId, text, createdAt: nowIso(), isCompleted: false, reminderMinutes: mins || null, dueAt, lastAlertedAt: null, snoozeCount: 0 }, ...s.taskThreads],
    }));
  };

  const nav = (target: 'board' | 'admin') => { setPage(target); setMenuOpen(false); };

  return <main className='max-w-md mx-auto p-3 space-y-3 pb-10'>
    <header className='card flex items-center justify-between relative'>
      <button className='border' onClick={() => setMenuOpen((v) => !v)}>☰</button>
      <h1 className='font-semibold'>ER Threadkeeper</h1>
      {menuOpen && <><button className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} aria-label='Close menu' /><div className='absolute left-0 top-12 z-20 bg-white border rounded-xl shadow p-2 w-44 space-y-1'><button className={`w-full text-left p-2 rounded ${page === 'board' ? 'bg-slate-100' : ''}`} onClick={() => nav('board')}>Main Board</button><button className={`w-full text-left p-2 rounded ${page === 'admin' ? 'bg-slate-100' : ''}`} onClick={() => nav('admin')}>Admin</button></div></>}
    </header>

    {page === 'board' && <>
      <HeaderSummary seen={state.patientSeenCount} target={state.patientTarget} setSeen={(n) => setState((s) => ({ ...s, patientSeenCount: n }))} />
      <div className='card text-xs'>Alerts when supported by your device/browser. <button className='border ml-2' onClick={() => requestAlerts()}>Enable alerts</button></div>

      <div className='card space-y-2'>
        <h2 className='font-semibold'>+ New Case</h2>
        <input className='w-full border rounded-xl p-2' placeholder='Room number or non-identifying cue' value={room} onChange={(e) => setRoom(e.target.value)} />
        <p className='text-xs'>Room/cue only. Avoid patient-identifying details.</p>
        <AcuitySelector value={acuity} onChange={setAcuity} />
        <TaskComposer text={taskText} setText={setTaskText} reminder={reminder} setReminder={setReminder} predefinedTasks={state.predefinedTasks} onSave={() => { if (!room.trim()) return; const cid = id(); const created = nowIso(); setState((s) => ({ ...s, patientCases: [{ id: cid, room: room.trim(), acuityScore: acuity, createdAt: created, updatedAt: created, isCleared: false, clearedAt: null, infoSources: {} }, ...s.patientCases] })); if (taskText.trim()) addTask(cid, taskText.trim(), reminder); setRoom(''); setTaskText(''); setReminder(0); }} />
      </div>

      {sorted.map((pc) => <PatientCaseCard key={pc.id} pc={pc} tasks={state.taskThreads.filter((t) => t.caseId === pc.id)} onAcuity={(v) => setState((s) => ({ ...s, patientCases: s.patientCases.map((c) => c.id === pc.id ? { ...c, acuityScore: v, updatedAt: nowIso() } : c) }))} onToggleTask={(tid) => setState((s) => ({ ...s, taskThreads: s.taskThreads.map((t) => t.id === tid ? { ...t, isCompleted: true, completedAt: nowIso() } : t) }))} onSnooze={(tid, m) => setState((s) => ({ ...s, taskThreads: s.taskThreads.map((t) => t.id === tid ? { ...t, dueAt: new Date(Date.now() + m * 60000).toISOString(), lastAlertedAt: null, snoozeCount: (t.snoozeCount || 0) + 1 } : t) }))} onClear={() => { const open = state.taskThreads.filter((t) => t.caseId === pc.id && !t.isCompleted).length; if (open && !window.confirm(`Room ${pc.room} still has ${open} open threads. Clear anyway?`)) return; setState((s) => ({ ...s, patientCases: s.patientCases.map((c) => c.id === pc.id ? { ...c, isCleared: true, clearedAt: nowIso() } : c), recentlyClearedCaseIds: [pc.id, ...s.recentlyClearedCaseIds].slice(0, 10) })); setToast(`Room ${pc.room} cleared. Undo?`); }} inlineOpen={inlineCaseId === pc.id} inlineTaskText={inlineCaseId === pc.id ? inlineTaskText : ''} setInlineTaskText={(v) => { if (inlineCaseId !== pc.id) setInlineCaseId(pc.id); setInlineTaskText(v); }} inlineReminder={inlineCaseId === pc.id ? inlineReminder : 0} setInlineReminder={(v) => { if (inlineCaseId !== pc.id) setInlineCaseId(pc.id); setInlineReminder(v); }} predefinedTasks={state.predefinedTasks} onSaveInlineTask={() => { if (!inlineTaskText.trim()) return; addTask(pc.id, inlineTaskText.trim(), inlineReminder); setInlineTaskText(''); setInlineReminder(0); setInlineCaseId(null); }} onMarkSource={(source) => { setState((s) => ({ ...s, patientCases: s.patientCases.map((c) => c.id === pc.id ? { ...c, infoSources: { ...(c.infoSources || {}), [source]: true }, updatedAt: nowIso() } : c) })); setToast(`${source === 'priorEmr' ? 'Prior EMR' : source.toUpperCase()} marked checked. Undo?`); }} onResetSources={() => setState((s) => ({ ...s, patientCases: s.patientCases.map((c) => c.id === pc.id ? { ...c, infoSources: {}, updatedAt: nowIso() } : c) }))} />)}

      <div className='card'><details><summary>Recently cleared</summary>{state.recentlyClearedCaseIds.map((cid) => { const pc = state.patientCases.find((c) => c.id === cid); if (!pc) return null; return <div key={cid} className='flex justify-between py-1'><span>Room {pc.room}</span><button className='border' onClick={() => setState((s) => ({ ...s, patientCases: s.patientCases.map((c) => c.id === cid ? { ...c, isCleared: false, clearedAt: null } : c) }))}>Restore</button></div>; })}</details></div>

      <FieldNotes notes={[...state.fieldNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} onSave={(text, tag) => setState((s) => ({ ...s, fieldNotes: [{ id: id(), text, tag, createdAt: nowIso() }, ...s.fieldNotes] }))} onDelete={(nid) => setState((s) => ({ ...s, fieldNotes: s.fieldNotes.filter((n) => n.id !== nid) }))} />
    </>}

    {page === 'admin' && <div className='space-y-3'>
      <div className='card space-y-2'>
        <h2 className='font-semibold'>Admin</h2>
        <p className='text-xs text-slate-600'>These quick tasks appear as buttons when adding threads to a room/case.</p>
        <div className='flex gap-2'><input className='flex-1 border rounded-xl p-2' placeholder='New predefined task...' value={newPredef} onChange={(e)=>setNewPredef(e.target.value)} /><button className='border' onClick={()=>{if(!newPredef.trim())return; const now=nowIso(); const t:PredefinedTask={id:id(),text:newPredef.trim(),createdAt:now,updatedAt:now}; setState(s=>({...s,predefinedTasks:[...s.predefinedTasks,t]})); setNewPredef('');}}>Add</button></div>
      </div>
      <div className='space-y-2'>{state.predefinedTasks.map((t)=> <div className='card flex items-center gap-2' key={t.id}><input className='flex-1 border rounded-xl p-2' value={t.text} onChange={(e)=>setState(s=>({...s,predefinedTasks:s.predefinedTasks.map(p=>p.id===t.id?{...p,text:e.target.value,updatedAt:nowIso()}:p)}))}/><button className='border' onClick={()=>setState(s=>({...s,predefinedTasks:s.predefinedTasks.filter(p=>p.id!==t.id)}))}>Delete</button></div>)}</div>
      <button className='border w-full' onClick={()=>{if(window.confirm('Reset predefined tasks to defaults?')) setState(s=>({...s,predefinedTasks:defaultPredefinedTasks}));}}>Reset to default tasks</button>
    </div>}

    {toast ? <div className='fixed top-2 left-2 right-2 bg-slate-900 text-white p-2 rounded-xl'>{toast}</div> : null}
  </main>;
}
