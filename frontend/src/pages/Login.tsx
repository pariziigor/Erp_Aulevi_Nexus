import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha na conexao com o servidor.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/70 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
            <Lock size={22} />
          </div>
          <h1 className="text-3xl font-extrabold uppercase text-slate-950">AULEVI NEXUS</h1>
          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Controle de acesso</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 font-medium text-red-700">
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
            <span className="text-xs font-semibold uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-600">E-mail corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.sobrenome@aulevi.com"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 pl-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Senha de acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 pl-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-4 text-sm font-extrabold uppercase text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Autenticando...' : 'Entrar no sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};
