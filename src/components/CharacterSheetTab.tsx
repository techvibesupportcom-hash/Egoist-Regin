import React, { useState, useRef } from 'react';
import { CharacterSheet, StatKey, Club } from '../types.ts';
import { generateSheetWhatsAppText, openWhatsAppShare } from '../utils/whatsapp.ts';
import { Shield, Sparkles, CheckCircle, AlertTriangle, Copy, Share2, Bot, Save, User, Swords, Zap, Eye, Flame, Camera, Upload, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CharacterSheetTabProps {
  currentSheet: CharacterSheet | null;
  onSaveSheet: (sheet: CharacterSheet) => Promise<void>;
  clubs: Club[];
  isAdmin: boolean;
}

const AVATAR_PRESETS = [
  { name: 'Kaiser', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { name: 'Sae Itoshi', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
  { name: 'Nagi', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { name: 'Kunigami', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80' },
  { name: 'Chigiri', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { name: 'Poseidón', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80' },
  { name: 'Chinatsu', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
];

export const CharacterSheetTab: React.FC<CharacterSheetTabProps> = ({
  currentSheet,
  onSaveSheet,
  clubs,
  isAdmin,
}) => {
  const [formData, setFormData] = useState<CharacterSheet>(
    currentSheet || {
      id: `sheet-${Date.now()}`,
      userId: `user-${Date.now()}`,
      nombre: '',
      apodo: '',
      edad: 18,
      piernaDominante: 'Diestra',
      nacionalidad: 'Japonesa',
      posicionPrincipal: 'ST',
      clubEstado: 'Libre / En busca de ser fichado',
      arma: '',
      avatarUrl: AVATAR_PRESETS[0].url,
      habilidad1: {
        nombre: '',
        descripcion: '',
        buffTexto: '+30% a 1 stat',
        statsElegidas: ['tiro'],
        duracion: 1,
        usos: 1
      },
      habilidad2: {
        nombre: '',
        descripcion: '',
        buffTexto: '+30% a 1 stat',
        statsElegidas: ['velocidad'],
        duracion: 1,
        usos: 1
      },
      pasiva: {
        nombre: '',
        descripcion: '',
        buffTexto: '+30% a 1 stat',
        statsElegidas: ['tiro'],
        duracion: 1,
        usos: 1
      },
      preFlow: {
        nombre: 'Pre-Flow Egoísta',
        descripcion: 'Concentración y sincronización previa.',
        buffTexto: '+50% a 1 stat',
        statsElegidas: ['tiro'],
        duracion: 1,
        usos: 1
      },
      flow: {
        nombre: 'Flow Absoluto',
        buffTexto: '+90% a 1 stat',
        statsElegidas: ['tiro'],
        buffPredeterminadoTexto: '+70% a 1 stat',
        statsPredeterminadas: ['tiro'],
        duracion: 1,
        usos: 1
      },
      stats: {
        tiro: 10,
        defensa: 2,
        velocidad: 8,
        regate: 6,
        pase: 1,
        iq: 3
      },
      progreso: {
        nivel: 1,
        valorMercado: 300,
        victorias: 0,
        derrotas: 0,
        empates: 0,
        goles: 0,
        robos: 0,
        asistencias: 0,
        mvp: 0
      },
      personalidad: '',
      historia: '',
      motivacion: '',
      nombreUsser: '',
      edadUsuario: 18,
      pais: '',
      zonaHoraria: 'GMT-5',
      pruebaRol: '',
      compromiso: 'Sí, prometo mantener actividad seria, respetar las reglas y no abandonar la comunidad sin avisar.',
      status: 'pendiente',
      renacimientos: 0,
      habilidadesOculares: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<any>(formData.iaEvaluacion || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar suavemente a un tamaño óptimo (máx 600x600) para rendimiento óptimo
        const canvas = document.createElement('canvas');
        const maxDim = 600;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({
            ...prev,
            avatarUrl: compressedDataUrl,
          }));
          confetti({ particleCount: 30, spread: 45 });
        }
        setImageLoading(false);
      };
      img.onerror = () => {
        alert('No se pudo procesar la imagen seleccionada.');
        setImageLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const totalPoints =
    Number(formData.stats.tiro) +
    Number(formData.stats.defensa) +
    Number(formData.stats.velocidad) +
    Number(formData.stats.regate) +
    Number(formData.stats.pase) +
    Number(formData.stats.iq);

  const personalityLines = formData.personalidad.split('\n').filter(l => l.trim().length > 0).length;
  const roleplayLines = formData.pruebaRol.split('\n').filter(l => l.trim().length > 0).length;

  const handleStatChange = (stat: StatKey, value: number) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.max(0, value)
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSheet(formData);
      confetti({ particleCount: 50, spread: 50 });
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluateAI = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/sheets/${formData.id}/evaluate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: formData })
      });
      const data = await res.json();
      if (data.evaluation) {
        setAiEvaluation(data.evaluation);
        setFormData(prev => ({
          ...prev,
          iaEvaluacion: data.evaluation
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCopyWhatsApp = () => {
    const text = generateSheetWhatsAppText(formData);
    navigator.clipboard.writeText(text);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = generateSheetWhatsAppText(formData);
    openWhatsAppShare(text);
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-chakra font-bold text-white">
              {formData.nombre || 'Nueva Ficha Egoísta'}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              formData.status === 'aprobado'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : formData.status === 'rechazado'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
            }`}>
              {formData.status === 'aprobado' ? '🌑 Ficha Aprobada' : formData.status === 'rechazado' ? '❌ Requiere Corrección' : '⏳ Pendiente de Aprobación'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Valor de Mercado Base: <span className="text-cyan-400 font-mono font-bold">¥{formData.progreso.valorMercado}</span> | Nivel {formData.progreso.nivel}
            {formData.adminRevisor && ` • Revisado por ${formData.adminRevisor}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleEvaluateAI}
            disabled={evaluating}
            className="flex items-center gap-2 px-3 py-2 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-mono font-bold transition"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            {evaluating ? 'Auditando...' : 'Auditoría IA de Jinpachi Ego'}
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition"
          >
            <Copy className="w-3.5 h-3.5" />
            {copyNotice ? '¡Copiado!' : 'Copiar Formato WhatsApp'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition shadow"
          >
            <Share2 className="w-3.5 h-3.5" />
            Enviar a WhatsApp
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-chakra font-bold transition shadow-lg"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Ficha'}
          </button>
        </div>
      </div>

      {/* Admin Observation Banner if any */}
      {formData.adminComentario && (
        <div className="border border-amber-500/40 bg-amber-950/20 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs font-mono">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-amber-300">
              Observaciones del Administrador ({formData.adminRevisor || 'Staff'}):
            </span>
            <p className="mt-1 text-slate-200">{formData.adminComentario}</p>
          </div>
        </div>
      )}

      {/* AI Evaluation Box */}
      {aiEvaluation && (
        <div className="border border-purple-500/40 bg-purple-950/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-2 text-purple-300 font-chakra font-bold text-sm">
              <Bot className="w-5 h-5 text-purple-400" />
              <span>Veredicto de IA Ego Jinpachi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-300">Puntaje Egoísta:</span>
              <span className="text-sm font-mono font-bold px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded">
                {aiEvaluation.score}/100
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{aiEvaluation.resumen}"
          </p>
          {aiEvaluation.observaciones && aiEvaluation.observaciones.length > 0 && (
            <ul className="text-xs font-mono space-y-1 text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-purple-900/40">
              {aiEvaluation.observaciones.map((obs: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Character Data & Image */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar & Basic Identity */}
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-chakra font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Retrato & Datos Básicos
            </h3>

            <div className="flex flex-col items-center gap-3">
              {/* Hidden device file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleDeviceImageUpload}
              />

              {/* Avatar Preview with Click-to-upload overlay */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer transition hover:border-cyan-400"
                title="Haz clic para subir o cambiar la foto desde tu dispositivo"
              >
                <img
                  src={formData.avatarUrl || AVATAR_PRESETS[0].url}
                  alt={formData.nombre}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-cyan-300">
                  <Camera className="w-6 h-6 animate-pulse" />
                  <span className="text-[10px] font-chakra font-bold uppercase tracking-wider text-white">
                    Cambiar Foto
                  </span>
                </div>
                {imageLoading && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-cyan-400 text-xs font-mono">
                    <Sparkles className="w-5 h-5 animate-spin mb-1" />
                    <span>Cargando...</span>
                  </div>
                )}
              </div>

              {/* Main Button: Subir desde Dispositivo / Galería */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600/30 via-cyan-500/20 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/60 hover:border-cyan-400 text-cyan-200 rounded-xl text-xs font-chakra font-bold transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>📷 Subir Foto desde tu Dispositivo (Galería/Archivos)</span>
              </button>

              {/* Device Photo Status Indicator */}
              {formData.avatarUrl?.startsWith('data:image') && (
                <div className="w-full flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Foto cargada desde dispositivo
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: AVATAR_PRESETS[0].url })}
                    className="text-slate-400 hover:text-rose-400 transition ml-2"
                    title="Restablecer foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Collapsible / alternative URL input */}
              <div className="w-full pt-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
                  O escribe una URL de imagen:
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl?.startsWith('data:image') ? '' : formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder={formData.avatarUrl?.startsWith('data:image') ? 'Foto personalizada cargada' : 'https://...'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>

              {/* Presets */}
              <div className="w-full">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                  O elige un personaje predeterminado:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Nombre del Personaje</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Michael Kaiser"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Apodo</label>
                <input
                  type="text"
                  value={formData.apodo}
                  onChange={(e) => setFormData({ ...formData, apodo: e.target.value })}
                  placeholder="Ej: El Emperador"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Edad</label>
                  <input
                    type="number"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Pierna Dominante</label>
                  <select
                    value={formData.piernaDominante}
                    onChange={(e) => setFormData({ ...formData, piernaDominante: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="Diestra">Diestra</option>
                    <option value="Zurda">Zurda</option>
                    <option value="Ambidextra">Ambidextra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Nacionalidad</label>
                  <input
                    type="text"
                    value={formData.nacionalidad}
                    onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Posición</label>
                  <select
                    value={formData.posicionPrincipal}
                    onChange={(e) => setFormData({ ...formData, posicionPrincipal: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="ST">ST (Delantero Centro)</option>
                    <option value="RW">RW (Extremo Derecho)</option>
                    <option value="LW">LW (Extremo Izquierdo)</option>
                    <option value="CM">CM (Centrocampista)</option>
                    <option value="DMF">DMF (Pivote Defensivo)</option>
                    <option value="CAM">CAM (Mediapunta)</option>
                    <option value="CB">CB (Defensa Central)</option>
                    <option value="LB">LB (Lateral Izquierdo)</option>
                    <option value="RB">RB (Lateral Derecho)</option>
                    <option value="GK">GK (Portero)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Club / Estado</label>
                <select
                  value={formData.clubEstado}
                  onChange={(e) => setFormData({ ...formData, clubEstado: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                >
                  <option value="Libre / En busca de ser fichado">Libre / En busca de ser fichado</option>
                  <option value="Fundar mi propio Club Egoísta (¥5,000 Yenes)">Fundar mi propio Club Egoísta (¥5,000 Yenes)</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.nombre}>{c.icono} {c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* User Meta Data (Roleplay Requirement) */}
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-3">
            <h3 className="text-base font-chakra font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Datos del Usuario (+17 años)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">Nombre Usser</label>
                <input
                  type="text"
                  value={formData.nombreUsser}
                  onChange={(e) => setFormData({ ...formData, nombreUsser: e.target.value })}
                  placeholder="@usuario_rp"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">Edad Usuario</label>
                  <input
                    type="number"
                    value={formData.edadUsuario}
                    onChange={(e) => setFormData({ ...formData, edadUsuario: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                  {formData.edadUsuario < 17 && (
                    <span className="text-[10px] text-rose-400 block mt-0.5">Comunidad +17 requerida</span>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">País</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    placeholder="México / España..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">Zona Horaria</label>
                <input
                  type="text"
                  value={formData.zonaHoraria}
                  onChange={(e) => setFormData({ ...formData, zonaHoraria: e.target.value })}
                  placeholder="GMT-5 / GMT-6"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Stats, Weapon, Haxs, Flow, RP Text */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Distribution (Exact 30 Initial Points) */}
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Estadísticas Iniciales (30 Puntos Obligatorios)
                </h3>
                <p className="text-xs text-slate-400">
                  Reparte exactamente 30 puntos entre todas las estadísticas para nivel 1.
                </p>
              </div>

              <div className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center gap-2 ${
                totalPoints === 30
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
              }`}>
                <span>Total Asignado: {totalPoints} / 30 Pts</span>
                {totalPoints === 30 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: 'tiro' as StatKey, label: 'Tiro (TIR)', color: 'text-rose-400', desc: 'Potencia vs DEF' },
                { key: 'defensa' as StatKey, label: 'Defensa (DEF)', color: 'text-indigo-400', desc: 'Robos y bloqueos' },
                { key: 'velocidad' as StatKey, label: 'Velocidad (VEL)', color: 'text-cyan-400', desc: 'Casillas por turno' },
                { key: 'regate' as StatKey, label: 'Regate (REG)', color: 'text-emerald-400', desc: 'Duelo 1v1 vs DEF' },
                { key: 'pase' as StatKey, label: 'Pase (PAS)', color: 'text-amber-400', desc: 'Precisión y alcance' },
                { key: 'iq' as StatKey, label: 'IQ Táctico (IQ)', color: 'text-purple-400', desc: '60 IQ = +1 Turno Flow' },
              ].map((s) => (
                <div key={s.key} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold ${s.color}`}>{s.label}</span>
                    <span className="text-[10px] text-slate-500">{s.desc}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.stats[s.key]}
                    onChange={(e) => handleStatChange(s.key, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-base font-bold outline-none focus:border-cyan-400"
                  />
                </div>
              ))}
            </div>

            {/* Tactical Weapon Rule Notice */}
            <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-slate-300 space-y-1">
              <span className="font-bold text-cyan-300 block">✦ Regla de Desplazamiento por Velocidad:</span>
              <p>
                0 ─ 39 Pts ➜ 1 Casilla | 40 ─ 79 Pts ➜ 2 Casillas | 80+ Pts ➜ 3 Casillas.
                <span className="text-yellow-300 font-semibold"> Solo si tu Arma es de Velocidad/Desplazamiento podrás alcanzar 4 Casillas mediante habilidad activa; de lo contrario, el límite máximo es 3 Casillas.</span>
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Arma / Talento Único</label>
              <textarea
                rows={2}
                value={formData.arma}
                onChange={(e) => setFormData({ ...formData, arma: e.target.value })}
                placeholder="Ej: Tiro Kaiser Impact - Disparo de altísima velocidad y precisión con efecto."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Habilidades, Pasiva, Pre-Flow, Flow */}
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-chakra font-bold text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-cyan-400" />
              Habilidades Activas, Pasiva, Pre-Flow y Flow
            </h3>

            {/* Habilidad 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 block">✦ Habilidad 1 (Máximo 2)</span>
                <input
                  type="text"
                  placeholder="Nombre de Habilidad 1"
                  value={formData.habilidad1.nombre}
                  onChange={(e) => setFormData({
                    ...formData,
                    habilidad1: { ...formData.habilidad1, nombre: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Descripción de la jugada"
                  value={formData.habilidad1.descripcion}
                  onChange={(e) => setFormData({
                    ...formData,
                    habilidad1: { ...formData.habilidad1, descripcion: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300"
                />
                <select
                  value={formData.habilidad1.buffTexto}
                  onChange={(e) => setFormData({
                    ...formData,
                    habilidad1: { ...formData.habilidad1, buffTexto: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="+30% a 1 stat">+30% a 1 stat seleccionada</option>
                  <option value="+20% a 2 stats">+20% a 2 stats seleccionadas</option>
                  <option value="+10% a 3 stats">+10% a 3 stats seleccionadas</option>
                </select>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 block">✦ Habilidad 2</span>
                <input
                  type="text"
                  placeholder="Nombre de Habilidad 2"
                  value={formData.habilidad2.nombre}
                  onChange={(e) => setFormData({
                    ...formData,
                    habilidad2: { ...formData.habilidad2, nombre: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Descripción de la jugada"
                  value={formData.habilidad2.descripcion}
                  onChange={(e) => setFormData({
                    ...formData,
                    habilidad2: { ...formData.habilidad2, descripcion: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300"
                />
                <select
                  value={formData.habilidad2.buffTexto}
                  onChange={(e) => setFormData({
                    ...formData,
                    habilidad2: { ...formData.habilidad2, buffTexto: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="+30% a 1 stat">+30% a 1 stat seleccionada</option>
                  <option value="+20% a 2 stats">+20% a 2 stats seleccionadas</option>
                  <option value="+10% a 3 stats">+10% a 3 stats seleccionadas</option>
                </select>
              </div>
            </div>

            {/* Pasiva & Pre-Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-yellow-400 block">✦ Pasiva (Solo 1)</span>
                <input
                  type="text"
                  placeholder="Nombre de Pasiva"
                  value={formData.pasiva.nombre}
                  onChange={(e) => setFormData({
                    ...formData,
                    pasiva: { ...formData.pasiva, nombre: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                />
                <select
                  value={formData.pasiva.buffTexto}
                  onChange={(e) => setFormData({
                    ...formData,
                    pasiva: { ...formData.pasiva, buffTexto: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="+30% a 1 stat">+30% a 1 stat elegida</option>
                  <option value="+20% a 2 stats">+20% a 2 stats elegidas</option>
                </select>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-400 block">✦ Habilidad Pre-Flow</span>
                <input
                  type="text"
                  placeholder="Nombre de Pre-Flow"
                  value={formData.preFlow.nombre}
                  onChange={(e) => setFormData({
                    ...formData,
                    preFlow: { ...formData.preFlow, nombre: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                />
                <select
                  value={formData.preFlow.buffTexto}
                  onChange={(e) => setFormData({
                    ...formData,
                    preFlow: { ...formData.preFlow, buffTexto: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="+50% a 1 stat">+50% a 1 stat elegida</option>
                  <option value="+40% a 2 stats">+40% a 2 stats elegidas</option>
                  <option value="+30% a 3 stats">+30% a cada una de 3 stats</option>
                </select>
              </div>
            </div>

            {/* Flow State */}
            <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl space-y-3">
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                ✦ Flow Egoísta Supremo
              </span>
              <input
                type="text"
                placeholder="Nombre del Flow (Ej: KAISER IMPACT - MAGNUS)"
                value={formData.flow.nombre}
                onChange={(e) => setFormData({
                  ...formData,
                  flow: { ...formData.flow, nombre: e.target.value }
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-bold"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Buff Flow a Elegir</label>
                  <select
                    value={formData.flow.buffTexto}
                    onChange={(e) => setFormData({
                      ...formData,
                      flow: { ...formData.flow, buffTexto: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  >
                    <option value="+90% a 1 stat">+90% a 1 stat elegida</option>
                    <option value="+80% a 2 stats">+80% a 2 stats elegidas</option>
                    <option value="+70% a 3 stats">+70% a 3 stats elegidas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Buff Predeterminado Global (Acumulable)</label>
                  <select
                    value={formData.flow.buffPredeterminadoTexto}
                    onChange={(e) => setFormData({
                      ...formData,
                      flow: { ...formData.flow, buffPredeterminadoTexto: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  >
                    <option value="+70% a 1 stat">+70% a 1 stat (Ej. TIR +70%)</option>
                    <option value="+60% a 2 stats">+60% a 2 stats</option>
                    <option value="+50% a 3 stats">+50% a 3 stats</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Roleplay Texts (Lines validation) */}
          <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-chakra font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Perfil Narrativo & Prueba de Rol
            </h3>

            {/* Personalidad */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400 font-mono uppercase">
                  Personalidad del Personaje (Mínimo 6 líneas)
                </label>
                <span className={`text-[11px] font-mono font-bold ${personalityLines >= 6 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Líneas escritas: {personalityLines} / 6
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.personalidad}
                onChange={(e) => setFormData({ ...formData, personalidad: e.target.value })}
                placeholder="Describe su arrogancia, frialdad, pasión o instinto destructivo..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Historia & Motivación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Historia (Resumen)</label>
                <textarea
                  rows={3}
                  value={formData.historia}
                  onChange={(e) => setFormData({ ...formData, historia: e.target.value })}
                  placeholder="Origen y camino hasta Blue Lock..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Motivación (¿Qué desea conquistar?)</label>
                <textarea
                  rows={3}
                  value={formData.motivacion}
                  onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                  placeholder="Ser el delantero número 1 del mundo, humillar a sus rivales..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Prueba de Rol */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400 font-mono uppercase">
                  Prueba de Rol (Mínimo 15 líneas narradas)
                </label>
                <span className={`text-[11px] font-mono font-bold ${roleplayLines >= 15 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Líneas escritas: {roleplayLines} / 15
                </span>
              </div>
              <textarea
                rows={6}
                value={formData.pruebaRol}
                onChange={(e) => setFormData({ ...formData, pruebaRol: e.target.value })}
                placeholder="Narra una jugada completa: posición inicial de casilla (ej. L3), movimiento táctico, duelo o remate a puerta respetando la lógica y sin mano negra..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Compromiso */}
            <div>
              <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Compromiso con la Comunidad</label>
              <input
                type="text"
                value={formData.compromiso}
                onChange={(e) => setFormData({ ...formData, compromiso: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
