/**
 * Viz 3: 出生数・死亡数（自然増減の「ワニの口」）と合計特殊出生率（1947〜2024年）
 * - 上段：出生数 vs 死亡数（自然増をティール、自然減をクリムゾンで塗り分け）
 * - 下段：合計特殊出生率（人口置換水準 2.07 の基準線と下回り領域の可視化）
 * - 上下2グラフの時間軸完全連動クロスヘア＋統合ツールチップ
 */

import { VITALS_SERIES, REPLACEMENT_TFR } from '../data/vitals.js';
import { svgEl, scaleLinear, formatSigned, showTooltip, hideTooltip } from './utils.js';

export function initVitalsViz() {
  const wrap = document.getElementById('vitals-svg-wrap');
  wrap.innerHTML = '';

  const W = 880;
  const H = 530;
  const margin = { left: 64, right: 98, top: 34, bottom: 38 };
  const topPlotTop = margin.top;
  const topPlotH = 235;
  const topPlotBottom = topPlotTop + topPlotH;
  const gap = 58;
  const botPlotTop = topPlotBottom + gap;
  const botPlotH = H - botPlotTop - margin.bottom;
  const botPlotBottom = botPlotTop + botPlotH;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'viz-svg',
    role: 'img',
    'aria-label': '出生数・死亡数と合計特殊出生率の推移（1947年〜2024年）',
  }, wrap);

  const xScale = scaleLinear(1947, 2024, margin.left, W - margin.right);
  const yTop = scaleLinear(0, 2900, topPlotBottom, topPlotTop); // 千人
  const yBot = scaleLinear(0.8, 4.8, botPlotBottom, botPlotTop); // TFR

  // セクション小見出し（SVG内）
  svgEl('text', { x: margin.left, y: topPlotTop - 14, class: 'subchart-title' }, svg).textContent = 'A. 年間出生数と死亡数（自然増減の推移）';
  svgEl('text', { x: margin.left, y: botPlotTop - 16, class: 'subchart-title' }, svg).textContent = 'B. 合計特殊出生率と人口置換水準（2.07）';

  // --- 上段グリッド ---
  [0, 500, 1000, 1500, 2000, 2500].forEach((t) => {
    const y = yTop(t);
    svgEl('line', {
      x1: margin.left, y1: y, x2: W - margin.right, y2: y,
      class: t === 0 ? 'chart-axis-line' : 'chart-grid-line',
    }, svg);
    svgEl('text', {
      x: margin.left - 10, y: y + 4, 'text-anchor': 'end', class: 'axis-tick-label',
    }, svg).textContent = t === 0 ? '0' : `${t / 10}万`;
  });

  // --- 下段グリッド ---
  [1.0, 2.0, 3.0, 4.0].forEach((t) => {
    const y = yBot(t);
    svgEl('line', {
      x1: margin.left, y1: y, x2: W - margin.right, y2: y,
      class: 'chart-grid-line',
    }, svg);
    svgEl('text', {
      x: margin.left - 10, y: y + 4, 'text-anchor': 'end', class: 'axis-tick-label',
    }, svg).textContent = t.toFixed(1);
  });

  // X軸目盛り（下段底辺＋上段薄い縦線）
  [1950, 1960, 1970, 1980, 1990, 2000, 2005, 2015, 2024].forEach((yr) => {
    const x = xScale(yr);
    svgEl('line', {
      x1: x, y1: topPlotTop, x2: x, y2: topPlotBottom,
      stroke: yr === 2005 ? 'rgba(220,38,38,0.28)' : 'rgba(148,163,184,0.16)',
      'stroke-dasharray': yr === 2005 ? '3,3' : 'none',
    }, svg);
    svgEl('line', {
      x1: x, y1: botPlotTop, x2: x, y2: botPlotBottom,
      stroke: yr === 2005 ? 'rgba(220,38,38,0.28)' : 'rgba(148,163,184,0.16)',
      'stroke-dasharray': yr === 2005 ? '3,3' : 'none',
    }, svg);
    svgEl('text', {
      x, y: botPlotBottom + 20, 'text-anchor': 'middle',
      class: yr === 2024 ? 'axis-tick-label is-bold' : 'axis-tick-label',
    }, svg).textContent = String(yr);
  });

  // --- 上段：自然増（ティール）・自然減（クリムゾン）の塗り分け ---
  // 各隣接区間で交差点を計算し、ポリゴンを厳密に塗り分ける
  for (let i = 0; i < VITALS_SERIES.length - 1; i++) {
    const a = VITALS_SERIES[i];
    const b = VITALS_SERIES[i + 1];
    const da = a.births - a.deaths;
    const db = b.births - b.deaths;
    const xa = xScale(a.year);
    const xb = xScale(b.year);

    if ((da >= 0 && db >= 0) || (da <= 0 && db <= 0)) {
      const isPos = da + db >= 0;
      const dPath = `M ${xa.toFixed(1)},${yTop(a.births).toFixed(1)} L ${xb.toFixed(1)},${yTop(b.births).toFixed(1)} L ${xb.toFixed(1)},${yTop(b.deaths).toFixed(1)} L ${xa.toFixed(1)},${yTop(a.deaths).toFixed(1)} Z`;
      svgEl('path', {
        d: dPath,
        fill: isPos ? '#0D9488' : '#DC2626',
        'fill-opacity': isPos ? 0.14 : 0.22,
      }, svg);
    } else {
      // 交差区間を2分割
      const t = Math.abs(da) / (Math.abs(da) + Math.abs(db));
      const xm = xa + (xb - xa) * t;
      const ym = yTop(a.births + (b.births - a.births) * t);

      const d1 = `M ${xa.toFixed(1)},${yTop(a.births).toFixed(1)} L ${xm.toFixed(1)},${ym.toFixed(1)} L ${xa.toFixed(1)},${yTop(a.deaths).toFixed(1)} Z`;
      svgEl('path', {
        d: d1,
        fill: da >= 0 ? '#0D9488' : '#DC2626',
        'fill-opacity': da >= 0 ? 0.14 : 0.22,
      }, svg);

      const d2 = `M ${xm.toFixed(1)},${ym.toFixed(1)} L ${xb.toFixed(1)},${yTop(b.births).toFixed(1)} L ${xb.toFixed(1)},${yTop(b.deaths).toFixed(1)} Z`;
      svgEl('path', {
        d: d2,
        fill: db >= 0 ? '#0D9488' : '#DC2626',
        'fill-opacity': db >= 0 ? 0.14 : 0.22,
      }, svg);
    }
  }

  // 領域内ラベル（自然増 / 自然減）
  svgEl('text', { x: xScale(1972), y: yTop(1260), 'text-anchor': 'middle', class: 'area-inner-label is-pos' }, svg).textContent = '自然増（出生 ＞ 死亡）';
  svgEl('text', { x: xScale(2018.5), y: yTop(1160), 'text-anchor': 'middle', class: 'area-inner-label is-neg' }, svg).textContent = '自然減';

  // 出生数・死亡数の折れ線
  const birthLine = VITALS_SERIES.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year).toFixed(1)},${yTop(d.births).toFixed(1)}`).join(' ');
  const deathLine = VITALS_SERIES.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year).toFixed(1)},${yTop(d.deaths).toFixed(1)}`).join(' ');

  svgEl('path', { d: birthLine, fill: 'none', stroke: '#0D9488', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, svg);
  svgEl('path', { d: deathLine, fill: 'none', stroke: '#DC2626', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, svg);

  // 上段の右端直接ラベル（2024年）
  const last = VITALS_SERIES[VITALS_SERIES.length - 1];
  svgEl('circle', { cx: xScale(last.year), cy: yTop(last.deaths), r: 4, fill: '#DC2626' }, svg);
  svgEl('text', { x: xScale(last.year) + 8, y: yTop(last.deaths) - 2, fill: '#DC2626', class: 'direct-end-label' }, svg).textContent = '死亡数';
  svgEl('text', { x: xScale(last.year) + 8, y: yTop(last.deaths) + 12, fill: '#DC2626', class: 'direct-end-sub' }, svg).textContent = '160.5万人';

  svgEl('circle', { cx: xScale(last.year), cy: yTop(last.births), r: 4, fill: '#0D9488' }, svg);
  svgEl('text', { x: xScale(last.year) + 8, y: yTop(last.births) - 2, fill: '#0D9488', class: 'direct-end-label' }, svg).textContent = '出生数';
  svgEl('text', { x: xScale(last.year) + 8, y: yTop(last.births) + 12, fill: '#0D9488', class: 'direct-end-sub' }, svg).textContent = '68.6万人';

  // 上段の主要アノテーション
  const topAnnots = [
    { year: 1949, val: 2696.6, text: '第1次ベビーブーム (269.7万)', dx: 6, dy: -10, anchor: 'start' },
    { year: 1973, val: 2092.0, text: '第2次ベビーブーム (209.2万)', dx: 0, dy: -14, anchor: 'middle' },
    { year: 2005, val: 1083.8, text: '2005年 初の自然減', dx: -6, dy: -26, anchor: 'end', lineTo: true },
    { year: 2016, val: 977.0, text: '100万人割れ', dx: -4, dy: 28, anchor: 'end', lineTo: true },
  ];
  topAnnots.forEach((a) => {
    const cx = xScale(a.year);
    const cy = yTop(a.val);
    svgEl('circle', { cx, cy, r: 3.2, fill: '#181A1F', stroke: '#FAF9F6', 'stroke-width': 1.2 }, svg);
    if (a.lineTo) {
      svgEl('line', {
        x1: cx, y1: cy, x2: cx + a.dx, y2: cy + a.dy + (a.dy > 0 ? -10 : 4),
        stroke: '#64748B', 'stroke-width': 1,
      }, svg);
    }
    svgEl('text', {
      x: cx + a.dx, y: cy + a.dy, 'text-anchor': a.anchor, class: 'annot-sub',
    }, svg).textContent = a.text;
  });

  // --- 下段：合計特殊出生率と人口置換水準 2.07 ---
  const yRep = yBot(REPLACEMENT_TFR);

  // 1974年以降、置換水準2.07を下回る乖離領域を薄く塗りつぶし
  const belowPts = VITALS_SERIES.filter((d) => d.year >= 1974);
  if (belowPts.length > 1) {
    const lineSeg = belowPts.map((d) => `${xScale(d.year).toFixed(1)},${yBot(d.tfr).toFixed(1)}`).join(' L ');
    const xStart = xScale(belowPts[0].year).toFixed(1);
    const xEnd = xScale(belowPts[belowPts.length - 1].year).toFixed(1);
    svgEl('path', {
      d: `M ${xStart},${yRep.toFixed(1)} L ${lineSeg} L ${xEnd},${yRep.toFixed(1)} Z`,
      fill: '#D97706',
      'fill-opacity': 0.14,
    }, svg);
  }

  // 置換水準2.07の水平破線
  svgEl('line', {
    x1: margin.left, y1: yRep, x2: W - margin.right, y2: yRep,
    stroke: '#475569', 'stroke-width': 1.4, 'stroke-dasharray': '5,4',
  }, svg);
  svgEl('text', {
    x: W - margin.right + 8, y: yRep + 4, class: 'direct-end-sub', fill: '#475569',
  }, svg).textContent = '置換水準 2.07';

  // TFR折れ線
  const tfrLine = VITALS_SERIES.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year).toFixed(1)},${yBot(d.tfr).toFixed(1)}`).join(' ');
  svgEl('path', { d: tfrLine, fill: 'none', stroke: '#B45309', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, svg);

  // 右端の2024年TFRラベル
  svgEl('circle', { cx: xScale(last.year), cy: yBot(last.tfr), r: 4, fill: '#B45309' }, svg);
  svgEl('text', { x: xScale(last.year) + 8, y: yBot(last.tfr) + 4, fill: '#B45309', class: 'direct-end-label' }, svg).textContent = '2024年 1.15';

  // 下段アノテーション
  const botAnnots = [
    { year: 1947, val: 4.54, text: '1947年 4.54', dx: 8, dy: 4, anchor: 'start' },
    { year: 1966, val: 1.58, text: 'ひのえうま (1.58)', dx: 0, dy: 18, anchor: 'middle' },
    { year: 1989, val: 1.57, text: '1.57ショック', dx: -4, dy: 18, anchor: 'end' },
    { year: 2005, val: 1.26, text: '2005年 1.26', dx: 0, dy: 18, anchor: 'middle' },
  ];
  botAnnots.forEach((a) => {
    const cx = xScale(a.year);
    const cy = yBot(a.val);
    svgEl('circle', { cx, cy, r: 3.2, fill: '#B45309', stroke: '#FAF9F6', 'stroke-width': 1.2 }, svg);
    svgEl('text', {
      x: cx + a.dx, y: cy + a.dy, 'text-anchor': a.anchor, class: 'annot-sub',
    }, svg).textContent = a.text;
  });

  // --- 上下連動クロスヘア ---
  const guideTop = svgEl('line', {
    y1: topPlotTop, y2: topPlotBottom, stroke: '#181A1F', 'stroke-width': 1.1, opacity: 0, 'pointer-events': 'none',
  }, svg);
  const guideBot = svgEl('line', {
    y1: botPlotTop, y2: botPlotBottom, stroke: '#181A1F', 'stroke-width': 1.1, opacity: 0, 'pointer-events': 'none',
  }, svg);
  const dotBirth = svgEl('circle', { r: 4.5, fill: '#0D9488', stroke: '#FAF9F6', 'stroke-width': 1.8, opacity: 0, 'pointer-events': 'none' }, svg);
  const dotDeath = svgEl('circle', { r: 4.5, fill: '#DC2626', stroke: '#FAF9F6', 'stroke-width': 1.8, opacity: 0, 'pointer-events': 'none' }, svg);
  const dotTfr = svgEl('circle', { r: 4.5, fill: '#B45309', stroke: '#FAF9F6', 'stroke-width': 1.8, opacity: 0, 'pointer-events': 'none' }, svg);

  // インタラクション検知エリア
  const hitRect = svgEl('rect', {
    x: margin.left, y: topPlotTop, width: W - margin.left - margin.right, height: botPlotBottom - topPlotTop,
    fill: 'transparent', style: 'cursor: crosshair;',
  }, svg);

  hitRect.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const hoverYear = xScale.invert(svgX);

    // 最も近い年次データ点を探索
    let nearest = VITALS_SERIES[0];
    let minD = Infinity;
    for (const d of VITALS_SERIES) {
      const dist = Math.abs(d.year - hoverYear);
      if (dist < minD) {
        minD = dist;
        nearest = d;
      }
    }

    const x = xScale(nearest.year);
    guideTop.setAttribute('x1', x); guideTop.setAttribute('x2', x); guideTop.style.opacity = '0.8';
    guideBot.setAttribute('x1', x); guideBot.setAttribute('x2', x); guideBot.style.opacity = '0.8';
    dotBirth.setAttribute('cx', x); dotBirth.setAttribute('cy', yTop(nearest.births)); dotBirth.style.opacity = '1';
    dotDeath.setAttribute('cx', x); dotDeath.setAttribute('cy', yTop(nearest.deaths)); dotDeath.style.opacity = '1';
    dotTfr.setAttribute('cx', x); dotTfr.setAttribute('cy', yBot(nearest.tfr)); dotTfr.style.opacity = '1';

    const naturalDiff = (nearest.births - nearest.deaths) / 10; // 万人
    const diffClass = naturalDiff >= 0 ? 'is-pos' : 'is-neg';
    const gapRep = nearest.tfr - REPLACEMENT_TFR;

    showTooltip(`
      <div class="tt-head">${nearest.year}年（確定数）</div>
      ${nearest.note ? `<div class="tt-note">${nearest.note}</div>` : ''}
      <div class="tt-grid">
        <span><i class="dot dot-young"></i>出生数</span><strong>${(nearest.births / 10).toFixed(1)}万人</strong>
        <span><i class="dot dot-elderly"></i>死亡数</span><strong>${(nearest.deaths / 10).toFixed(1)}万人</strong>
        <span>自然増減</span><strong class="${diffClass}">${formatSigned(naturalDiff, 1, '万人')}</strong>
        <span><i class="dot dot-amber"></i>合計特殊出生率</span><strong>${nearest.tfr.toFixed(2)}（置換水準比 ${formatSigned(gapRep, 2, '')}）</strong>
      </div>
    `, e.clientX, e.clientY);
  });

  hitRect.addEventListener('pointerleave', () => {
    guideTop.style.opacity = '0';
    guideBot.style.opacity = '0';
    dotBirth.style.opacity = '0';
    dotDeath.style.opacity = '0';
    dotTfr.style.opacity = '0';
    hideTooltip();
  });
}
