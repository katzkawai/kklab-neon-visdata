/**
 * Viz 4: 47都道府県の地域差 — 日本列島タイル地図 × 連動散布図
 * - 等面積タイル地図（カラムマップ）により東京・大阪・沖縄も北海道と同等に視認可能
 * - 3指標切替：高齢化率 / 合計特殊出生率 / 人口増減率（いずれも2024年公式統計）
 * - 散布図（高齢化率 × 合計特殊出生率）の4象限分析と双方向ハイライト連動
 * - 地方区分フィルタ & 選択都道府県の詳細プロファイルカード
 */

import {
  PREFECTURES, NATIONAL_AVG, REGIONS, REGION_COLOR_MAP,
} from '../data/prefectures.js';
import {
  svgEl, scaleLinear, interpolateColorScale, isDarkColor, formatSigned, showTooltip, hideTooltip,
} from './utils.js';

const METRICS = {
  agingRate: {
    key: 'agingRate',
    label: '高齢化率（65歳以上割合）',
    unit: '%',
    min: 22.0,
    max: 40.0,
    stops: ['#FEF3C7', '#FDBA74', '#F97316', '#DC2626', '#7F1D1D'],
    format: (v) => `${v.toFixed(1)}%`,
    legendMin: '22.7% (東京)',
    legendMax: '39.5% (秋田)',
    source: '総務省「人口推計（2024年10月1日）」',
  },
  tfr: {
    key: 'tfr',
    label: '合計特殊出生率',
    unit: '',
    min: 0.95,
    max: 1.56,
    stops: ['#991B1B', '#EF4444', '#FCD34D', '#34D399', '#047857'],
    format: (v) => v.toFixed(2),
    legendMin: '0.96 (東京)',
    legendMax: '1.54 (沖縄)',
    source: '厚労省「人口動態統計（2024年確定数）」',
  },
  popChange: {
    key: 'popChange',
    label: '人口増減率（前年比）',
    unit: '%',
    min: -1.9,
    max: 0.7,
    stops: ['#881337', '#E11D48', '#FDA4AF', '#E2E8F0', '#1D4ED8'],
    format: (v) => formatSigned(v, 2, '%'),
    legendMin: '−1.87% (秋田)',
    legendMax: '+0.66% (東京)',
    source: '総務省「人口推計（2024年10月1日）」',
  },
};

function getQuadrantDiagnosis(p) {
  const highAging = p.agingRate >= NATIONAL_AVG.agingRate;
  const highTfr = p.tfr >= NATIONAL_AVG.tfr;
  if (!highAging && !highTfr) {
    return {
      tag: '都市型・極低出生率',
      color: '#DC2626',
      text: '若年層の流入により高齢化率は全国平均より低い一方、出生率は全国最低水準。都市集積と少子化のジレンマが顕著。',
    };
  }
  if (highAging && !highTfr) {
    return {
      tag: '少子化×高齢化 同時進行',
      color: '#991B1B',
      text: '高齢化率が全国平均を上回り、かつ出生率も平均未満。自然減と社会減の双方が重なり、最も急速な人口減少局面にあります。',
    };
  }
  if (highAging && highTfr) {
    return {
      tag: '高出生率×若年流出型',
      color: '#D97706',
      text: '出生率は全国平均を上回るものの、過去の若年層転出により高齢化率が高い構造。子育て環境と定住基盤の両立が鍵。',
    };
  }
  return {
    tag: '相対的バランス維持型',
    color: '#059669',
    text: '高齢化率が全国平均未満かつ出生率も平均以上。若年層の比率が比較的高く、緩やかな人口推移となっています。',
  };
}

