import React, { useState, useRef } from 'react';
import { TrainingItemSubmission, CharacterSheet, StatKey } from '../types.ts';
import { generateTrainingWhatsAppText, openWhatsAppShare } from '../utils/whatsapp.ts';
import { Dumbbell, Clock, CheckCircle2, AlertCircle, Copy, Share2, Sparkles, Send, Camera, Image as ImageIcon, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrainingsTabProps {
  currentSheet: CharacterSheet | null;
  trainings: TrainingItemSubmission[];
  onSubmitTraining: (trainingData: Partial<TrainingItemSubmission>) => Promise<void>;
}

export const TrainingsTab: React.FC<TrainingsTabProps> = ({
  currentSheet,
  trainings,
  onSubmitTraining,
}) => {
  const [gym, setGym] = useState(true);
  const [cancha, setCancha] = useState(true);
  const [rolSocial, setRolSocial] = useState(false);
  const [instagram, setInstagram] = useState(false);
  const [actividades, setActividades] = useState(false);
  const [comprobanteTexto, setComprobanteTexto] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const proofImageInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);

  const handleProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setProofImage(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Distribution of stats
  const [distribucion, setDistribucion] = useState<{
    tiro: number;
    defensa: number;
    velocidad: number;
    regate: number;
    pase: number;
    iq: number;
  }>({
    tiro: 20,
    defensa: 10,
    velocidad: 20,
    regate: 10,
    pase: 0,
    iq: 0,
  });

  // Calculate total points based on selections
  let totalPts = 0;
  if (gym) totalPts += 30;
  if (cancha) totalPts += 30;
  if (rolSocial) totalPts += 10;
  if (instagram) totalPts += 10;
  if (actividades) totalPts += 20;

  const allocatedPts =
    Number(distribucion.tiro) +
    Number(distribucion.defensa) +
    Number(distribucion.velocidad) +
    Number(distribucion.regate) +
    Number(distribucion.pase) +
    Number(distribucion.iq);

  const myTrainings = trainings.filter(t => currentSheet && t.sheetId === currentSheet.id);
  const lastTraining = myTrainings[0];

  const handleSubmit = async () => {
    if (!currentSheet) {
      alert('Debes crear o cargar tu ficha de personaje primero.');
      return;
    }
    if (allocatedPts !== totalPts) {
      alert(`Debes asignar exactamente ${totalPts} puntos entre tus estadísticas. Has asignado ${allocatedPts}.`);
      return;
    }
    if (!comprobanteTexto.trim() && !proofImage) {
      alert('Por favor agrega un breve resumen, enlace o captura de pantalla de tu entrenamiento / rol.');
      return;
    }

    setSubmitting(true);
    try {
      const fullComprobante = proofImage
        ? `${comprobanteTexto.trim()} [Captura de pantalla adjunta: ${proofImage.slice(0, 50)}...]`
        : comprobanteTexto.trim();

      await onSubmitTraining({
        userId: currentSheet.userId,
        sheetId: currentSheet.id,
        playerName: currentSheet.nombre,
        clubNombre: currentSheet.clubEstado,
        gym,
        cancha,
        rolSocial,
        instagram,
        actividades,
        totalPuntos: totalPts,
        distribucionStats: distribucion,
        comprobanteTexto: fullComprobante || 'Evidencia adjunta desde dispositivo.',
      });

      confetti({ particleCount: 50, spread: 60 });
      setComprobanteTexto('');
      setProofImage(null);
      alert('¡Entrenamiento enviado a la Administración! Espera la aprobación de uno de los 5 admins para recibir tus estadísticas.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareCurrentWhatsApp = () => {
    if (!currentSheet) return;
    const dummy: TrainingItemSubmission = {
      id: 'preview',
      userId: currentSheet.userId,
      sheetId: currentSheet.id,
      playerName: currentSheet.nombre,
      clubNombre: currentSheet.clubEstado,
      fecha: new Date().toISOString(),
      gym,
      cancha,
      rolSocial,
      instagram,
      actividades,
      totalPuntos: totalPts,
      distribucionStats: distribucion,
      comprobanteTexto: comprobanteTexto || 'Entrenamiento diario 24h listo para validar.',
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };
    openWhatsAppShare(generateTrainingWhatsAppText(dummy));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
            <span>Régimen Físico & Entrenamientos Diarios de 24 Horas</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-chakra font-bold text-white mt-1">
            Entrenamientos Diarios del Egoísta
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reclama hasta +100 puntos diarios. Los administradores revisan y aprueban tu evidencia para sumar las stats a tu ficha.
          </p>
        </div>

        {/* 24 Hour Indicator */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <Clock className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">CICLO DE ACTIVIDAD:</span>
            <span className="text-white font-bold">1 Reporte cada 24 Horas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Checklist & Submission Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-chakra font-bold text-white">
                1. Selecciona las Actividades Realizadas
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Puntos Ganados: +{totalPts} Pts
              </span>
            </div>

            <div className="space-y-3">
              {/* Gym */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={gym}
                    onChange={(e) => setGym(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-chakra font-bold text-white block">🏋️‍♂️ Entrenamiento en Gym</span>
                    <span className="text-[11px] text-slate-400">Fuerza muscular, explosividad y masa física</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">+30 Pts</span>
              </label>

              {/* Cancha */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cancha}
                    onChange={(e) => setCancha(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-chakra font-bold text-white block">⚽ Entrenamiento en Cancha</span>
                    <span className="text-[11px] text-slate-400">Disparo, técnica de regate y velocidad en casillas</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">+30 Pts</span>
              </label>

              {/* Rol Social */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rolSocial}
                    onChange={(e) => setRolSocial(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-chakra font-bold text-white block">💬 Rol Social en Grupo</span>
                    <span className="text-[11px] text-slate-400">Interacción, rivalidades y diálogo entre personajes</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400">+10 Pts</span>
              </label>

              {/* Instagram */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={instagram}
                    onChange={(e) => setInstagram(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-chakra font-bold text-white block">📸 Publicar en Instagram / Red Social</span>
                    <span className="text-[11px] text-slate-400">Declaraciones a la prensa, fotos de entrenamiento</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-pink-400">+10 Pts</span>
              </label>

              {/* Actividades Especiales */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={actividades}
                    onChange={(e) => setActividades(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-chakra font-bold text-white block">🏆 Actividades del Staff</span>
                    <span className="text-[11px] text-slate-400">Retas organizadas, eventos de ego o dinámicas</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">+20 Pts</span>
              </label>
            </div>

            {/* Proof Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-300 font-mono uppercase block">
                Comprobante / Narración del Entrenamiento
              </label>
              <textarea
                rows={3}
                value={comprobanteTexto}
                onChange={(e) => setComprobanteTexto(e.target.value)}
                placeholder="Pega aquí el enlace del mensaje en WhatsApp, o resume brevemente tu sesión de rol/entrenamiento..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-400 font-mono"
              />

              {/* Hidden file input for training proof */}
              <input
                type="file"
                ref={proofImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleProofImageUpload}
              />

              {/* Upload Screenshot from Device button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => proofImageInputRef.current?.click()}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 rounded-xl text-xs font-mono transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📷 Adjuntar captura de pantalla desde tu dispositivo</span>
                </button>

                {proofImage && (
                  <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/50 px-2.5 py-1.5 rounded-lg text-xs font-mono text-emerald-300">
                    <img src={proofImage} alt="Captura adjunta" className="w-6 h-6 object-cover rounded" />
                    <span>Captura adjunta</span>
                    <button
                      type="button"
                      onClick={() => setProofImage(null)}
                      className="text-slate-400 hover:text-rose-400 transition ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stat Assignment & Submission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-chakra font-bold text-white">
                2. Asignar Puntos a Stats
              </h3>
              <span className={`text-xs font-mono font-bold ${allocatedPts === totalPts ? 'text-emerald-400' : 'text-rose-400'}`}>
                {allocatedPts} / {totalPts} Pts
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Distribuye los +{totalPts} puntos entre tus 6 estadísticas. Cuando el staff lo apruebe, se sumarán de inmediato a tu ficha.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {[
                { key: 'tiro' as StatKey, label: 'Tiro (TIR)', color: 'text-rose-400' },
                { key: 'defensa' as StatKey, label: 'Defensa (DEF)', color: 'text-indigo-400' },
                { key: 'velocidad' as StatKey, label: 'Velocidad (VEL)', color: 'text-cyan-400' },
                { key: 'regate' as StatKey, label: 'Regate (REG)', color: 'text-emerald-400' },
                { key: 'pase' as StatKey, label: 'Pase (PAS)', color: 'text-amber-400' },
                { key: 'iq' as StatKey, label: 'IQ Táctico (IQ)', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.key} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className={`text-[11px] font-bold ${s.color}`}>{s.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={distribucion[s.key]}
                    onChange={(e) => setDistribucion({
                      ...distribucion,
                      [s.key]: Math.max(0, Number(e.target.value))
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-bold outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || allocatedPts !== totalPts}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-chakra font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Enviando...' : 'Enviar Reporte para Aprobación'}
              </button>

              <button
                onClick={handleShareCurrentWhatsApp}
                className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 font-mono text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir Formato en WhatsApp
              </button>
            </div>
          </div>

          {/* User History */}
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-chakra font-bold text-white">Tus Reportes Recientes</h4>
            {myTrainings.length === 0 ? (
              <div className="text-xs font-mono text-slate-500 py-4 text-center">
                No has enviado entrenamientos todavía.
              </div>
            ) : (
              myTrainings.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold">+{t.totalPuntos} Puntos</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                      t.status === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' :
                      t.status === 'rechazado' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Fecha: {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                  {t.adminNota && (
                    <div className="text-[11px] text-amber-300 italic">
                      Nota Staff: {t.adminNota}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
