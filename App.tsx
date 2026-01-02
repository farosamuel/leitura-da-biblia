import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { UserRole } from './types';
import AuthView from './views/AuthView';
import Dashboard from './views/Dashboard';
import ReadingView from './views/ReadingView';
import Community from './views/Community';
import NotesView from './views/NotesView';
import AdminParticipants from './views/admin/AdminParticipants';
import AdminPlan from './views/admin/AdminPlan';
import { supabase } from './services/supabaseClient';

// Settings page with real data
const Settings = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [session, setSession] = React.useState<any>(null);
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (data) {
          setProfile(data);
          setName(data.name || '');
        }
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    if (!session?.user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Perfil atualizado com sucesso!');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <h1 className="text-3xl font-black">Configurações</h1>
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="size-20 rounded-full object-cover" alt="Avatar" />
          ) : (
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-2xl">
              {name ? name[0].toUpperCase() : 'U'}
            </div>
          )}
          <button className="text-primary font-bold hover:underline">Alterar Foto</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
              value={profile?.email || session?.user?.email || ''}
              disabled
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-4xl">auto_stories</span>
          </div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.email === 'samuel.bfaro@gmail.com';
  const userRole = isAdmin ? UserRole.ADMIN : UserRole.USER;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <AuthView /> : <Navigate to="/dashboard" replace />}
        />

        <Route
          path="/*"
          element={
            session ? (
              <Layout userRole={userRole}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="reading" element={<ReadingView />} />
                  <Route path="community" element={<Community />} />
                  <Route path="notes" element={<NotesView />} />
                  <Route path="settings" element={<Settings />} />

                  {/* Admin Routes */}
                  <Route path="admin" element={<Navigate to="/admin/participants" replace />} />
                  <Route path="admin/participants" element={<AdminParticipants />} />
                  <Route path="admin/plan" element={<AdminPlan />} />
                  <Route path="admin/reports" element={<div className="p-8"><h1 className="text-3xl font-black">Relatórios (Em breve)</h1></div>} />
                  <Route path="admin/settings" element={<div className="p-8"><h1 className="text-3xl font-black">Admin Config (Em breve)</h1></div>} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
