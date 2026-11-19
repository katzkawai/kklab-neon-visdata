/**
 * データビジュアライゼーション共通ユーティリティ
 * SVG生成、スケール、和文数値フォーマット、色補間、フローティングツールチップ
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgEl(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) {
      el.setAttribute(k, String(v));
    }
  }
  if (parent) parent.appendChild(el);
  return el;
}

export function scaleLinear(domainMin, domainMax, rangeMin, rangeMax) {
  const span = domainMax - domainMin || 1;
  const rSpan = rangeMax - rangeMin;
  const fn = (val) => rangeMin + ((val - domainMin) / span) * rSpan;
  fn.invert = (px) => domainMin + ((px - rangeMin) / (rSpan || 1)) * span;
  return fn;
}

/**
 * 千人単位の数値を「1億2,380万人」「3,624万人」「798万人」形式で整形
 */
export function formatPopMan(thousands, decimals = 0) {
  const man = thousands / 10;
  if (man >= 10000) {
    const oku = Math.floor(man / 10000);
    const rem = Math.round(man - oku * 10000);
    return `${oku}億${rem.toLocaleString('ja-JP')}万人`;
  }
  if (decimals > 0) {
    return `${man.toFixed(decimals)}万人`;
  }
  return `${Math.round(man).toLocaleString('ja-JP')}万人`;
}

export function formatSigned(val, decimals = 2, suffix = '%') {
  const sign = val > 0 ? '+' : val < 0 ? '−' : '';
  return `${sign}${Math.abs(val).toFixed(decimals)}${suffix}`;
}

/**
 * 複数ストップのカラースケール補間（Hex -> Hex）
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function interpolateColorScale(stops, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const idx = Math.min(stops.length - 2, Math.floor(scaled));
  const frac = scaled - idx;
  const [r1, g1, b1] = hexToRgb(stops[idx]);
  const [r2, g2, b2] = hexToRgb(stops[idx + 1]);
  const r = Math.round(r1 + (r2 - r1) * frac);
  const g = Math.round(g1 + (g2 - g1) * frac);
  const b = Math.round(b1 + (b2 - b1) * frac);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 背景色に対する文字色コントラスト判定（WCAG相対輝度）
 */
export function isDarkColor(rgbStr) {
  const m = rgbStr.match(/\d+/g);
  if (!m) return false;
  const [r, g, b] = m.map(Number);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.56;
}

/**
 * 画面端からはみ出さないグローバルツールチップ
 */
let tooltipEl = null;

function ensureTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.getElementById('viz-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'viz-tooltip';
      tooltipEl.className = 'viz-tooltip';
      tooltipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltipEl);
    }
  }
  return tooltipEl;
}

export function showTooltip(html, clientX, clientY) {
  const el = ensureTooltip();
  el.innerHTML = html;
  el.classList.add('is-visible');

  const pad = 14;
  const rect = el.getBoundingClientRect();
  let x = clientX + 16;
  let y = clientY - 12;

  if (x + rect.width > window.innerWidth - pad) {
    x = clientX - rect.width - 16;
  }
  if (y + rect.height > window.innerHeight - pad) {
    y = window.innerHeight - rect.height - pad;
  }
  if (y < pad) y = pad;
  if (x < pad) x = pad;

  el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

export function hideTooltip() {
  const el = ensureTooltip();
  el.classList.remove('is-visible');
}

/**
 * SVG斜線ハッチングパターン（推計領域の明示用）をdefsに追加
 */
export function addProjectionHatchPattern(svg, id = 'projection-hatch', strokeColor = 'rgba(100, 116, 139, 0.22)') {
  let defs = svg.querySelector('defs');
  if (!defs) defs = svgEl('defs', {}, svg);
  const pat = svgEl('pattern', {
    id,
    width: 8,
    height: 8,
    patternUnits: 'userSpaceOnUse',
    patternTransform: 'rotate(45)',
  }, defs);
  svgEl('line', {
    x1: 0, y1: 0, x2: 0, y2: 8,
    stroke: strokeColor,
    'stroke-width': 1.5,
  }, pat);
  return `url(#${id})`;
}
