import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Login } from './pages/Login';
import { Clients } from './pages/Clients';
import { Products } from './pages/Products';
import { Quotes } from './pages/Quotes';
import { Dashboard } from './pages/Dashboard';
import { LogOut, Users, Package, FileText, LayoutGrid } from 'lucide-react';

function DashboardPrincipal() {
  const { logout, user } = useAuth();
  const [activePage, setActivePage] = useState<'menu' | 'crm' | 'products' | 'quotes' | 'dashboard'>('menu');

  // Redirecionamento condicional das telas
  if (activePage === 'crm') {
    return <div className="min-h-screen p-8 md:p-16"><Clients onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'products') {
    return <div className="min-h-screen p-8 md:p-16"><Products onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'quotes') {
    return <div className="min-h-screen p-8 md:p-16"><Quotes onBack={() => setActivePage('menu')} /></div>;
  }

  if (activePage === 'dashboard') {
    return <div className="min-h-screen p-8 md:p-16"><Dashboard onBack={() => setActivePage('menu')} /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 md:p-16">
      {/* Header */}
      <header className="border-b-4 border-black pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">AULEVI NEXUS</h1>
          <p className="text-sm font-medium text-gray-600 mt-1">
            Olá, <span className="font-bold text-black">{user?.name}</span> ({user?.role}) — ERP Comercial
          </p>
        </div>
        <button 
          onClick={logout}
          className="border-2 border-black p-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white hover:bg-black hover:text-white transition-all"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      {/* Grid de Módulos */}
      <main className="my-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        <div onClick={() => setActivePage('crm')} className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-all cursor-pointer flex flex-col justify-between h-48">
          <Users size={32} strokeWidth={2.5} />
          <h2 className="text-xl font-bold uppercase tracking-tight">CRM Clientes</h2>
        </div>
        
        <div onClick={() => setActivePage('products')} className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-all cursor-pointer flex flex-col justify-between h-48">
          <Package size={32} strokeWidth={2.5} />
          <h2 className="text-xl font-bold uppercase tracking-tight">Catálogo Produtos</h2>
        </div>
        
        <div 
          onClick={() => setActivePage('quotes')}
          className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-all cursor-pointer flex flex-col justify-between h-48"
        >
          <FileText size={32} strokeWidth={2.5} />
          <h2 className="text-xl font-bold uppercase tracking-tight">Orçamentos</h2>
        </div>
        
        <div 
          onClick={() => setActivePage('dashboard')}
          className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-all cursor-pointer flex flex-col justify-between h-48"
        >
          <LayoutGrid size={32} strokeWidth={2.5} />
          <h2 className="text-xl font-bold uppercase tracking-tight">Dashboard</h2>
        </div>
      </main>

      <footer className="text-xs font-mono text-gray-500 text-center border-t border-gray-300 pt-4">
        Aulevi Nexus Core v1.0.0 // 2026
      </footer>
    </div>
  );
}

function AppContent() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] font-mono text-xs uppercase">
        Carregando Módulos de Segurança...
      </div>
    );
  }

  return signed ? <DashboardPrincipal /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;