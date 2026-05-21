import { AcuityScore } from '../types';

export const ACUITY_LABELS: Record<AcuityScore, string> = {
  1: 'Low concern / high certainty',
  2: 'Fairly comfortable',
  3: 'Moderate concern',
  4: 'Concerning',
  5: 'Very concerning / high uncertainty',
};

export default function AcuitySelector({
  value,
  onChange,
}: {
  value: AcuityScore;
  onChange: (v: AcuityScore) => void;
}) {
  return (
    <div className='flex gap-2'>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          className={`border ${value === v ? 'bg-teal-600 text-white' : 'bg-white'}`}
          onClick={() => onChange(v as AcuityScore)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
