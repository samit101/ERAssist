import { PredefinedTask } from '../types';
import ReminderSelector from './ReminderSelector';

export default function TaskComposer({
  text,
  setText,
  reminder,
  setReminder,
  onSave,
  predefinedTasks,
  title,
}: {
  text: string;
  setText: (s: string) => void;
  reminder: number;
  setReminder: (n: number) => void;
  onSave: () => void;
  predefinedTasks: PredefinedTask[];
  title?: string;
}) {
  return (
    <div className='space-y-2'>
      {title ? <p className='text-sm font-medium'>{title}</p> : null}
      <input
        className='w-full border rounded-xl p-2'
        placeholder='What are you carrying?'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className='flex flex-wrap gap-2'>
        {predefinedTasks.map((q) => (
          <button key={q.id} className='text-xs border' onClick={() => setText(q.text)}>
            {q.text}
          </button>
        ))}
      </div>
      <ReminderSelector value={reminder} onChange={setReminder} />
      <button className='bg-teal-600 text-white w-full' onClick={onSave}>
        Save thread
      </button>
    </div>
  );
}
