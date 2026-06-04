import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { ToastProvider } from './components/shared/Toast';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Clients } from './pages/Clients';
import { Products } from './pages/Products';
import { Quotes } from './pages/Quotes';
import { Dashboard } from './pages/Dashboard';
import { AdminUsers } from './pages/AdminUsers';
import { SellerDashboard } from './pages/SellerDashboard';
import { BarChart3, FileText, LayoutGrid, LogOut, Package, Shield, Users } from 'lucide-react';

function DashboardPrincipal() {
  const { logout, user } = useAuth();
  const [activePage, setActivePage] = useState<'menu' | 'crm' | 'products' | 'quotes' | 'dashboard' | 'adminUsers' | 'sellerDashboard'>('menu');
  const pageShell = 'page-enter min-h-screen px-4 py-6 will-animate sm:px-6 md:px-10 lg:px-16 lg:py-12';
	  const moduleCard = 'stagger-item hover-lift hover-glow group flex min-h-40 cursor-pointer flex-col justify-between rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-200 hover:border-orange-300/60 hover:bg-white/90 hover:shadow-2xl hover:shadow-orange-500/10 sm:p-6';

  if (activePage === 'crm') {
    return <div className={pageShell}><Clients onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'products') {
    return <div className={pageShell}><Products onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'quotes') {
    return <div className={pageShell}><Quotes onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'sellerDashboard') {
    return <div className={pageShell}><SellerDashboard onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'dashboard') {
    if (user?.role !== 'ADM') {
      return (
        <div className={pageShell}>
          <div className="space-y-6">
            <button onClick={() => setActivePage('menu')} className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase text-slate-600 shadow-sm backdrop-blur transition hover:border-orange-300 hover:text-orange-600">
              Voltar ao menu
            </button>
            <div className="rounded-2xl border border-white/60 bg-white/75 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              <h2 className="text-2xl font-extrabold uppercase text-slate-900">Acesso restrito</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">Dashboard administrativo disponivel apenas para usuários ADM.</p>
            </div>
          </div>
        </div>
      );
    }
    return <div className={pageShell}><Dashboard onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'adminUsers') {
    if (user?.role !== 'ADM') {
      setActivePage('menu');
      return null;
    }
    return <div className={pageShell}><AdminUsers onBack={() => setActivePage('menu')} /></div>;
  }

  return (
    <div className="page-enter flex min-h-screen flex-col justify-between px-4 py-6 will-animate sm:px-6 md:px-10 lg:px-16 lg:py-12">
      <header className="fade-in-down flex flex-col gap-5 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
        <div>
          <div className="badge-pop-in mb-3 inline-flex rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 text-[11px] font-bold uppercase text-orange-700">
            ERP Comercial
          </div>
          <h1 className="text-3xl font-extrabold uppercase text-slate-950 md:text-5xl">AULEVI NEXUS</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Ola, <span className="font-bold text-slate-950">{user?.name}</span> ({user?.role})
          </p>
        </div>
        <button
          onClick={logout}
	          className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-300 hover:bg-orange-500 hover:text-white md:self-end"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

	      <main className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div onClick={() => setActivePage('crm')} className={moduleCard}>
          <Users className="text-orange-500 transition group-hover:scale-110" size={32} strokeWidth={2.5} />
          <h2 className="text-lg font-extrabold uppercase text-slate-900">CRM Clientes</h2>
        </div>

        <div onClick={() => setActivePage('products')} className={moduleCard}>
          <Package className="text-orange-500 transition group-hover:scale-110" size={32} strokeWidth={2.5} />
          <h2 className="text-lg font-extrabold uppercase text-slate-900">Catálogo Produtos</h2>
        </div>

        <div onClick={() => setActivePage('quotes')} className={moduleCard}>
          <FileText className="text-orange-500 transition group-hover:scale-110" size={32} strokeWidth={2.5} />
          <h2 className="text-lg font-extrabold uppercase text-slate-900">Orçamentos</h2>
        </div>

        {user?.role === 'SELLER' && (
          <div onClick={() => setActivePage('sellerDashboard')} className={moduleCard}>
            <BarChart3 className="text-orange-500 transition group-hover:scale-110" size={32} strokeWidth={2.5} />
            <h2 className="text-lg font-extrabold uppercase text-slate-900">Meus Orçamentos</h2>
          </div>
        )}

        {user?.role === 'ADM' && (
          <div onClick={() => setActivePage('dashboard')} className={moduleCard}>
            <LayoutGrid className="text-orange-500 transition group-hover:scale-110" size={32} strokeWidth={2.5} />
            <h2 className="text-lg font-extrabold uppercase text-slate-900">Dashboard</h2>
          </div>
        )}

        {user?.role === 'ADM' && (
          <div onClick={() => setActivePage('adminUsers')} className={moduleCard}>
            <Shield className="text-orange-500 transition group-hover:scale-110" size={32} strokeWidth={2.5} />
            <h2 className="text-lg font-extrabold uppercase text-slate-900">Usuários & Permissões</h2>
          </div>
        )}
      </main>

      <footer className="fade-in-up rounded-full border border-white/60 bg-white/50 px-4 py-3 text-center text-xs font-medium text-slate-500 shadow-sm backdrop-blur">
        Aulevi Nexus Core v1.0.0 / 2026
      </footer>
    </div>
  );
}

function AppContent() {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-xs font-semibold uppercase text-slate-500">
        Carregando modulos de seguranca...
      </div>
    );
  }

  if (!signed) {
    return <Login />;
  }

  return user?.must_change_password ? <ChangePassword /> : <DashboardPrincipal />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
