import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  minLength,
  placeholder,
  className = '',
  required = true,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`input-focus w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
	        className="no-hover-lift hover-scale absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-orange-600"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        title={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
