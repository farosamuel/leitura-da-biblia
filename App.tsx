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
import { readingPlanService } from './services/readingPlanService';
import { supabase } from './services/supabaseClient';
import { ThemeProvider } from './contexts/ThemeContext';

// Settings page with real data
import ImageCropper from './components/ImageCropper';

// Settings page with real data
const Settings = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [session, setSession] = React.useState<any>(null);
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = React.useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const init = async () => {
      console.log("Settings: Initializing...");
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        console.log("Settings: Session found for user", session.user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Settings: Error fetching profile", error);
        } else if (data) {
          console.log("Settings: Profile loaded", data);
          setProfile(data);
          setName(data.name || '');
        } else {
          console.warn("Settings: No profile data found for ID", session.user.id);
        }
      } else {
        console.log("Settings: No session found");
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
      showSuccess('Perfil atualizado com sucesso!');
    }
    setSaving(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageSrc(reader.result?.toString() || null);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      // Clear input so same file can be selected again
      event.target.value = '';
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setCropModalOpen(false);
    setUploading(true);

    try {
      let currentUserId = session?.user?.id;

      // Fallback: fetch user if session is missing
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
        } else {
          throw new Error("Usuário não autenticado.");
        }
      }

      const fileExt = 'jpg'; // We export as jpeg in getCroppedImg
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
      const file = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Force a cache-busting query param to ensure immediate UI update
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlWithTimestamp, updated_at: new Date().toISOString() })
        .eq('id', currentUserId);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrlWithTimestamp }));
      showSuccess('Foto de perfil atualizada!');
    } catch (error: any) {
      alert('Erro ao atualizar foto: ' + error.message);
    } finally {
      setUploading(false);
      setSelectedImageSrc(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-green-500/20 flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300">
          <span className="material-symbols-outlined fill-1">check_circle</span>
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Configurações</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 md:p-10 border border-slate-100 dark:border-zinc-800 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-600" />

        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className={`size-32 rounded-full p-1 border-2 ${uploading ? 'border-primary border-dashed' : 'border-slate-100 dark:border-zinc-800'} transition-all`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover group-hover:opacity-80 transition-opacity" alt="Avatar" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-300 dark:text-zinc-600 text-4xl group-hover:bg-slate-100 dark:group-hover:bg-zinc-700 transition-colors">
                  {name ? name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </div>

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-full backdrop-blur-sm z-10">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
              </div>
            )}
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sua Foto de Perfil</h2>
            <p className="text-slate-500 max-w-sm">
              Clique na foto para alterar. Isso será exibido no seu perfil e na comunidade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person</span>
              <input
                className="w-full border-2 border-slate-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800/50 text-slate-900 dark:text-white font-bold focus:border-primary focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all placeholder:font-normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
              <input
                className="w-full border border-slate-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800/30 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                value={profile?.email || session?.user?.email || ''}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-10 py-4 rounded-2xl font-black tracking-wide hover:bg-primary-600 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Salvando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                SALVAR ALTERAÇÕES
              </>
            )}
          </button>
        </div>
      </div>

      {cropModalOpen && selectedImageSrc && (
        <ImageCropper
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
          }}
        />
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State for Access Denied Modal
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);

  const checkUserStatus = async (currentSession: any) => {
    if (!currentSession?.user) {
      setSession(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (error) {
        // If it's a network error or something transient, DO NOT log them out immediately.
        console.error("Error checking status (transient):", error);
        // We keep the session for now. The UI might be limited but we don't nuking the session.
        return;
      }

      // Check if Inactive (but NOT if profile is simply null/undefined due to slow query)
      // Only trigger logout if we EXPLICITLY get is_active = false
      if (profile?.is_active === false) {
        console.log("Access denied: Account inactive");
        setAccessDeniedError('Sua conta está inativa. Contate o administrador.');
        setSession(null);
        supabase.auth.signOut();
        return;
      }

      // Profile not found is handled by the zombie check in initSession.
      // Here we just proceed if we didn't get an explicit `is_active = false`.

      // Allowed
      setSession(currentSession);
    } catch (err) {
      console.error("Unexpected error in checkUserStatus:", err);
      // Do not sign out on unexpected runtime errors, proceed with session
    }
  };

  useEffect(() => {
    let mounted = true;

    // FORCE RESET LOGIC
    const CURRENT_APP_VERSION = '1.3.3'; // Bump this to force logout everyone
    const storedVersion = localStorage.getItem('app_version');

    if (storedVersion !== CURRENT_APP_VERSION) {
      console.log(`New version detected (${CURRENT_APP_VERSION}). performing cleanup...`);
      localStorage.clear(); // Wipes old state
      sessionStorage.clear();

      // Attempt sign out then reload
      supabase.auth.signOut().finally(() => {
        localStorage.setItem('app_version', CURRENT_APP_VERSION);
        if (mounted) {
          window.location.reload();
        }
      });
      return; // Stop initialization
    }

    // Initial check
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // ZOMBIE CHECK: If we have a session, verify it against the DB
      if (session?.user) {
        console.log("Verifying session validity...");
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        // If generic auth error, or specifically JWT related
        if (error && (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('token'))) {
          console.warn("[Auto-Heal] Zombie session detected. Nuking storage.");
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
          return;
        }
      }

      try {
        await readingPlanService.initialize();
      } catch (e) { console.error("Plan init failed", e); }

      if (mounted) {
        setSession(session);
        setLoading(false); // OPTIMISTIC: Unblock UI immediately for better UX

        if (session) {
          // Check status in background
          checkUserStatus(session);
        }
      }
    };
    initSession();

    // Listener for changes (e.g., login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        console.log("[Auth] State changed:", _event);
        setSession(newSession);
        setLoading(false);
        // NOTE: Do NOT call checkUserStatus here to avoid repeated profile checks
        // that can cause false logouts on transient network issues.
        // Initial check is done in initSession.
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    <ThemeProvider>
      <Router>
        {/* Access Denied Modal Overlay */}
        {accessDeniedError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-red-100 dark:border-red-900/30 relative animate-in fade-in zoom-in duration-200">

              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-3xl text-red-500">block</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Acesso Negado</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {accessDeniedError}
                  </p>
                </div>

                <button
                  onClick={() => setAccessDeniedError(null)}
                  className="w-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-bold py-3 px-6 rounded-xl mt-4 shadow-lg shadow-red-500/20"
                >
                  Entendido
                </button>
              </div>

            </div>
          </div>
        )}

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
    </ThemeProvider>
  );
};

export default App;
