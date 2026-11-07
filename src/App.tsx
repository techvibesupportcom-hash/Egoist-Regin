import React, { useState, useEffect } from 'react';
import { CharacterSheet, Club, RankingPlayer, TrainingItemSubmission, NotificationItem, UserSession } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { RankingTab } from './components/RankingTab.tsx';
import { CharacterSheetTab } from './components/CharacterSheetTab.tsx';
import { ClubsTab } from './components/ClubsTab.tsx';
import { TrainingsTab } from './components/TrainingsTab.tsx';
import { CalculatorsTab } from './components/CalculatorsTab.tsx';
import { RebirthGuideTab } from './components/RebirthGuideTab.tsx';
import { EgoAIAssistant } from './components/EgoAIAssistant.tsx';
import { AdminPanelTab } from './components/AdminPanelTab.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { Trophy, Shield, Dumbbell, Target, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('ranking');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // App data state
  const [sheets, setSheets] = useState<CharacterSheet[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);
  const [trainings, setTrainings] = useState<TrainingItemSubmission[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active session
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('bl_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'admin-chinatsu',
      username: 'Chinatsu / Kaiser',
      role: 'admin',
      adminKey: 'chinatsu'
    };
  });

  // Current user's sheet
  const mySheet = sheets.find(s => s.userId === session.id || (session.username && s.nombre.toLowerCase() === session.username.toLowerCase())) || sheets[0] || null;

  // Fetch full state from backend
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setSheets(data.sheets || []);
        setClubs(data.clubs || []);
        setRanking(data.ranking || []);
        setTrainings(data.trainings || []);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Refresco periódico para que todos los admins vean al instante las fichas nuevas
    const interval = setInterval(fetchState, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('bl_user_session', JSON.stringify(newSession));
    if (newSession.role === 'admin') {
      setActiveTab('admin');
    }
  };

  // 1. Save or submit sheet
  const handleSaveSheet = async (sheet: CharacterSheet) => {
    try {
      const payload = {
        ...sheet,
        userId: session.id,
      };
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.sheet) {
        await fetchState();
        alert('¡Ficha guardada exitosamente! Enviada para revisión del Staff y cálculo en ranking.');
      }
    } catch (e) {
      console.error('Error saving sheet:', e);
      alert('Error guardando la ficha.');
    }
  };

  // 2. Admin review sheet
  const handleReviewSheet = async (sheetId: string, status: 'aprobado' | 'rechazado', comment: string, reviewer: string) => {
    try {
      const res = await fetch(`/api/sheets/${sheetId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminComentario: comment, adminRevisor: reviewer })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error reviewing sheet:', e);
    }
  };

  // 3. Submit daily training
  const handleSubmitTraining = async (trainingData: Partial<TrainingItemSubmission>) => {
    try {
      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error submitting training:', e);
    }
  };

  // 4. Admin approve training
  const handleApproveTraining = async (trainingId: string, note: string, reviewer: string) => {
    try {
      const res = await fetch(`/api/trainings/${trainingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNota: note, adminRevisor: reviewer })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error approving training:', e);
    }
  };

  // 5. Admin reject training
  const handleRejectTraining = async (trainingId: string, note: string, reviewer: string) => {
    try {
      const res = await fetch(`/api/trainings/${trainingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNota: note, adminRevisor: reviewer })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error rejecting training:', e);
    }
  };

  // 6. Update ranking player
  const handleUpdateRankingPlayer = async (playerId: string, updates: Partial<RankingPlayer>) => {
    try {
      const res = await fetch(`/api/ranking/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error updating player:', e);
    }
  };

  // 7. Add player to ranking
  const handleAddRankingPlayer = async (player: Partial<RankingPlayer>) => {
    try {
      // Find highest position
      const highestPos = ranking.length + 1;
      const res = await fetch('/api/ranking/new', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...player, posicion: highestPos })
      });
      await fetchState();
    } catch (e) {
      console.error(e);
      await fetchState();
    }
  };

  // 8. Update club details
  const handleUpdateClub = async (clubId: string, updates: Partial<Club>) => {
    try {
      const res = await fetch(`/api/clubs/${clubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error updating club:', e);
    }
  };

  // 9. Found new club
  const handleFoundClub = async (clubData: Partial<Club>) => {
    try {
      const res = await fetch('/api/clubs/found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Error founding club:', e);
    }
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
  };

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 bg-grid-pattern flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentSession={session}
        onOpenLogin={() => setLoginModalOpen(true)}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 font-mono text-cyan-400">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs tracking-widest uppercase">Inicializando Campo de Blue Lock...</span>
          </div>
        ) : (
          <>
            {activeTab === 'ranking' && (
              <RankingTab ranking={ranking} currentPlayerName={session.username} />
            )}

            {activeTab === 'ficha' && (
              <CharacterSheetTab
                currentSheet={mySheet}
                onSaveSheet={handleSaveSheet}
                clubs={clubs}
                isAdmin={session.role === 'admin'}
              />
            )}

            {activeTab === 'clubes' && (
              <ClubsTab
                clubs={clubs}
                currentSession={session}
                onUpdateClub={handleUpdateClub}
                onFoundClub={handleFoundClub}
              />
            )}

            {activeTab === 'entrenamientos' && (
              <TrainingsTab
                currentSheet={mySheet}
                trainings={trainings}
                onSubmitTraining={handleSubmitTraining}
              />
            )}

            {activeTab === 'calculadoras' && (
              <CalculatorsTab />
            )}

            {activeTab === 'guia' && (
              <RebirthGuideTab />
            )}

            {activeTab === 'ia' && (
              <EgoAIAssistant />
            )}

            {activeTab === 'admin' && (
              <AdminPanelTab
                sheets={sheets}
                trainings={trainings}
                ranking={ranking}
                currentSession={session}
                onReviewSheet={handleReviewSheet}
                onApproveTraining={handleApproveTraining}
                onRejectTraining={handleRejectTraining}
                onUpdateRankingPlayer={handleUpdateRankingPlayer}
                onAddRankingPlayer={handleAddRankingPlayer}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050711] py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="text-slate-400">
            BLUE LOCK — REIGN OF EGOISTS (日本の天才) • Plataforma de Administración Oficial
          </p>
          <p className="text-[11px] text-slate-600">
            5 Administradores: Chinatsu/Kaiser (Owner) • Poseidón (Co-owner) • Sae Itoshi • Nagi • Fuji Kiseki
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
        currentSession={session}
      />
    </div>
  );
}
