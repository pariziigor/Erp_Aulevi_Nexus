import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectOption } from './types';

interface CommercialSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function CommercialSelect({ options, value, onChange }: CommercialSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${open ? 'z-[120]' : 'z-0'}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
	        className={`no-hover-lift flex w-full items-center justify-between gap-3 rounded-2xl border bg-white/80 p-3 text-left text-xs font-extrabold uppercase text-slate-900 shadow-sm outline-none transition hover:border-orange-300 hover:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 ${open ? 'border-orange-300 ring-4 ring-orange-500/10' : 'border-slate-200'}`}
      >
        <span>{selectedOption?.label || 'Selecione'}</span>
        <ChevronDown size={16} className={`text-slate-500 transition ${open ? 'rotate-180 text-orange-500' : ''}`} />
      </button>

      {open && (
        <div className="nexus-dropdown-panel">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
	                className={`no-hover-lift flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold uppercase transition ${selected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-700'}`}
	              >
	                <span className="min-w-0 break-words">{option.label}</span>
	                {selected && <span className="h-2 w-2 shrink-0 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
