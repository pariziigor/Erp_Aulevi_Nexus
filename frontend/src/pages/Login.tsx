import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { LoadingButton } from '../components/shared/FormComponents';
import { PasswordInput } from '../components/shared/PasswordInput';
import alvanceLogo from '../assets/alvance-login.svg';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRecoveryMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setRecoveryMessage(null);

    if (!email) {
      setError('Informe o e-mail corporativo para recuperar a senha.');
      return;
    }

    setIsRecovering(true);
    try {
      const response = await api.post('/auth/password/forgot', { email });
      setRecoveryMessage(response.data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha.');
    } finally {
      setIsRecovering(false);
    }
  }

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-[#0f0f0f] will-animate">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-orange-500/15 blur-3xl" />
        <div className="absolute bottom-[-16rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative grid min-h-screen w-full grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(440px,0.8fr)]">
        <section className="flex min-h-[280px] flex-col justify-center px-5 pb-8 pt-10 sm:px-10 lg:min-h-screen lg:px-16 lg:py-16 xl:px-24">
          <div className="mx-auto w-full max-w-3xl lg:mx-0">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#141414]/90 p-3 shadow-2xl shadow-black/40 backdrop-blur sm:p-5">
              <img
                src={alvanceLogo}
                alt="ALVance Comercial e Vendas"
                className="block h-auto w-full"
              />
            </div>

            <div className="mt-7 hidden max-w-2xl lg:block">
              <p className="text-xs font-bold uppercase text-orange-400">Inteligência comercial integrada</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-white xl:text-5xl">
                Operação comercial clara, rápida e conectada.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                Centralize clientes, produtos, propostas e resultados em um ambiente preparado para o ritmo da sua equipe.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-t-[2rem] bg-[#f7f4ef] px-4 py-8 shadow-[-24px_0_70px_rgba(0,0,0,0.28)] sm:px-8 lg:min-h-screen lg:rounded-l-[2.5rem] lg:rounded-tr-none lg:px-12">
          <div className="modal-slide-up w-full max-w-md">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141414] text-orange-400 shadow-lg shadow-slate-900/15">
                <Lock size={21} />
              </div>
              <p className="text-xs font-extrabold uppercase text-orange-600">Acesso seguro</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Bem-vindo de volta</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Entre com suas credenciais corporativas para acessar o ALVance.</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 font-medium text-red-700">
                <ShieldAlert size={20} className="mt-0.5 shrink-0" />
                <span className="text-xs font-semibold uppercase">{error}</span>
              </div>
            )}

            {recoveryMessage && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-semibold uppercase text-emerald-700">
                {recoveryMessage}
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
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome.sobrenome@aulevi.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 pl-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Senha de acesso</label>
                <PasswordInput value={password} onChange={setPassword} placeholder="********" />
              </div>

              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Autenticando..."
                className="button-glow w-full rounded-2xl p-4 text-sm font-extrabold uppercase shadow-xl shadow-orange-500/20 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-orange-500/25"
              >
                Entrar no sistema
              </LoadingButton>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isRecovering}
                className="no-hover-lift w-full text-center text-xs font-bold uppercase text-slate-500 transition hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRecovering ? 'Solicitando apoio...' : 'Esqueci minha senha'}
              </button>
            </form>

            <p className="mt-9 border-t border-slate-200 pt-5 text-center text-[11px] font-semibold uppercase text-slate-400">
              ALVance Comercial Intelligence ERP
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
