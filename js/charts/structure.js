/**
 * Viz 2: 年齢3区分別人口の長期推移（1950〜2070年）と「支え手構造」の変容
 * - 積み上げ面グラフ（実数 / 構成比100% 切替）
 * - 出生高位（1.64）・低位（1.13）の予測幅バンド表示
 * - 実績（〜2024年）と将来推計（2025年〜）のハッチング視覚分離
 * - 連動する「胴上げ型 → 騎馬戦型 → 肩車型」支え手ピクトグラム
 */

import { POPULATION_SERIES, getPopulationAtYear } from '../data/population.js';
import {
  svgEl, scaleLinear, formatPopMan, showTooltip, hideTooltip, addProjectionHatchPattern,
} from './utils.js';

const SUPPORT_PRESETS = [1950, 1970, 1990, 2008, 2024, 2040, 2070];

function renderHumanSvg(color, fillFraction = 1) {
  const clipId = `clip-hum-${Math.random().toString(36).slice(2, 8)}`;
  if (fillFraction >= 0.99) {
    return `<svg viewBox="0 0 24 44" class="human-icon" aria-hidden="true">
      <circle cx="12" cy="7" r="4.5" fill="${color}" />
      <path d="M5 18.5C5 15.2 7.6 13 12 13s7 2.2 7 5.5V29h-3.2v12H8.2V29H5V18.5z" fill="${color}" />
    </svg>`;
  }
  const clipW = (24 * Math.max(0.15, fillFraction)).toFixed(1);
  return `<svg viewBox="0 0 24 44" class="human-icon" aria-hidden="true">
    <defs><clipPath id="${clipId}"><rect x="0" y="0" width="${clipW}" height="44" /></clipPath></defs>
    <g opacity="0.2">
      <circle cx="12" cy="7" r="4.5" fill="${color}" />
      <path d="M5 18.5C5 15.2 7.6 13 12 13s7 2.2 7 5.5V29h-3.2v12H8.2V29H5V18.5z" fill="${color}" />
    </g>
    <g clip-path="url(#${clipId})">
      <circle cx="12" cy="7" r="4.5" fill="${color}" />
      <path d="M5 18.5C5 15.2 7.6 13 12 13s7 2.2 7 5.5V29h-3.2v12H8.2V29H5V18.5z" fill="${color}" />
    </g>
  </svg>`;
}

function getSupportMetaphor(ratio) {
  if (ratio >= 8) return { name: '胴上げ型', desc: '大勢の現役世代が高齢者1人を軽々と支える構造' };
  if (ratio >= 3.5) return { name: '騎馬戦型', desc: '数人の現役世代で高齢者1人を支える構造' };
  if (ratio >= 1.8) return { name: '騎馬戦から肩車へ', desc: '現役世代約2人で高齢者1人を支える転換点' };
  return { name: '肩車型', desc: 'ほぼ1人の現役世代が高齢者1人を背負う超高齢社会' };
}