export function initPrefectureViz() {
  const mapWrap = document.getElementById('pref-tilemap-wrap');
  const scatterWrap = document.getElementById('pref-scatter-wrap');
  const metricBtns = document.querySelectorAll('[data-pref-metric]');
  const regionWrap = document.getElementById('pref-region-filters');
  const legendBar = document.getElementById('pref-legend-bar');
  const legendMin = document.getElementById('pref-legend-min');
  const legendMax = document.getElementById('pref-legend-max');
  const legendSource = document.getElementById('pref-legend-source');
  const detailCard = document.getElementById('pref-detail-card');

  const state = {
    metric: 'agingRate',
    region: 'all',
    selectedCode: '13', // デフォルト: 東京都（対比がわかりやすい）
    hoveredCode: null,
  };

  // 地方フィルタチップ生成
  regionWrap.innerHTML = '';
  const regionBtns = REGIONS.map((r) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `region-chip ${r.id === 'all' ? 'is-active' : ''}`;
    btn.dataset.region = r.id;
    btn.innerHTML = r.id === 'all'
      ? r.label
      : `<i class="region-dot" style="background:${r.color}"></i>${r.label}`;
    btn.addEventListener('click', () => {
      state.region = r.id;
      regionBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.region === r.id));
      updateHighlightStyles();
    });
    regionWrap.appendChild(btn);
    return btn;
  });

  // タイル地図の構築
  const COLS = 14;
  const ROWS = 12;
  const CELL = 40;
  const GAP = 4;
  const MAP_W = COLS * (CELL + GAP) + 12;
  const MAP_H = ROWS * (CELL + GAP) + 16;

  const mapSvg = svgEl('svg', {
    viewBox: `0 0 ${MAP_W} ${MAP_H}`,
    class: 'viz-svg pref-map-svg',
    role: 'img',
    'aria-label': '47都道府県 少子高齢化タイル地図',
  }, mapWrap);

  // 沖縄の区切り枠（左下）
  svgEl('path', {
    d: `M 4,${10.7 * (CELL + GAP)} L ${1.35 * (CELL + GAP)},${10.7 * (CELL + GAP)} L ${1.35 * (CELL + GAP)},${MAP_H - 4}`,
    fill: 'none', stroke: '#CBD5E1', 'stroke-width': 1.2, 'stroke-dasharray': '3,3',
  }, mapSvg);

  const tileRefs = new Map();
  PREFECTURES.forEach((p) => {
    const x = 6 + p.col * (CELL + GAP);
    const y = 8 + p.row * (CELL + GAP);
    const g = svgEl('g', {
      class: 'pref-tile',
      transform: `translate(${x}, ${y})`,
      tabindex: '0',
      role: 'button',
      'aria-label': `${p.name} 高齢化率${p.agingRate}% 出生率${p.tfr}`,
    }, mapSvg);

    const rect = svgEl('rect', {
      width: CELL, height: CELL, rx: 5,
      class: 'pref-tile-rect',
    }, g);

    const nameTxt = svgEl('text', {
      x: CELL / 2, y: 16.5, 'text-anchor': 'middle', class: 'pref-tile-name',
    }, g);
    nameTxt.textContent = p.short;

    const valTxt = svgEl('text', {
      x: CELL / 2, y: 31, 'text-anchor': 'middle', class: 'pref-tile-val',
    }, g);

    const handleEnter = (e) => {
      state.hoveredCode = p.code;
      updateHighlightStyles();
      if (e.clientX) showPrefTooltip(p, e.clientX, e.clientY);
    };
    const handleMove = (e) => showPrefTooltip(p, e.clientX, e.clientY);
    const handleLeave = () => {
      state.hoveredCode = null;
      updateHighlightStyles();
      hideTooltip();
    };
    const handleSelect = () => {
      state.selectedCode = p.code;
      renderDetailCard();
      updateHighlightStyles();
    };

    g.addEventListener('pointerenter', handleEnter);
    g.addEventListener('pointermove', handleMove);
    g.addEventListener('pointerleave', handleLeave);
    g.addEventListener('click', handleSelect);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });

    tileRefs.set(p.code, { g, rect, nameTxt, valTxt, p });
  });

  // --- 連動散布図（高齢化率 × 合計特殊出生率）の構築 ---
  const SW = 540;
  const SH = 460;
  const sm = { top: 34, right: 26, bottom: 50, left: 54 };
  const sx = scaleLinear(21.5, 41.0, sm.left, SW - sm.right);
  const sy = scaleLinear(0.90, 1.62, SH - sm.bottom, sm.top);

  const scatterSvg = svgEl('svg', {
    viewBox: `0 0 ${SW} ${SH}`,
    class: 'viz-svg pref-scatter-svg',
    role: 'img',
    'aria-label': '47都道府県 高齢化率と合計特殊出生率の散布図',
  }, scatterWrap);

  // 4象限の薄い背景ラベル
  const avgX = sx(NATIONAL_AVG.agingRate);
  const avgY = sy(NATIONAL_AVG.tfr);

  svgEl('rect', {
    x: sm.left, y: avgY, width: avgX - sm.left, height: SH - sm.bottom - avgY,
    fill: '#DC2626', 'fill-opacity': 0.035,
  }, scatterSvg);
  svgEl('rect', {
    x: avgX, y: avgY, width: SW - sm.right - avgX, height: SH - sm.bottom - avgY,
    fill: '#7F1D1D', 'fill-opacity': 0.055,
  }, scatterSvg);
  svgEl('rect', {
    x: sm.left, y: sm.top, width: avgX - sm.left, height: avgY - sm.top,
    fill: '#059669', 'fill-opacity': 0.04,
  }, scatterSvg);

  // グリッド線
  [25, 30, 35, 40].forEach((v) => {
    const x = sx(v);
    svgEl('line', { x1: x, y1: sm.top, x2: x, y2: SH - sm.bottom, class: 'chart-grid-line' }, scatterSvg);
    svgEl('text', { x, y: SH - sm.bottom + 18, 'text-anchor': 'middle', class: 'axis-tick-label' }, scatterSvg).textContent = `${v}%`;
  });
  [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6].forEach((v) => {
    const y = sy(v);
    svgEl('line', { x1: sm.left, y1: y, x2: SW - sm.right, y2: y, class: 'chart-grid-line' }, scatterSvg);
    svgEl('text', { x: sm.left - 8, y: y + 4, 'text-anchor': 'end', class: 'axis-tick-label' }, scatterSvg).textContent = v.toFixed(1);
  });

  // 軸タイトル
  svgEl('text', { x: (sm.left + SW - sm.right) / 2, y: SH - 10, 'text-anchor': 'middle', class: 'axis-title' }, scatterSvg).textContent = '高齢化率（65歳以上人口割合 %）→';
  svgEl('text', {
    x: 16, y: (sm.top + SH - sm.bottom) / 2,
    transform: `rotate(-90, 16, ${(sm.top + SH - sm.bottom) / 2})`,
    'text-anchor': 'middle', class: 'axis-title',
  }, scatterSvg).textContent = '合計特殊出生率（2024年）→';

  // 全国平均クロス基準線
  svgEl('line', { x1: avgX, y1: sm.top, x2: avgX, y2: SH - sm.bottom, stroke: '#475569', 'stroke-width': 1.2, 'stroke-dasharray': '4,3' }, scatterSvg);
  svgEl('line', { x1: sm.left, y1: avgY, x2: SW - sm.right, y2: avgY, stroke: '#475569', 'stroke-width': 1.2, 'stroke-dasharray': '4,3' }, scatterSvg);

  svgEl('text', { x: avgX + 4, y: sm.top + 12, class: 'quad-avg-label' }, scatterSvg).textContent = '全国平均 29.3%';
  svgEl('text', { x: SW - sm.right - 4, y: avgY - 5, 'text-anchor': 'end', class: 'quad-avg-label' }, scatterSvg).textContent = '全国平均 1.15';

  // 4象限キャプション
  svgEl('text', { x: sm.left + 8, y: sm.top + 14, class: 'quad-label is-good' }, scatterSvg).textContent = '低高齢化 × 高出生率';
  svgEl('text', { x: SW - sm.right - 8, y: sm.top + 14, 'text-anchor': 'end', class: 'quad-label is-warn' }, scatterSvg).textContent = '高高齢化 × 高出生率（若年流出）';
  svgEl('text', { x: sm.left + 8, y: SH - sm.bottom - 8, class: 'quad-label is-urban' }, scatterSvg).textContent = '都市型（低高齢化 × 極低出生率）';
  svgEl('text', { x: SW - sm.right - 8, y: SH - sm.bottom - 8, 'text-anchor': 'end', class: 'quad-label is-severe' }, scatterSvg).textContent = '少子高齢化 同時進行';

  const LABELED_CODES = new Set(['13', '47', '05', '01', '18', '32', '39', '04', '27', '23', '25']);
  const LABEL_OFFSETS = {
    '13': { dx: 8, dy: 4, anchor: 'start' },
    '47': { dx: 8, dy: 4, anchor: 'start' },
    '05': { dx: -8, dy: 4, anchor: 'end' },
    '01': { dx: 8, dy: 4, anchor: 'start' },
    '18': { dx: 0, dy: -10, anchor: 'middle' },
    '32': { dx: 8, dy: 4, anchor: 'start' },
    '39': { dx: 8, dy: 4, anchor: 'start' },
    '04': { dx: 8, dy: 4, anchor: 'start' },
    '27': { dx: -8, dy: -6, anchor: 'end' },
    '23': { dx: -8, dy: 4, anchor: 'end' },
    '25': { dx: -8, dy: 4, anchor: 'end' },
  };

  const scatterRefs = new Map();
  const dotsLayer = svgEl('g', {}, scatterSvg);
  const labelsLayer = svgEl('g', { 'pointer-events': 'none' }, scatterSvg);

  PREFECTURES.forEach((p) => {
    const cx = sx(p.agingRate);
    const cy = sy(p.tfr);
    const col = REGION_COLOR_MAP[p.region];

    const dot = svgEl('circle', {
      cx: cx.toFixed(1),
      cy: cy.toFixed(1),
      r: 6,
      fill: col,
      'fill-opacity': 0.85,
      stroke: '#FAF9F6',
      'stroke-width': 1.5,
      class: 'scatter-dot',
    }, dotsLayer);

    let lbl = null;
    if (LABELED_CODES.has(p.code)) {
      const off = LABEL_OFFSETS[p.code] || { dx: 8, dy: 4, anchor: 'start' };
      lbl = svgEl('text', {
        x: (cx + off.dx).toFixed(1),
        y: (cy + off.dy).toFixed(1),
        'text-anchor': off.anchor,
        class: 'scatter-point-label',
      }, labelsLayer);
      lbl.textContent = p.name.replace(/[都道府県]$/, '');
    }

    dot.addEventListener('pointerenter', (e) => {
      state.hoveredCode = p.code;
      updateHighlightStyles();
      showPrefTooltip(p, e.clientX, e.clientY);
    });
    dot.addEventListener('pointermove', (e) => showPrefTooltip(p, e.clientX, e.clientY));
    dot.addEventListener('pointerleave', () => {
      state.hoveredCode = null;
      updateHighlightStyles();
      hideTooltip();
    });
    dot.addEventListener('click', () => {
      state.selectedCode = p.code;
      renderDetailCard();
      updateHighlightStyles();
    });

    scatterRefs.set(p.code, { dot, lbl, p });
  });

  function showPrefTooltip(p, clientX, clientY) {
    const diag = getQuadrantDiagnosis(p);
    showTooltip(`
      <div class="tt-head">${p.name} <span class="tt-sub-inline">${p.regionLabel}</span></div>
      <div class="tt-sub" style="color:${diag.color};font-weight:600">${diag.tag}</div>
      <div class="tt-grid">
        <span>高齢化率</span><strong>${p.agingRate.toFixed(1)}%（全国 ${p.agingRank}位）</strong>
        <span>合計特殊出生率</span><strong>${p.tfr.toFixed(2)}（全国 ${p.tfrRank}位）</strong>
        <span>人口増減率</span><strong>${formatSigned(p.popChange, 2, '%')}（全国 ${p.popChangeRank}位）</strong>
      </div>
      <div class="tt-hint">クリックして詳細を固定表示</div>
    `, clientX, clientY);
  }

  function renderMapColors() {
    const m = METRICS[state.metric];
    legendBar.style.background = `linear-gradient(to right, ${m.stops.join(', ')})`;
    legendMin.textContent = m.legendMin;
    legendMax.textContent = m.legendMax;
    legendSource.textContent = `出典: ${m.source}`;

    tileRefs.forEach(({ rect, nameTxt, valTxt, p }) => {
      const val = p[m.key];
      const t = (val - m.min) / (m.max - m.min);
      const fill = interpolateColorScale(m.stops, t);
      const dark = isDarkColor(fill);

      rect.setAttribute('fill', fill);
      nameTxt.setAttribute('fill', dark ? '#FAF9F6' : '#181A1F');
      valTxt.setAttribute('fill', dark ? 'rgba(250,249,246,0.92)' : 'rgba(24,26,31,0.82)');
      valTxt.textContent = state.metric === 'popChange'
        ? (val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1))
        : state.metric === 'agingRate'
          ? `${val.toFixed(1)}`
          : val.toFixed(2);
    });
  }

  function updateHighlightStyles() {
    const activeCode = state.hoveredCode || state.selectedCode;

    tileRefs.forEach(({ g, p }) => {
      const inRegion = state.region === 'all' || p.region === state.region;
      const isSelected = p.code === state.selectedCode;
      const isHovered = p.code === state.hoveredCode;
      g.classList.toggle('is-dimmed', !inRegion);
      g.classList.toggle('is-selected', isSelected);
      g.classList.toggle('is-hovered', isHovered);
      if (isSelected || isHovered) {
        g.parentNode.appendChild(g); // 前面へ
      }
    });

    scatterRefs.forEach(({ dot, lbl, p }) => {
      const inRegion = state.region === 'all' || p.region === state.region;
      const isActive = p.code === activeCode;
      const isSelected = p.code === state.selectedCode;

      dot.setAttribute('r', isActive ? '9' : isSelected ? '8' : '6');
      dot.setAttribute('fill-opacity', !inRegion ? '0.16' : isActive ? '1' : '0.82');
      dot.setAttribute('stroke', isActive ? '#181A1F' : '#FAF9F6');
      dot.setAttribute('stroke-width', isActive ? '2.4' : '1.4');
      if (lbl) {
        lbl.style.opacity = !inRegion ? '0.18' : '1';
      }
      if (isActive) {
        dot.parentNode.appendChild(dot);
      }
    });
  }

  function renderDetailCard() {
    const p = PREFECTURES.find((x) => x.code === state.selectedCode) || PREFECTURES[12];
    const diag = getQuadrantDiagnosis(p);
    const agingBarW = Math.min(100, ((p.agingRate - 15) / 30) * 100);
    const avgAgingPos = ((NATIONAL_AVG.agingRate - 15) / 30) * 100;
    const tfrBarW = Math.min(100, ((p.tfr - 0.8) / 1.0) * 100);
    const avgTfrPos = ((NATIONAL_AVG.tfr - 0.8) / 1.0) * 100;

    detailCard.innerHTML = `
      <div class="pref-detail-top">
        <div>
          <span class="pref-region-pill" style="background:${REGION_COLOR_MAP[p.region]}">${p.regionLabel}</span>
          <h4 class="pref-detail-name">${p.name}</h4>
        </div>
        <span class="pref-quad-badge" style="color:${diag.color};border-color:${diag.color}">${diag.tag}</span>
      </div>
      <div class="pref-detail-stats">
        <div class="pref-stat-item">
          <div class="pref-stat-head">
            <span>高齢化率</span>
            <strong>${p.agingRate.toFixed(1)}% <small>（${p.agingRank}位 / 47）</small></strong>
          </div>
          <div class="compare-track">
            <div class="compare-fill is-red" style="width:${agingBarW.toFixed(1)}%"></div>
            <div class="compare-avg-mark" style="left:${avgAgingPos.toFixed(1)}%" title="全国平均 29.3%"></div>
          </div>
        </div>
        <div class="pref-stat-item">
          <div class="pref-stat-head">
            <span>合計特殊出生率</span>
            <strong>${p.tfr.toFixed(2)} <small>（${p.tfrRank}位 / 47）</small></strong>
          </div>
          <div class="compare-track">
            <div class="compare-fill is-teal" style="width:${tfrBarW.toFixed(1)}%"></div>
            <div class="compare-avg-mark" style="left:${avgTfrPos.toFixed(1)}%" title="全国平均 1.15"></div>
          </div>
        </div>
        <div class="pref-stat-item">
          <div class="pref-stat-head">
            <span>人口増減率（前年比）</span>
            <strong class="${p.popChange >= 0 ? 'is-pos' : 'is-neg'}">${formatSigned(p.popChange, 2, '%')} <small>（${p.popChangeRank}位 / 47）</small></strong>
          </div>
          <div class="pref-stat-sub">全国平均 −0.44% との差：${formatSigned(p.popChange - NATIONAL_AVG.popChange, 2, 'pt')}</div>
        </div>
      </div>
      <p class="pref-detail-desc">${diag.text}</p>
    `;
  }

  metricBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      metricBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.metric = btn.dataset.prefMetric;
      renderMapColors();
    });
  });

  renderMapColors();
  renderDetailCard();
  updateHighlightStyles();
}
