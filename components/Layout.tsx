
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { IMAGES, MOCK_USER } from '../constants';
import { supabase } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfile(profileData);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem: React.FC<{ to: string; label: string; icon: string }> = ({ to, label, icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive(to)
        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
        : 'text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-premium'
        }`}
    >
      <span className="material-symbols-outlined !text-[20px]">{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
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

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden lg:flex items-center bg-primary-50 dark:bg-primary/10 px-4 py-2 rounded-2xl border border-primary/10 transition-all hover:bg-primary/20">
              <span className="material-symbols-outlined text-primary text-[20px] mr-2 fill-1">local_fire_department</span>
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.1em]">{MOCK_USER.streak} Dias seguidos</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors relative group">
                <span className="material-symbols-outlined text-slate-600 dark:text-zinc-400 group-hover:text-primary transition-colors">notifications</span>
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white dark:border-zinc-950 animate-pulse"></span>
              </button>
              <div className="relative group/user">
                <button className="flex items-center gap-3 size-10 rounded-xl border-2 border-primary/20 overflow-hidden shadow-premium transition-all">
                  {profile?.avatar_url || session?.user?.user_metadata?.avatar_url ? (
                    <img src={profile?.avatar_url || session?.user?.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                      {(profile?.name || session?.user?.user_metadata?.full_name || 'U')[0]}
                    </div>
                  )}
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-premium border border-slate-100 dark:border-zinc-800 p-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all">
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-bold text-slate-700 dark:text-zinc-300 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Perfil & Configs
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sair
                  </button>
                </div>
              </div>
            </div>
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
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:text-primary transition-colors">
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
