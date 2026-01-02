
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { IMAGES, MOCK_USER } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem: React.FC<{ to: string; label: string; icon: string }> = ({ to, label, icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive(to)
          ? 'bg-primary text-white shadow-lg shadow-red-200'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">menu_book</span>
              <h1 className="text-xl font-black tracking-tight hidden sm:block">
                Plano de Leitura <span className="text-primary">Raiz de Davi</span>
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className={`text-sm font-bold ${isActive('/dashboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 dark:text-slate-400'}`}>Dashboard</Link>
            <Link to="/reading" className={`text-sm font-bold ${isActive('/reading') ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 dark:text-slate-400'}`}>Leitura Diária</Link>
            <Link to="/community" className={`text-sm font-bold ${isActive('/community') ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 dark:text-slate-400'}`}>Comunidade</Link>
            {userRole === UserRole.ADMIN && (
              <Link to="/admin" className={`text-sm font-bold ${location.pathname.startsWith('/admin') ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 dark:text-slate-400'}`}>Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center bg-primary-light px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-primary text-sm mr-1">local_fire_department</span>
                <span className="text-xs font-bold text-primary">{MOCK_USER.streak} Dias seguidos</span>
              </div>
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 relative">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-white dark:border-zinc-950"></span>
            </button>
            <Link to="/settings" className="size-10 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm">
              <img src={MOCK_USER.avatar} alt="Profile" className="w-full h-full object-cover" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Admin Sidebar */}
        {location.pathname.startsWith('/admin') && (
          <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-zinc-800 flex-col gap-2 p-6 shrink-0 bg-white dark:bg-zinc-950">
             <div className="flex items-center gap-3 mb-6 p-2">
                <img src={IMAGES.ADMIN_AVATAR} alt="Admin" className="size-12 rounded-full ring-2 ring-primary/20" />
                <div className="flex flex-col">
                  <h3 className="font-bold text-sm">Admin Leitura</h3>
                  <p className="text-xs text-slate-500">Plano Anual 2024</p>
                </div>
             </div>
             <NavItem to="/admin" label="Visão Geral" icon="dashboard" />
             <NavItem to="/admin/participants" label="Participantes" icon="group" />
             <NavItem to="/admin/plan" label="Plano de Leitura" icon="menu_book" />
             <NavItem to="/admin/reports" label="Relatórios" icon="description" />
             <NavItem to="/admin/settings" label="Configurações" icon="settings" />
             
             <div className="mt-auto pt-6 border-t border-slate-100 dark:border-zinc-900">
                <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-sm font-semibold">Sair</span>
                </button>
             </div>
          </aside>
        )}

        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>

      <footer className="py-8 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">© 2024 Plano de Leitura Célula Raiz de Davi. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
