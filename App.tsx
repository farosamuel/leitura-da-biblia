
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { UserRole } from './types';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import ReadingView from './views/ReadingView';
import Community from './views/Community';
import AdminParticipants from './views/admin/AdminParticipants';

// Mock simple settings page
const Settings = () => (
  <div className="max-w-4xl mx-auto space-y-8 p-4">
    <h1 className="text-3xl font-black">Configurações</h1>
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-20 rounded-full bg-slate-200" />
        <button className="text-primary font-bold hover:underline">Alterar Foto</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
          <input className="w-full border-slate-200 rounded-xl" defaultValue="João Davi" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
          <input className="w-full border-slate-200 rounded-xl" defaultValue="joao.davi@exemplo.com" disabled />
        </div>
      </div>
      <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Salvar Alterações</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN); // defaulting to admin for preview

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/*" 
          element={
            <Layout userRole={userRole}>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="reading" element={<ReadingView />} />
                <Route path="community" element={<Community />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={<Navigate to="/admin/participants" replace />} />
                <Route path="admin/participants" element={<AdminParticipants />} />
                <Route path="admin/plan" element={<div className="p-8"><h1 className="text-3xl font-black">Definir Plano (Em breve)</h1></div>} />
                <Route path="admin/reports" element={<div className="p-8"><h1 className="text-3xl font-black">Relatórios (Em breve)</h1></div>} />
                <Route path="admin/settings" element={<div className="p-8"><h1 className="text-3xl font-black">Admin Config (Em breve)</h1></div>} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
