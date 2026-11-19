/**
 * Viz 1: インタラクティブ人口ピラミッド（1950〜2070年）
 * - 時系列アニメーション（再生/一時停止・スライダー・節目年ショートカット）
 * - 比較ゴースト重ね合わせ（1970年 / 2024年）
 * - 団塊の世代（1947-49）・団塊ジュニア（1971-74）のコホート追跡ハイライト
 * - 実数（万人） / 構成比（%）切替
 */

import { AGE_BRACKETS, PYRAMID_MILESTONES, getPyramidData } from '../data/population.js';
import { svgEl, scaleLinear, formatPopMan, showTooltip, hideTooltip } from './utils.js';

const GROUP_COLORS = {
  young: { male: '#0D9488', female: '#14B8A6', label: '年少人口（0–14歳）' },
  working: { male: '#2563EB', female: '#4F7DF3', label: '生産年齢人口（15–64歳）' },
  elderly: { male: '#DC2626', female: '#EF5350', label: '老年人口（65歳以上）' },
};

export function initPyramidViz() {
  const svgContainer = document.getElementById('pyramid-svg-wrap');
  const slider = document.getElementById('pyramid-year-slider');
  const playBtn = document.getElementById('pyramid-play-btn');
  const ghostSelect = document.getElementById('pyramid-ghost-select');
  const modeBtns = document.querySelectorAll('[data-pyramid-mode]');
  const cohortToggle = document.getElementById('pyramid-cohort-toggle');
  const milestoneWrap = document.getElementById('pyramid-milestones');

  // サイドパネル出力要素
  const elYear = document.getElementById('pyr-year-display');
  const elBadge = document.getElementById('pyr-status-badge');
  const elShape = document.getElementById('pyr-shape-label');
  const elTotal = document.getElementById('pyr-total');
  const elAging = document.getElementById('pyr-aging');
  const elMedian = document.getElementById('pyr-median');
  const elSupport = document.getElementById('pyr-support');
  const elBarYoung = document.getElementById('pyr-bar-young');
  const elBarWorking = document.getElementById('pyr-bar-working');
  const elBarElderly = document.getElementById('pyr-bar-elderly');
  const elPctYoung = document.getElementById('pyr-pct-young');
  const elPctWorking = document.getElementById('pyr-pct-working');
  const elPctElderly = document.getElementById('pyr-pct-elderly');
  const elNote = document.getElementById('pyr-milestone-note');

  const state = {
    year: 2024,
    mode: 'count', // 'count' | 'share'
    ghostYear: 1970, // null | 1970 | 2024
    highlightCohorts: true,
    playing: false,
    timerId: null,
  };

  // マイルストーンボタン生成
  milestoneWrap.innerHTML = '';
  const milestoneBtns = PYRAMID_MILESTONES.map((m) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'milestone-chip';
    btn.dataset.year = String(m.year);
    btn.innerHTML = `<strong>${m.label}</strong><span>${m.sub}</span>`;
    btn.addEventListener('click', () => {
      stopPlayback();
      state.year = m.year;
      slider.value = String(m.year);
      render();
    });
    milestoneWrap.appendChild(btn);
    return btn;
  });

  // SVG基本骨格を一度だけ構築（滑らかなトランジションのため）
  const N = AGE_BRACKETS.length;
  const W = 720;
  const H = 490;
  const padTop = 36;
  const padBottom = 38;
  const padSide = 46;
  const centerGap = 52;
  const halfW = (W - padSide * 2 - centerGap) / 2;
  const leftAxisX = W / 2 - centerGap / 2;
  const rightAxisX = W / 2 + centerGap / 2;
  const plotH = H - padTop - padBottom;
  const rowH = plotH / N;
  const barH = Math.max(12, rowH - 4.5);

  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'viz-svg pyramid-svg',
    role: 'img',
    'aria-label': '日本の年齢階級別・男女別人口ピラミッド（1950年〜2070年）',
  }, svgContainer);

  const gridLayer = svgEl('g', { class: 'grid-layer' }, svg);
  const ghostLayer = svgEl('g', { class: 'ghost-layer' }, svg);
  const barsLayer = svgEl('g', { class: 'bars-layer' }, svg);
  const cohortLayer = svgEl('g', { class: 'cohort-layer' }, svg);
  const axisLayer = svgEl('g', { class: 'axis-layer' }, svg);

  // 男女ヘッダーラベル
  svgEl('text', {
    x: leftAxisX - 10, y: 20, 'text-anchor': 'end', class: 'pyramid-sex-label is-male',
  }, axisLayer).textContent = '← 男性';
  svgEl('text', {
    x: rightAxisX + 10, y: 20, 'text-anchor': 'start', class: 'pyramid-sex-label is-female',
  }, axisLayer).textContent = '女性 →';
  svgEl('text', {
    x: W / 2, y: 20, 'text-anchor': 'middle', class: 'pyramid-age-header',
  }, axisLayer).textContent = '年齢階級';

  // 65歳・15歳の境界ガイド線
  const y15 = padTop + (N - 3) * rowH;
  const y65 = padTop + (N - 13) * rowH;
  [
    { y: y65, label: '65歳ライン（高齢人口）' },
    { y: y15, label: '15歳ライン（年少人口）' },
  ].forEach((b) => {
    svgEl('line', {
      x1: padSide, y1: b.y, x2: W - padSide, y2: b.y,
      stroke: '#94A3B8', 'stroke-width': 1, 'stroke-dasharray': '3,3', opacity: 0.65,
    }, axisLayer);
    const lbl = svgEl('text', {
      x: padSide + 2, y: b.y - 4, class: 'pyramid-divider-label',
    }, axisLayer);
    lbl.textContent = b.label;
  });

  // 年齢階級の中央ラベルと棒要素を事前生成
  const barEls = AGE_BRACKETS.map((label, idx) => {
    const rowY = padTop + (N - 1 - idx) * rowH;
    const barY = rowY + (rowH - barH) / 2;

    const g = svgEl('g', { class: 'pyramid-row', 'data-idx': idx }, barsLayer);

    // ホバー検知用の透明行背景
    const hit = svgEl('rect', {
      x: padSide, y: rowY, width: W - padSide * 2, height: rowH,
      fill: 'transparent', class: 'pyramid-hit-row',
    }, g);

    const maleBar = svgEl('rect', {
      x: leftAxisX, y: barY, width: 0, height: barH, rx: 2,
      class: 'pyramid-bar',
    }, g);

    const femaleBar = svgEl('rect', {
      x: rightAxisX, y: barY, width: 0, height: barH, rx: 2,
      class: 'pyramid-bar',
    }, g);

    const ageTxt = svgEl('text', {
      x: W / 2, y: barY + barH / 2 + 4, 'text-anchor': 'middle', class: 'pyramid-age-label',
    }, axisLayer);
    ageTxt.textContent = label;

    return { g, hit, maleBar, femaleBar, rowY, barY, idx };
  });

  // ゴースト輪郭パス
  const ghostMalePath = svgEl('path', {
    fill: 'none', stroke: '#475569', 'stroke-width': 1.6, 'stroke-dasharray': '4,3', opacity: 0.72,
  }, ghostLayer);
  const ghostFemalePath = svgEl('path', {
    fill: 'none', stroke: '#475569', 'stroke-width': 1.6, 'stroke-dasharray': '4,3', opacity: 0.72,
  }, ghostLayer);

  // X軸目盛り（モードに応じて再描画）
  function renderGrid(maxVal) {
    gridLayer.innerHTML = '';
    const xLeft = scaleLinear(0, maxVal, leftAxisX, padSide);
    const xRight = scaleLinear(0, maxVal, rightAxisX, W - padSide);

    const ticks = state.mode === 'count' ? [0, 2000, 4000, 6000] : [0, 2, 4, 6];
    ticks.forEach((t) => {
      const lx = xLeft(t);
      const rx = xRight(t);
      svgEl('line', { x1: lx, y1: padTop, x2: lx, y2: padTop + plotH, class: 'chart-grid-line' }, gridLayer);
      svgEl('line', { x1: rx, y1: padTop, x2: rx, y2: padTop + plotH, class: 'chart-grid-line' }, gridLayer);

      const textVal = state.mode === 'count' ? `${t / 10}万` : `${t}%`;
      if (t > 0) {
        svgEl('text', { x: lx, y: H - 14, 'text-anchor': 'middle', class: 'axis-tick-label' }, gridLayer).textContent = textVal;
        svgEl('text', { x: rx, y: H - 14, 'text-anchor': 'middle', class: 'axis-tick-label' }, gridLayer).textContent = textVal;
      }
    });

    svgEl('text', { x: leftAxisX, y: H - 14, 'text-anchor': 'middle', class: 'axis-tick-label' }, gridLayer).textContent = '0';
    svgEl('text', { x: rightAxisX, y: H - 14, 'text-anchor': 'middle', class: 'axis-tick-label' }, gridLayer).textContent = '0';
  }

  function buildGhostStepPath(brackets, totalPop, side, scaleFn) {
    const axisX = side === 'male' ? leftAxisX : rightAxisX;
    let d = `M ${axisX} ${padTop + plotH}`;
    for (let idx = 0; idx < brackets.length; idx++) {
      const b = brackets[idx];
      const val = state.mode === 'count' ? b[side] : (b[side] / totalPop) * 100;
      const x = scaleFn(val);
      const yBottom = padTop + (N - idx) * rowH;
      const yTop = padTop + (N - 1 - idx) * rowH;
      d += ` L ${x.toFixed(1)} ${yBottom.toFixed(1)} L ${x.toFixed(1)} ${yTop.toFixed(1)}`;
    }
    d += ` L ${axisX} ${padTop}`;
    return d;
  }

  function getMilestoneNote(year) {
    let closest = PYRAMID_MILESTONES[0];
    let minDist = Infinity;
    for (const m of PYRAMID_MILESTONES) {
      const d = Math.abs(m.year - year);
      if (d < minDist) {
        minDist = d;
        closest = m;
      }
    }
    if (minDist <= 8) return closest.desc;
    if (year < 1970) return '出生数が多く裾野の広い人口構造。若年層の厚みが経済成長の原動力（人口ボーナス期）となった。';
    if (year < 2005) return '出生率低下と平均寿命の伸長により、ピラミッドの裾野が急速に細り始める。';
    if (year <= 2024) return '総人口が減少局面に入り、高齢者比率が世界最高水準へ。生産年齢人口の縮小が顕著に。';
    return '少子化の累積効果により若年・生産年齢層がさらに細り、高齢層が厚い逆さピラミッド構造へ移行。';
  }

  let currentData = getPyramidData(state.year);

  function render() {
    currentData = getPyramidData(state.year);
    const maxVal = state.mode === 'count' ? 6500 : 6.8;
    const xLeft = scaleLinear(0, maxVal, leftAxisX, padSide);
    const xRight = scaleLinear(0, maxVal, rightAxisX, W - padSide);

    renderGrid(maxVal);

    // 棒を更新
    currentData.brackets.forEach((b, idx) => {
      const { maleBar, femaleBar, g } = barEls[idx];
      const mVal = state.mode === 'count' ? b.male : (b.male / currentData.total) * 100;
      const fVal = state.mode === 'count' ? b.female : (b.female / currentData.total) * 100;

      const mX = xLeft(mVal);
      const mW = Math.max(0, leftAxisX - mX);
      const fW = Math.max(0, xRight(fVal) - rightAxisX);

      const colors = GROUP_COLORS[b.group];
      const isHighlightedCohort = state.highlightCohorts && (b.isDankai || b.isDankaiJr);

      maleBar.setAttribute('x', mX.toFixed(1));
      maleBar.setAttribute('width', mW.toFixed(1));
      maleBar.setAttribute('fill', colors.male);
      maleBar.setAttribute('fill-opacity', currentData.projected ? '0.82' : '0.94');
      maleBar.setAttribute('stroke', isHighlightedCohort ? '#181A1F' : 'none');
      maleBar.setAttribute('stroke-width', isHighlightedCohort ? '1.6' : '0');

      femaleBar.setAttribute('width', fW.toFixed(1));
      femaleBar.setAttribute('fill', colors.female);
      femaleBar.setAttribute('fill-opacity', currentData.projected ? '0.82' : '0.94');
      femaleBar.setAttribute('stroke', isHighlightedCohort ? '#181A1F' : 'none');
      femaleBar.setAttribute('stroke-width', isHighlightedCohort ? '1.6' : '0');

      g.classList.toggle('is-cohort-highlight', isHighlightedCohort);
    });

    // ゴースト輪郭を更新
    if (state.ghostYear && state.ghostYear !== state.year) {
      const gData = getPyramidData(state.ghostYear);
      ghostMalePath.setAttribute('d', buildGhostStepPath(gData.brackets, gData.total, 'male', xLeft));
      ghostFemalePath.setAttribute('d', buildGhostStepPath(gData.brackets, gData.total, 'female', xRight));
      ghostLayer.style.display = '';
    } else {
      ghostLayer.style.display = 'none';
    }

    // 団塊・団塊ジュニアの動的コールアウトラベル
    cohortLayer.innerHTML = '';
    if (state.highlightCohorts) {
      const dankai = currentData.brackets.find((b) => b.isDankai);
      const dankaiJr = currentData.brackets.find((b) => b.isDankaiJr);
      [
        { item: dankai, title: '団塊の世代', side: 'right' },
        { item: dankaiJr, title: '団塊ジュニア', side: 'left' },
      ].forEach(({ item, title, side }) => {
        if (!item) return;
        const rowY = padTop + (N - 1 - item.index) * rowH + rowH / 2;
        const val = state.mode === 'count'
          ? (side === 'right' ? item.female : item.male)
          : ((side === 'right' ? item.female : item.male) / currentData.total) * 100;
        const barTip = side === 'right' ? xRight(val) : xLeft(val);
        const pillW = 76;
        const pillX = side === 'right'
          ? Math.min(W - pillW - 4, barTip + 14)
          : Math.max(4, barTip - 14 - pillW);

        const connectorStart = side === 'right' ? barTip + 2 : barTip - 2;
        const connectorEnd = side === 'right' ? pillX : pillX + pillW;
        if ((side === 'right' && connectorEnd > connectorStart + 2) || (side === 'left' && connectorEnd < connectorStart - 2)) {
          svgEl('line', {
            x1: connectorStart,
            y1: rowY,
            x2: connectorEnd,
            y2: rowY,
            stroke: '#181A1F',
            'stroke-width': 1.2,
            'stroke-dasharray': '2,2',
          }, cohortLayer);
        }

        svgEl('rect', {
          x: pillX,
          y: rowY - 10.5,
          width: pillW,
          height: 21,
          rx: 4,
          fill: '#181A1F',
          opacity: 0.92,
        }, cohortLayer);

        svgEl('text', {
          x: pillX + pillW / 2,
          y: rowY + 3.5,
          'text-anchor': 'middle',
          fill: '#FAF9F6',
          'font-size': 10,
          'font-weight': 600,
        }, cohortLayer).textContent = title;
      });
    }

    // サイドパネル数値更新
    elYear.textContent = `${currentData.year}年`;
    elBadge.textContent = currentData.projected ? '将来推計（社人研）' : '実績値（総務省）';
    elBadge.className = `status-pill ${currentData.projected ? 'is-projected' : 'is-actual'}`;
    elShape.textContent = currentData.shapeLabel;
    elTotal.textContent = formatPopMan(currentData.total);
    elAging.textContent = `${currentData.agingRate.toFixed(1)}%`;
    elMedian.textContent = `${currentData.medianAge.toFixed(1)}歳`;
    elSupport.textContent = `${currentData.supportRatio.toFixed(1)}人`;

    elBarYoung.style.width = `${currentData.youngRate}%`;
    elBarWorking.style.width = `${currentData.workingRate}%`;
    elBarElderly.style.width = `${currentData.agingRate}%`;
    elPctYoung.textContent = `${currentData.youngRate.toFixed(1)}%`;
    elPctWorking.textContent = `${currentData.workingRate.toFixed(1)}%`;
    elPctElderly.textContent = `${currentData.agingRate.toFixed(1)}%`;
    elNote.textContent = getMilestoneNote(currentData.year);

    // アクティブマイルストーン反映
    milestoneBtns.forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.year) === currentData.year);
    });
  }

  // 行ホバーツールチップ
  barEls.forEach(({ g, idx }) => {
    g.addEventListener('pointermove', (e) => {
      const b = currentData.brackets[idx];
      const share = ((b.total / currentData.total) * 100).toFixed(2);
      const cohortTxt = b.birthStart !== null ? `${b.birthStart}〜${b.birthEnd}年生まれ` : `${b.birthEnd}年以前生まれ`;
      const tags = [
        b.isDankai ? '<span class="tt-tag">団塊の世代</span>' : '',
        b.isDankaiJr ? '<span class="tt-tag">団塊ジュニア</span>' : '',
      ].filter(Boolean).join(' ');

      showTooltip(`
        <div class="tt-head">${currentData.year}年 · <strong>${b.label}歳</strong> ${tags}</div>
        <div class="tt-sub">${cohortTxt} · ${GROUP_COLORS[b.group].label}</div>
        <div class="tt-grid">
          <span>男性</span><strong>${formatPopMan(b.male, 1)}</strong>
          <span>女性</span><strong>${formatPopMan(b.female, 1)}</strong>
          <span>合計</span><strong>${formatPopMan(b.total, 1)}（${share}%）</strong>
        </div>
      `, e.clientX, e.clientY);
    });
    g.addEventListener('pointerleave', hideTooltip);
  });

  // 再生・停止制御
  function stopPlayback() {
    state.playing = false;
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    playBtn.innerHTML = '<span class="play-icon">▶</span> 1950→2070年を再生';
    playBtn.classList.remove('is-playing');
  }

  function startPlayback() {
    if (state.year >= 2070) {
      state.year = 1950;
      slider.value = '1950';
      render();
    }
    state.playing = true;
    playBtn.innerHTML = '<span class="play-icon">❚❚</span> 一時停止';
    playBtn.classList.add('is-playing');
    state.timerId = setInterval(() => {
      if (state.year >= 2070) {
        stopPlayback();
        return;
      }
      state.year += 1;
      slider.value = String(state.year);
      render();
    }, 145);
  }

  playBtn.addEventListener('click', () => {
    if (state.playing) stopPlayback();
    else startPlayback();
  });

  slider.addEventListener('input', () => {
    stopPlayback();
    state.year = Number(slider.value);
    render();
  });

  ghostSelect.addEventListener('change', () => {
    const val = ghostSelect.value;
    state.ghostYear = val === 'none' ? null : Number(val);
    render();
  });

  cohortToggle.addEventListener('change', () => {
    state.highlightCohorts = cohortToggle.checked;
    render();
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.mode = btn.dataset.pyramidMode;
      render();
    });
  });

  render();
}
