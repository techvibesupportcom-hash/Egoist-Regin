import { CharacterSheet, TrainingItemSubmission } from '../types.ts';

export function generateSheetWhatsAppText(sheet: CharacterSheet): string {
  const totalStats = Number(sheet.stats.tiro) + Number(sheet.stats.defensa) + Number(sheet.stats.velocidad) + Number(sheet.stats.regate) + Number(sheet.stats.pase) + Number(sheet.stats.iq);
  
  return `╲╱ٕ♰ ٣ֻٍ     *` + `𝐁𝐋𝐔𝐄 𝐋𝐎𝐂𝐊 — 𝐄𝐆𝐎𝐈𝐒𝐓 𝐀𝐏𝐏𝐋𝐈𝐂𝐀𝐓𝐈𝐎𝐍` + `*     🍒̳֞▐
ㅤ            𓆩👑𓆪 日本の天才 — *` + `𝐑𝐄𝐈𝐆𝐍 𝐎𝐅 𝐄𝐆𝐎𝐈𝐒𝐓𝐒` + `* 𓆩⚽𓆪
> *"El fútbol pertenece únicamente a quien tiene el ego suficiente para devorarlo todo."*
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
⚠️⃞⃒⃟⃝<ctrl42> **` + `𝐀𝐃𝐕𝐄𝐑𝐓𝐄𝐍𝐂𝐈𝐀` + `** ♱꯭𝆬
\`\`\`Esta comunidad está dirigida únicamente para una interpretación seria, actividad, buena ortografía y compromiso.
El ego queda dentro del personaje; el respeto queda fuera del campo.\`\`\`
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*` + `𝐃𝐀𝐓𝐎𝐒 𝐃𝐄𝐋 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐉𝐄` + `*
_✦ Nombre:_ ${sheet.nombre}
_✦ Apodo:_ ${sheet.apodo || 'Sin apodo'}
_✦ Edad:_ ${sheet.edad}
_✦ Pierna dominante (Diestra/Zurda):_ ${sheet.piernaDominante}
_✦ Nacionalidad:_ ${sheet.nacionalidad}
_✦ Posición Principal (ST, RW, CM, etc):_ ${sheet.posicionPrincipal}
_✦ Club / Estado:_ ${sheet.clubEstado}
_✦ Arma / Talento Único:_ ${sheet.arma}

_✦ Habilidades de tu personaje (maximo 2):_
*Habilidad 1: ${sheet.habilidad1.nombre}*
${sheet.habilidad1.descripcion}
Buff: ${sheet.habilidad1.buffTexto} (${sheet.habilidad1.statsElegidas.join(' / ').toUpperCase()})
Duración: ${sheet.habilidad1.duracion} | Usos: ${sheet.habilidad1.usos}

*Habilidad 2: ${sheet.habilidad2.nombre}*
${sheet.habilidad2.descripcion}
Buff: ${sheet.habilidad2.buffTexto} (${sheet.habilidad2.statsElegidas.join(' / ').toUpperCase()})
Duración: ${sheet.habilidad2.duracion} | Usos: ${sheet.habilidad2.usos}

_✦ Pasiva de tu personaje (Solo 1):_
*Pasiva: ${sheet.pasiva.nombre}*
${sheet.pasiva.descripcion}
Buff: ${sheet.pasiva.buffTexto} (${sheet.pasiva.statsElegidas.join(' / ').toUpperCase()})
Duración: ${sheet.pasiva.duracion} | Usos: ${sheet.pasiva.usos}

_✦ Habilidad de pre-flow:_
*Pre-Flow: ${sheet.preFlow.nombre}*
Buff: ${sheet.preFlow.buffTexto} (${sheet.preFlow.statsElegidas.join(' / ').toUpperCase()})
Duración: ${sheet.preFlow.duracion} turno(s) según IQ (${sheet.stats.iq} IQ) | Usos: ${sheet.preFlow.usos}

_✦ Flow de tu personaje:_
*Flow: ${sheet.flow.nombre}*
Buff Elegido: ${sheet.flow.buffTexto} (${sheet.flow.statsElegidas.join(' / ').toUpperCase()})
Buff Predeterminado: ${sheet.flow.buffPredeterminadoTexto} (${sheet.flow.statsPredeterminadas.join(' / ').toUpperCase()})
Duración: ${sheet.flow.duracion} | Usos: ${sheet.flow.usos}
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*` + `𝐈𝐈𝐈. 𝐄𝐒𝐓𝐀𝐃𝐈́𝐒𝐓𝐈𝐂𝐀𝐒` + `*
_30 Puntos Iniciales (Suma actual: ${totalStats})_
_Tiro_ ─ \`${sheet.stats.tiro}\`
_Defensa_ ─ \`${sheet.stats.defensa}\`
_Velocidad_ ─ \`${sheet.stats.velocidad}\`
_Regate_ ─ \`${sheet.stats.regate}\`
_Pase_ ─ \`${sheet.stats.pase}\`
_IQ_ ── \`${sheet.stats.iq}\`
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*` + `𝐈𝐕. 𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐎 (Determina tu valor y ranking)` + `*

*Nivel ${sheet.progreso?.nivel || 1}:*

*Valor de Mercado*
\`\`\`${sheet.progreso?.valorMercado || 300} ¥\`\`\`

*Victorias: ${sheet.progreso?.victorias || 0}*
*Derrotas: ${sheet.progreso?.derrotas || 0}*
*Empates: ${sheet.progreso?.empates || 0}*
*Goles: ${sheet.progreso?.goles || 0}*
*Robos: ${sheet.progreso?.robos || 0}*
*Asistencias: ${sheet.progreso?.asistencias || 0}*
*MVP: ${sheet.progreso?.mvp || 0}*
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*` + `𝐏𝐄𝐑𝐅𝐈𝐋 𝐃𝐄𝐋 𝐏𝐉` + `*
*✦ Personalidad:*
\`\`\`${sheet.personalidad}\`\`\`
*✦ Historia:*
${sheet.historia}
*✦ Motivación:*
\`\`\`${sheet.motivacion}\`\`\`
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*` + `𝐃𝐀𝐓𝐎𝐒 𝐃𝐄𝐋 𝐔𝐒𝐔𝐀𝐑𝐈𝐎` + `*
*✦ Nombre usser:* ${sheet.nombreUsser}
*✦ Edad:* ${sheet.edadUsuario}
*✦ País:* ${sheet.pais}
*✦ Zona Horaria:* ${sheet.zonaHoraria}
*✦ Prueba de Rol:*
\`\`\`${sheet.pruebaRol}\`\`\`
*✦ Compromiso:*
${sheet.compromiso}
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*` + `🌑 𝐑𝐄𝐕𝐈𝐒𝐈𝐎́𝐍 𝐃𝐄 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂𝐈𝐎́𝐍` + `*
\`\`\`${sheet.status === 'aprobado' ? '🌑 Aprobado por ' + (sheet.adminRevisor || 'Administración') : sheet.status === 'rechazado' ? '❌ Rechazado' : '⏳ Pendiente de Aprobación por los 5 Admins'}\`\`\`
${sheet.adminComentario ? `*Observación del Staff:* ${sheet.adminComentario}\n` : ''}━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
╲╱ٕ♰ ٣ֻٍ     *` + `𝐎𝐍𝐋𝐘 𝐓𝐇𝐄 𝐄𝐆𝐎𝐈𝐒𝐓 𝐖𝐈𝐋𝐋 𝐑𝐄𝐌𝐀𝐈𝐍.` + `*     🍒̳֞▐`;
}