export function initStructureViz() {
  const wrap = document.getElementById('structure-svg-wrap');
  const modeBtns = document.querySelectorAll('[data-structure-mode]');
  const bandToggle = document.getElementById('structure-band-toggle');
  const presetWrap = document.getElementById('support-presets');
  const supportYearEl = document.getElementById('support-year');
  const supportMetaphorEl = document.getElementById('support-metaphor');
  const supportRatioNumEl = document.getElementById('support-ratio-num');
  const supportDescEl = document.getElementById('support-desc');
  const supportWorkersEl = document.getElementById('support-workers-icons');
  const supportElderlyEl = document.getElementById('support-elderly-icon');

  const state = {
    mode: 'count', // 'count' | 'share'
    showBand: true,
    activeYear: 2024,
  };

  // プリセットボタン生成
  presetWrap.innerHTML = '';
  const presetBtns = SUPPORT_PRESETS.map((yr) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mini-year-btn';
    btn.dataset.year = String(yr);
    btn.textContent = `${yr}年`;
    btn.addEventListener('click', () => {
      state.activeYear = yr;
      updateSupportCard(yr);
      updateFocusLine(yr);
    });
    presetWrap.appendChild(btn);
    return btn;
  });

  function updateSupportCard(year) {
    const d = getPopulationAtYear(year);
    const ratio = d.working / d.elderly;
    const meta = getSupportMetaphor(ratio);

    supportYearEl.textContent = `${d.year}年${d.projected ? '（推計）' : '（実績）'}`;
    supportMetaphorEl.textContent = meta.name;
    supportRatioNumEl.textContent = `${ratio.toFixed(1)}人`;
    supportDescEl.textContent = `${meta.desc}（生産年齢 ${formatPopMan(d.working)} ÷ 65歳以上 ${formatPopMan(d.elderly)}）`;

    const fullCount = Math.floor(ratio);
    const frac = ratio - fullCount;
    let html = '';
    for (let i = 0; i < fullCount; i++) {
      html += renderHumanSvg('#2563EB', 1);
    }
    if (frac >= 0.12) {
      html += renderHumanSvg('#2563EB', frac);
    }
    supportWorkersEl.innerHTML = html;
    supportElderlyEl.innerHTML = renderHumanSvg('#DC2626', 1);

    presetBtns.forEach((b) => {
      b.classList.toggle('is-active', Number(b.dataset.year) === Math.round(year));
    });
  }

  let focusLine = null;
  let focusDots = [];
  let xScaleRef = null;
  let yScaleRef = null;

  function updateFocusLine(year) {
    if (!focusLine || !xScaleRef || !yScaleRef) return;
    const d = getPopulationAtYear(year);
    const x = xScaleRef(d.year);
    focusLine.setAttribute('x1', x.toFixed(1));
    focusLine.setAttribute('x2', x.toFixed(1));
    focusLine.style.opacity = '1';

    const sum = d.young + d.working + d.elderly;
    const vals = state.mode === 'count'
      ? [d.elderly, d.elderly + d.working, sum]
      : [
          (d.elderly / sum) * 100,
          ((d.elderly + d.working) / sum) * 100,
          100,
        ];

    focusDots.forEach((dot, i) => {
      dot.setAttribute('cx', x.toFixed(1));
      dot.setAttribute('cy', yScaleRef(vals[i]).toFixed(1));
      dot.style.opacity = '1';
    });
  }

  function renderChart() {
    wrap.innerHTML = '';
    const W = 820;
    const H = 390;
    const margin = { top: 34, right: 112, bottom: 42, left: 62 };
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;

    const svg = svgEl('svg', {
      viewBox: `0 0 ${W} ${H}`,
      class: 'viz-svg',
      role: 'img',
      'aria-label': '年齢3区分別人口の長期推移（1950年〜2070年）',
    }, wrap);

    const hatchUrl = addProjectionHatchPattern(svg, 'struct-hatch', 'rgba(24, 26, 31, 0.14)');

    const xScale = scaleLinear(1950, 2070, margin.left, W - margin.right);
    const yMax = state.mode === 'count' ? 140000 : 100;
    const yScale = scaleLinear(0, yMax, H - margin.bottom, margin.top);
    xScaleRef = xScale;
    yScaleRef = yScale;

    // グリッドとY軸
    const yTicks = state.mode === 'count' ? [0, 20000, 40000, 60000, 80000, 100000, 120000, 140000] : [0, 25, 50, 75, 100];
    yTicks.forEach((t) => {
      const y = yScale(t);
      svgEl('line', {
        x1: margin.left, y1: y, x2: W - margin.right, y2: y,
        class: t === 0 ? 'chart-axis-line' : 'chart-grid-line',
      }, svg);
      const label = state.mode === 'count'
        ? (t === 0 ? '0' : `${t / 10000}千万`)
        : `${t}%`;
      svgEl('text', {
        x: margin.left - 10, y: y + 4, 'text-anchor': 'end', class: 'axis-tick-label',
      }, svg).textContent = label;
    });

    // X軸目盛り
    [1950, 1970, 1990, 2010, 2024, 2040, 2060, 2070].forEach((yr) => {
      const x = xScale(yr);
      svgEl('line', {
        x1: x, y1: H - margin.bottom, x2: x, y2: H - margin.bottom + 5,
        stroke: yr === 2024 ? '#181A1F' : '#CBD5E1',
      }, svg);
      svgEl('text', {
        x, y: H - margin.bottom + 19, 'text-anchor': 'middle',
        class: yr === 2024 ? 'axis-tick-label is-bold' : 'axis-tick-label',
      }, svg).textContent = `${yr}`;
    });

    // 積み上げ座標の構築（下から：老年人口 → 生産年齢人口 → 年少人口）
    // 老年人口を底辺に置くことで、高齢化面積の拡大が一目でわかる
    const pts = POPULATION_SERIES.map((d) => {
      const sum = d.young + d.working + d.elderly;
      const toVal = (v) => (state.mode === 'count' ? v : (v / sum) * 100);
      const eTop = toVal(d.elderly);
      const wTop = toVal(d.elderly + d.working);
      const yTop = state.mode === 'count' ? sum : 100;
      return { ...d, x: xScale(d.year), eTop, wTop, yTop };
    });

    function buildAreaPath(getBottom, getTop) {
      const topPts = pts.map((p) => `${p.x.toFixed(1)},${yScale(getTop(p)).toFixed(1)}`).join(' L ');
      const botPts = [...pts].reverse().map((p) => `${p.x.toFixed(1)},${yScale(getBottom(p)).toFixed(1)}`).join(' L ');
      return `M ${topPts} L ${botPts} Z`;
    }

    // 面グラフ描画
    svgEl('path', { d: buildAreaPath(() => 0, (p) => p.eTop), fill: '#DC2626', 'fill-opacity': 0.85 }, svg);
    svgEl('path', { d: buildAreaPath((p) => p.eTop, (p) => p.wTop), fill: '#2563EB', 'fill-opacity': 0.80 }, svg);
    svgEl('path', { d: buildAreaPath((p) => p.wTop, (p) => p.yTop), fill: '#0D9488', 'fill-opacity': 0.82 }, svg);

    // 推計領域（2024〜2070年）の斜線オーバーレイ
    const x2024 = xScale(2024);
    const clipId = 'proj-area-clip';
    const defs = svg.querySelector('defs') || svgEl('defs', {}, svg);
    const cp = svgEl('clipPath', { id: clipId }, defs);
    svgEl('rect', {
      x: x2024, y: margin.top, width: W - margin.right - x2024, height: plotH,
    }, cp);
    svgEl('path', {
      d: buildAreaPath(() => 0, (p) => p.yTop),
      fill: hatchUrl,
      'clip-path': `url(#${clipId})`,
      'pointer-events': 'none',
    }, svg);

    // 出生高位・低位の予測幅バンド（実数モード時のみ）
    if (state.mode === 'count' && state.showBand) {
      const projPts = POPULATION_SERIES.filter((d) => d.year >= 2024).map((d) => ({
        x: xScale(d.year),
        high: d.totalHigh ?? d.total,
        low: d.totalLow ?? d.total,
      }));
      const highLine = projPts.map((p) => `${p.x.toFixed(1)},${yScale(p.high).toFixed(1)}`).join(' L ');
      const lowLine = projPts.map((p) => `${p.x.toFixed(1)},${yScale(p.low).toFixed(1)}`).join(' L ');
      const bandD = `M ${highLine} L ${[...projPts].reverse().map((p) => `${p.x.toFixed(1)},${yScale(p.low).toFixed(1)}`).join(' L ')} Z`;

      svgEl('path', { d: bandD, fill: '#181A1F', 'fill-opacity': 0.08, 'pointer-events': 'none' }, svg);
      svgEl('path', { d: `M ${highLine}`, fill: 'none', stroke: '#181A1F', 'stroke-width': 1.4, 'stroke-dasharray': '4,3', opacity: 0.75 }, svg);
      svgEl('path', { d: `M ${lowLine}`, fill: 'none', stroke: '#181A1F', 'stroke-width': 1.4, 'stroke-dasharray': '4,3', opacity: 0.75 }, svg);

      const lastP = projPts[projPts.length - 1];
      svgEl('text', { x: lastP.x + 6, y: yScale(lastP.high) - 2, class: 'band-end-label' }, svg).textContent = '高位 9,549万';
      svgEl('text', { x: lastP.x + 6, y: yScale(lastP.low) + 11, class: 'band-end-label' }, svg).textContent = '低位 8,024万';
    }

    // 総人口アウトライン
    const totalLineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${yScale(p.yTop).toFixed(1)}`).join(' ');
    svgEl('path', { d: totalLineD, fill: 'none', stroke: '#181A1F', 'stroke-width': 2 }, svg);

    // 実績・推計の境界線（2024年）
    svgEl('line', {
      x1: x2024, y1: margin.top - 6, x2: x2024, y2: H - margin.bottom,
      stroke: '#181A1F', 'stroke-width': 1.5, 'stroke-dasharray': '4,3',
    }, svg);
    svgEl('text', { x: x2024 - 8, y: margin.top - 12, 'text-anchor': 'end', class: 'zone-label' }, svg).textContent = '← 実績（国勢調査・人口推計）';
    svgEl('text', { x: x2024 + 8, y: margin.top - 12, 'text-anchor': 'start', class: 'zone-label is-proj' }, svg).textContent = '将来推計（令和5年推計） →';

    // 2008年ピーク＆2056年1億人割れの注釈（実数モード時）
    if (state.mode === 'count') {
      const peakX = xScale(2008);
      const peakY = yScale(128084);
      svgEl('circle', { cx: peakX, cy: peakY, r: 4, fill: '#181A1F', stroke: '#FAF9F6', 'stroke-width': 1.5 }, svg);
      svgEl('text', { x: peakX - 6, y: peakY - 10, 'text-anchor': 'end', class: 'annot-bold' }, svg).textContent = '2008年ピーク 1億2,808万人';

      const x100m = xScale(2056);
      const y100m = yScale(100000);
      svgEl('line', {
        x1: margin.left, y1: y100m, x2: W - margin.right, y2: y100m,
        stroke: '#64748B', 'stroke-width': 1, 'stroke-dasharray': '2,4', opacity: 0.7,
      }, svg);
      svgEl('circle', { cx: x100m, cy: y100m, r: 3.5, fill: '#DC2626' }, svg);
      svgEl('text', { x: x100m + 6, y: y100m - 8, class: 'annot-sub' }, svg).textContent = '2056年 1億人割れ';
    }

    // 右端の直接ラベル（2070年構成）
    const end = pts[pts.length - 1];
    const rightLabels = [
      { y: yScale((0 + end.eTop) / 2), text: '65歳以上', sub: '38.7%', color: '#DC2626' },
      { y: yScale((end.eTop + end.wTop) / 2), text: '15–64歳', sub: '52.1%', color: '#2563EB' },
      { y: yScale((end.wTop + end.yTop) / 2), text: '0–14歳', sub: '9.2%', color: '#0D9488' },
    ];
    if (!(state.mode === 'count' && state.showBand)) {
      rightLabels.forEach((rl) => {
        const g = svgEl('g', {}, svg);
        svgEl('text', { x: W - margin.right + 8, y: rl.y - 2, fill: rl.color, class: 'direct-end-label' }, g).textContent = rl.text;
        svgEl('text', { x: W - margin.right + 8, y: rl.y + 12, fill: '#475569', class: 'direct-end-sub' }, g).textContent = `2070年 ${rl.sub}`;
      });
    } else {
      // バンド表示時は位置を少し下に調整して重複回避
      const bandSafeLabels = [
        { y: yScale(end.eTop * 0.5), text: '65歳以上 38.7%', color: '#DC2626' },
        { y: yScale(end.eTop + (end.wTop - end.eTop) * 0.52), text: '15–64歳 52.1%', color: '#2563EB' },
        { y: yScale(end.yTop) - 2, text: '中位 8,700万', color: '#0D9488' },
      ];
      bandSafeLabels.forEach((rl) => {
        svgEl('text', { x: W - margin.right + 6, y: rl.y + 4, fill: rl.color, class: 'direct-end-label' }, svg).textContent = rl.text;
      });
    }

    // インタラクティブフォーカス線とドット
    focusLine = svgEl('line', {
      x1: xScale(state.activeYear), y1: margin.top, x2: xScale(state.activeYear), y2: H - margin.bottom,
      stroke: '#181A1F', 'stroke-width': 1.2, opacity: 0.85, 'pointer-events': 'none',
    }, svg);
    focusDots = ['#DC2626', '#2563EB', '#0D9488'].map((col) =>
      svgEl('circle', {
        r: 4.5, fill: col, stroke: '#FAF9F6', 'stroke-width': 1.8, 'pointer-events': 'none',
      }, svg),
    );
    updateFocusLine(state.activeYear);

    // マウス・タッチ検知オーバーレイ
    const overlay = svgEl('rect', {
      x: margin.left, y: margin.top, width: plotW, height: plotH,
      fill: 'transparent', style: 'cursor: crosshair;',
    }, svg);

    const handleMove = (e) => {
      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * W;
      const rawYear = Math.round(xScale.invert(svgX));
      const yr = Math.max(1950, Math.min(2070, rawYear));
      state.activeYear = yr;
      const d = getPopulationAtYear(yr);
      const sum = d.young + d.working + d.elderly;
      const ratio = (d.working / d.elderly).toFixed(1);

      updateFocusLine(yr);
      updateSupportCard(yr);

      showTooltip(`
        <div class="tt-head">${d.year}年 ${d.projected ? '<span class="tt-tag">推計</span>' : '<span class="tt-tag is-actual">実績</span>'}</div>
        <div class="tt-sub">総人口 <strong>${formatPopMan(d.total)}</strong> · 支え手比率 <strong>${ratio}人</strong></div>
        <div class="tt-grid">
          <span><i class="dot dot-young"></i>0–14歳</span><strong>${formatPopMan(d.young)}（${((d.young / sum) * 100).toFixed(1)}%）</strong>
          <span><i class="dot dot-working"></i>15–64歳</span><strong>${formatPopMan(d.working)}（${((d.working / sum) * 100).toFixed(1)}%）</strong>
          <span><i class="dot dot-elderly"></i>65歳以上</span><strong>${formatPopMan(d.elderly)}（${((d.elderly / sum) * 100).toFixed(1)}%）</strong>
        </div>
      `, e.clientX, e.clientY);
    };

    overlay.addEventListener('pointermove', handleMove);
    overlay.addEventListener('pointerleave', hideTooltip);
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.mode = btn.dataset.structureMode;
      bandToggle.disabled = state.mode !== 'count';
      bandToggle.closest('.toggle-label')?.classList.toggle('is-disabled', state.mode !== 'count');
      renderChart();
    });
  });

  bandToggle.addEventListener('change', () => {
    state.showBand = bandToggle.checked;
    renderChart();
  });

  renderChart();
  updateSupportCard(state.activeYear);
}
