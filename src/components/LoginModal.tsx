import React, { useState } from 'react';
import { UserSession } from '../types.ts';
import { Shield, Key, User, Check, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
  currentSession: UserSession;
}

const ADMINS = [
  { key: 'chinatsu', label: 'Chinatsu / Kaiser', roleText: 'Owner Principal' },
  { key: 'poseidon', label: 'Poseidón', roleText: 'Co-Owner & Líder Atlantis' },
  { key: 'sae', label: 'Sae Itoshi', roleText: 'Admin 3 & Líder Real Madrid' },
  { key: 'nagi', label: 'Nagi Seishiro', roleText: 'Admin 4' },
  { key: 'fuji', label: 'Fuji Kiseki', roleText: 'Admin 5 & Líder Uma Musume' },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, currentSession }) => {
  const [mode, setMode] = useState<'admin' | 'player'>('admin');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminQuickLogin = (adminKey: string) => {
    onLogin({
      id: `admin-${adminKey}`,
      username: ADMINS.find(a => a.key === adminKey)?.label || adminKey,
      role: 'admin',
      adminKey: adminKey as any
    });
    onClose();
  };

  const handleAdminPasswordSubmit = () => {
    const trimmed = adminPasswordInput.trim().toLowerCase();
    const found = ADMINS.find(a => a.key === trimmed);
    if (found) {
      onLogin({
        id: `admin-${found.key}`,
        username: found.label,
        role: 'admin',
        adminKey: found.key as any
      });
      onClose();
    } else {
      setErrorMsg('Contraseña incorrecta. Debe ser uno de los 5 nombres: chinatsu, poseidon, sae, nagi, o fuji');
    }
  };

  const handlePlayerSubmit = () => {
    if (!playerNameInput.trim()) return;
    onLogin({
      id: `player-${Date.now()}`,
      username: playerNameInput.trim(),
      role: 'player'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080d1e] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(6,182,212,0.2)] space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-chakra font-bold text-white">
              Inicio de Sesión • Blue Lock
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setMode('admin'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-chakra font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'admin' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Acceso 5 Admins</span>
          </button>
          <button
            onClick={() => { setMode('player'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-chakra font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'player' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sesión Jugador</span>
          </button>
        </div>

        {mode === 'admin' ? (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                Acceso Rápido por Nombre de Administrador:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ADMINS.map((adm) => (
                  <button
                    key={adm.key}
                    onClick={() => handleAdminQuickLogin(adm.key)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-cyan-500/50 transition flex items-center justify-between text-left"
                  >
                    <div>
                      <span className="text-xs font-chakra font-bold text-white block">{adm.label}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">{adm.roleText}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Entrar
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="text-[11px] font-mono uppercase text-slate-400 block">
                O escribe la contraseña de admin:
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="chinatsu, poseidon, sae, nagi, fuji"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminPasswordSubmit()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  onClick={handleAdminPasswordSubmit}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-chakra font-bold text-xs rounded-lg transition"
                >
                  Validar
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2 rounded border border-rose-900">
                {errorMsg}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Nombre de tu Personaje o Usuario
              </label>
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePlayerSubmit()}
                placeholder="Ej: Michael Kaiser / Chigiri"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              onClick={handlePlayerSubmit}
              disabled={!playerNameInput.trim()}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-chakra font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Iniciar como Jugador
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