export function generateTrainingWhatsAppText(training: TrainingItemSubmission): string {
  const items = [];
  if (training.gym) items.push('• Gym (+30 Pts)');
  if (training.cancha) items.push('• Cancha (+30 Pts)');
  if (training.rolSocial) items.push('• Rol Social (+10 Pts)');
  if (training.instagram) items.push('• Publicación Instagram (+10 Pts)');
  if (training.actividades) items.push('• Actividades Especiales (+20 Pts)');

  return `ㅤㅤㅤ I ͜͝ ۪፝֟ ⚽ ͜͝ Iㅤㅤ **` + `𝐁𝐋𝐔𝐄 𝐋𝐎𝐂𝐊 — REPORTE DE ENTRENAMIENTO 24H` + `** ㅤㅤI ͜͝ ۪፝֟ ⚽ ͜͝ I
> *"Los entrenamientos forjan a las bestias que devoran el campo."*
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*Jugador:* ${training.playerName}
*Club:* ${training.clubNombre || 'Agente Libre'}
*Total Puntos Reclamados:* +${training.totalPuntos} Pts

*Actividades completadas:*
${items.join('\n')}

*Distribución a Stats:*
TIR: +${training.distribucionStats.tiro} | DEF: +${training.distribucionStats.defensa} | VEL: +${training.distribucionStats.velocidad}
REG: +${training.distribucionStats.regate} | PAS: +${training.distribucionStats.pase} | IQ: +${training.distribucionStats.iq}

*Comprobante:*
${training.comprobanteTexto}
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
*Estado:* ${training.status === 'aprobado' ? '✅ Aprobado por ' + training.aprobadoPor : '⏳ Esperando Aprobación de Staff'}
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
ㅤㅤㅤ I ͜͝ ۪፝֟ 🍃 ͜͝ I   *` + `𝐎𝐍𝐋𝐘 𝐓𝐇𝐄 𝐄𝐆𝐎𝐈𝐒𝐓 𝐖𝐈𝐋𝐋 𝐑𝐄𝐌𝐀𝐈𝐍.` + `*   I ͜͝ ۪፝֟ 🍃 ͜͝ I`;
}

export function openWhatsAppShare(text: string) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
