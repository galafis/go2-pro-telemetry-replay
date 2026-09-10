import { sampleAt } from './engine.js';
import { svg, label, esc, fmt, extent, text } from './ui.js';
export const interpretation = {
  en: 'Only valid adjacent samples within the configured gap and speed limits contribute to distance. The cursor holds the latest recorded position and flags staleness. These are generic offline records, not an implemented vendor telemetry connection.',
  pt: 'Somente amostras adjacentes válidas, dentro dos limites de intervalo e velocidade, contribuem para a distância. O cursor mantém a última posição registrada e sinaliza dados antigos. São registros genéricos offline, sem conexão de telemetria do fabricante implementada.',
};
export const cursorMax = (r) => r.records.at(-1).atMs + r.maxGapMs + 1;
export function render(r, lang, cursor) {
  const [xmin, xmax] = extent(r.records.map((s) => s.xM)),
    [ymin, ymax] = extent(r.records.map((s) => s.yM));
  const scale = Math.min(620 / (xmax - xmin), 200 / (ymax - ymin)),
    x = (v) => 70 + (v - xmin) * scale,
    y = (v) => 245 - (v - ymin) * scale;
  let content = `<line class="axis" x1="55" x2="710" y1="245" y2="245"/>${label(55, 280, 'x (m)')}${label(16, 35, 'y (m)')}`;
  for (let i = 1; i < r.records.length; i++) {
    const a = r.records[i - 1],
      b = r.records[i];
    content += `<line x1="${x(a.xM)}" y1="${y(a.yM)}" x2="${x(b.xM)}" y2="${y(b.yM)}" stroke="${b.segmentIncluded ? 'var(--accent)' : '#b2454a'}" stroke-width="3" ${b.segmentIncluded ? '' : 'stroke-dasharray="6 6"'}/>`;
  }
  const stride = Math.max(1, Math.ceil(r.records.length / 300));
  r.records.forEach((s, i) => {
    if (i % stride === 0)
      content += `<circle class="point" cx="${x(s.xM)}" cy="${y(s.yM)}" r="4"/>`;
  });
  const held = sampleAt(r, cursor);
  if (held.sample)
    content += `<circle cx="${x(held.sample.xM)}" cy="${y(held.sample.yM)}" r="10" fill="${held.stale ? '#b2454a' : '#243e52'}" stroke="white" stroke-width="3"/>`;
  content += label(
    68,
    25,
    text(
      'Solid: included interval · dashed: excluded interval',
      'Contínuo: intervalo incluído · tracejado: excluído',
      lang,
    ),
  );
  const state = held.sample
    ? text(
        held.stale ? 'Stale or invalid sample' : 'Recorded sample',
        held.stale ? 'Amostra antiga ou inválida' : 'Amostra registrada',
        lang,
      )
    : text('No sample yet', 'Nenhuma amostra ainda', lang);
  return (
    svg(
      content,
      text(
        'Recorded planar trajectory with excluded intervals',
        'Trajetória plana registrada com intervalos excluídos',
        lang,
      ),
    ) +
    `<p class="visual-note"><strong>${esc(state)}</strong> · ${esc(fmt(cursor, lang, 0))} ms${held.sample ? ` · x=${esc(fmt(held.sample.xM, lang))} m · y=${esc(fmt(held.sample.yM, lang))} m · ${esc(text('age', 'idade', lang))}: ${esc(fmt(held.ageMs, lang, 0))} ms` : ''}</p>`
  );
}
