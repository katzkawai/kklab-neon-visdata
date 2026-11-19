/**
 * Viz 5: 高齢化スピードの国際比較
 * - 左：主要7か国の高齢化率推移（1950〜2050年）＋ 7%/14%/21% 国際基準ライン
 * - 右：高齢化率「倍加年数（7%→14% 所要年数）」比較バーチャート
 */

import {
  DOUBLING_YEARS, INTERNATIONAL_YEARS, INTERNATIONAL_TRAJECTORIES,
} from '../data/international.js';
import { svgEl, scaleLinear, showTooltip, hideTooltip } from './utils.js';

export function initInternationalViz() {
  const trajWrap = document.getElementById('intl-traj-wrap');
  const doubleWrap = document.getElementById('intl-doubling-wrap');
  const legendWrap = document.getElementById('intl-legend');

  let activeCountry = null;

  // --- 1. 推移トラジェクトリチャート ---
  const W = 600;
  const H = 370;
  const m = { top: 28, right: 118, bottom: 42, left: 50 };
  const xScale = scaleLinear(1950, 2050, m.left, W - m.right);
  const yScale = scaleLinear(0, 44, H - m.bottom, m.top);

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'viz-svg',
    role: 'img',
    'aria-label': '主要国の高齢化率推移（1950年〜2050年）',
  }, trajWrap);

  // 2024年以降の推計領域を薄く網掛け
  const x2024 = xScale(2024);
  svgEl('rect', {
    x: x2024, y: m.top, width: W - m.right - x2024, height: H - m.bottom - m.top,
    fill: 'rgba(100, 116, 139, 0.06)',
  }, svg);
  svgEl('line', {
    x1: x2024, y1: m.top, x2: x2024, y2: H - m.bottom,
    stroke: '#94A3B8', 'stroke-width': 1, 'stroke-dasharray': '3,3',
  }, svg);
  svgEl('text', { x: x2024 + 5, y: m.top + 12, class: 'zone-label is-proj' }, svg).textContent = '推計 →';

  // 7%, 14%, 21% 国際基準ライン
  [
    { v: 7, text: '7% 高齢化社会' },
    { v: 14, text: '14% 高齢社会' },
    { v: 21, text: '21% 超高齢社会' },
  ].forEach((thr) => {
    const y = yScale(thr.v);
    svgEl('line', {
      x1: m.left, y1: y, x2: W - m.right, y2: y,
      stroke: '#CBD5E1', 'stroke-width': 1.1, 'stroke-dasharray': '4,3',
    }, svg);
    svgEl('text', {
      x: m.left + 4, y: y - 4, class: 'intl-threshold-label',
    }, svg).textContent = thr.text;
  });

  // Y軸・X軸目盛り
  [0, 10, 20, 30, 40].forEach((v) => {
    const y = yScale(v);
    svgEl('text', { x: m.left - 8, y: y + 4, 'text-anchor': 'end', class: 'axis-tick-label' }, svg).textContent = `${v}%`;
  });
  [1950, 1970, 1990, 2010, 2030, 2050].forEach((yr) => {
    const x = xScale(yr);
    svgEl('text', { x, y: H - m.bottom + 18, 'text-anchor': 'middle', class: 'axis-tick-label' }, svg).textContent = String(yr);
  });

  // 2050年の右端ラベル重なり解消オフセット
  const endLabelOffsets = {
    kr: -2,
    jp: 2,
    cn: -8,
    de: 3,
    fr: 6,
    se: 3,
    us: 5,
  };

  const lineRefs = new Map();
  INTERNATIONAL_TRAJECTORIES.forEach((c) => {
    const g = svgEl('g', { class: `intl-series ${c.emphasis ? 'is-japan' : ''}` }, svg);
    const d = c.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(INTERNATIONAL_YEARS[i]).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
    const path = svgEl('path', {
      d,
      fill: 'none',
      stroke: c.color,
      'stroke-width': c.emphasis ? 3.2 : 1.9,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      opacity: c.emphasis ? 1 : 0.72,
    }, g);

    const endVal = c.values[c.values.length - 1];
    const endX = xScale(2050);
    const endY = yScale(endVal) + (endLabelOffsets[c.id] || 0);
    svgEl('circle', { cx: endX, cy: yScale(endVal), r: c.emphasis ? 4 : 2.8, fill: c.color }, g);
    const lbl = svgEl('text', {
      x: endX + 7, y: endY + 3, fill: c.color,
      class: c.emphasis ? 'direct-end-label' : 'direct-end-sub',
      'font-weight': c.emphasis ? 700 : 600,
    }, g);
    lbl.textContent = `${c.name} ${endVal.toFixed(1)}%`;

    lineRefs.set(c.id, { g, path, c });
  });

  // クロスヘアインタラクション
  const guide = svgEl('line', {
    y1: m.top, y2: H - m.bottom, stroke: '#181A1F', 'stroke-width': 1, opacity: 0, 'pointer-events': 'none',
  }, svg);
  const hit = svgEl('rect', {
    x: m.left, y: m.top, width: W - m.left - m.right, height: H - m.bottom - m.top,
    fill: 'transparent', style: 'cursor: crosshair;',
  }, svg);

  hit.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const yrRaw = xScale.invert(svgX);
    let idx = 0;
    let minD = Infinity;
    INTERNATIONAL_YEARS.forEach((yr, i) => {
      const dist = Math.abs(yr - yrRaw);
      if (dist < minD) { minD = dist; idx = i; }
    });
    const yr = INTERNATIONAL_YEARS[idx];
    const x = xScale(yr);
    guide.setAttribute('x1', x);
    guide.setAttribute('x2', x);
    guide.style.opacity = '0.75';

    const rows = [...INTERNATIONAL_TRAJECTORIES]
      .sort((a, b) => b.values[idx] - a.values[idx])
      .map((c) => `
        <span><i class="dot" style="background:${c.color}"></i>${c.name}</span>
        <strong>${c.values[idx].toFixed(1)}%</strong>
      `).join('');

    showTooltip(`
      <div class="tt-head">${yr}年 高齢化率（65歳以上）${yr > 2024 ? ' <span class="tt-tag">推計</span>' : ''}</div>
      <div class="tt-grid">${rows}</div>
    `, e.clientX, e.clientY);
  });
  hit.addEventListener('pointerleave', () => {
    guide.style.opacity = '0';
    hideTooltip();
  });

  // --- 2. 倍加年数（7%→14%）バーチャート ---
  const BW = 430;
  const BH = 370;
  const bm = { top: 26, right: 64, bottom: 38, left: 96 };
  const bx = scaleLinear(0, 140, bm.left, BW - bm.right);
  const rowStep = (BH - bm.top - bm.bottom) / DOUBLING_YEARS.length;
  const barH = Math.max(16, rowStep - 10);

  const bSvg = svgEl('svg', {
    viewBox: `0 0 ${BW} ${BH}`,
    class: 'viz-svg',
    role: 'img',
    'aria-label': '高齢化率7%から14%への倍加年数の国際比較',
  }, doubleWrap);

  // X軸グリッド
  [0, 25, 50, 75, 100, 125].forEach((v) => {
    const x = bx(v);
    svgEl('line', { x1: x, y1: bm.top, x2: x, y2: BH - bm.bottom, class: v === 0 ? 'chart-axis-line' : 'chart-grid-line' }, bSvg);
    svgEl('text', { x, y: BH - bm.bottom + 18, 'text-anchor': 'middle', class: 'axis-tick-label' }, bSvg).textContent = `${v}年`;
  });

  const barRefs = new Map();
  DOUBLING_YEARS.forEach((d, i) => {
    const y = bm.top + i * rowStep + (rowStep - barH) / 2;
    const isJapan = d.id === 'jp';
    const g = svgEl('g', { class: `doubling-row ${isJapan ? 'is-japan' : ''}` }, bSvg);

    svgEl('rect', {
      x: 4, y: y - 4, width: BW - 8, height: barH + 8, rx: 4,
      fill: isJapan ? 'rgba(220, 38, 38, 0.07)' : 'transparent',
      class: 'doubling-hit',
    }, g);

    svgEl('text', {
      x: bm.left - 10, y: y + barH / 2 + 4, 'text-anchor': 'end',
      class: isJapan ? 'axis-tick-label is-bold' : 'axis-tick-label',
      fill: isJapan ? '#DC2626' : '#334155',
    }, g).textContent = d.name;

    const w = Math.max(4, bx(d.years) - bm.left);
    svgEl('rect', {
      x: bm.left, y, width: w, height: barH, rx: 3,
      fill: isJapan ? '#DC2626' : d.region === 'asia' ? '#D97706' : '#64748B',
      'fill-opacity': isJapan ? 0.95 : 0.72,
    }, g);

    svgEl('text', {
      x: bm.left + w + 8, y: y + barH / 2 + 4,
      class: isJapan ? 'direct-end-label' : 'axis-tick-label',
      fill: isJapan ? '#DC2626' : '#334155',
    }, g).textContent = `${d.years}年`;

    g.addEventListener('pointerenter', (e) => {
      activeCountry = d.id;
      syncCountryHighlight();
      showTooltip(`
        <div class="tt-head">${d.name}：倍加年数 <strong>${d.years}年</strong></div>
        <div class="tt-grid">
          <span>7%到達（高齢化社会）</span><strong>${d.reached7}年</strong>
          <span>14%到達（高齢社会）</span><strong>${d.reached14}年</strong>
          <span>21%到達（超高齢社会）</span><strong>${d.reached21}年${d.reached21 > 2024 ? '（推計）' : ''}</strong>
        </div>
      `, e.clientX, e.clientY);
    });
    g.addEventListener('pointermove', (e) => {
      showTooltip(`
        <div class="tt-head">${d.name}：倍加年数 <strong>${d.years}年</strong></div>
        <div class="tt-grid">
          <span>7%到達（高齢化社会）</span><strong>${d.reached7}年</strong>
          <span>14%到達（高齢社会）</span><strong>${d.reached14}年</strong>
          <span>21%到達（超高齢社会）</span><strong>${d.reached21}年${d.reached21 > 2024 ? '（推計）' : ''}</strong>
        </div>
      `, e.clientX, e.clientY);
    });
    g.addEventListener('pointerleave', () => {
      activeCountry = null;
      syncCountryHighlight();
      hideTooltip();
    });

    barRefs.set(d.id, g);
  });

  // 凡例チップ（ホバーで連動強調）
  legendWrap.innerHTML = '';
  const legendChips = INTERNATIONAL_TRAJECTORIES.map((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `region-chip ${c.emphasis ? 'is-japan-chip' : ''}`;
    btn.dataset.country = c.id;
    btn.innerHTML = `<i class="region-dot" style="background:${c.color}"></i>${c.name}`;
    btn.addEventListener('pointerenter', () => {
      activeCountry = c.id;
      syncCountryHighlight();
    });
    btn.addEventListener('pointerleave', () => {
      activeCountry = null;
      syncCountryHighlight();
    });
    btn.addEventListener('click', () => {
      activeCountry = activeCountry === c.id ? null : c.id;
      syncCountryHighlight();
    });
    legendWrap.appendChild(btn);
    return btn;
  });

  function syncCountryHighlight() {
    lineRefs.forEach(({ g, path, c }) => {
      if (!activeCountry) {
        g.style.opacity = '1';
        path.setAttribute('stroke-width', c.emphasis ? '3.2' : '1.9');
        path.setAttribute('opacity', c.emphasis ? '1' : '0.72');
      } else {
        const match = c.id === activeCountry;
        g.style.opacity = match ? '1' : '0.2';
        path.setAttribute('stroke-width', match ? '3.4' : '1.5');
        path.setAttribute('opacity', '1');
        if (match) g.parentNode.appendChild(g);
      }
    });

    barRefs.forEach((g, id) => {
      g.style.opacity = !activeCountry || id === activeCountry ? '1' : '0.32';
    });

    legendChips.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.country === activeCountry);
    });
  }
}
