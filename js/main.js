/**
 * メインエントリーポイント
 * 各ビジュアライゼーションの初期化、Heroスパークライン、スクロール進捗・ナビ連動
 */

import { POPULATION_SERIES } from './data/population.js';
import { VITALS_SERIES } from './data/vitals.js';
import { svgEl, scaleLinear } from './charts/utils.js';
import { initPyramidViz } from './charts/pyramid.js';
import { initStructureViz } from './charts/structure.js';
import { initVitalsViz } from './charts/vitalsChart.js';
import { initPrefectureViz } from './charts/prefectureMap.js';
import { initInternationalViz } from './charts/internationalChart.js';

function drawMiniSparkline(containerId, values, color, highlightIndex = null) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  const W = 120;
  const H = 34;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = scaleLinear(0, values.length - 1, pad, W - pad);
  const y = scaleLinear(min, max, H - pad, pad);

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kpi-sparkline', 'aria-hidden': 'true' }, el);
  const lineD = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const areaD = `${lineD} L ${x(values.length - 1).toFixed(1)},${H - pad} L ${x(0).toFixed(1)},${H - pad} Z`;

  svgEl('path', { d: areaD, fill: color, 'fill-opacity': 0.14 }, svg);
  svgEl('path', { d: lineD, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);

  if (highlightIndex !== null && highlightIndex >= 0 && highlightIndex < values.length) {
    svgEl('circle', {
      cx: x(highlightIndex),
      cy: y(values[highlightIndex]),
      r: 3,
      fill: color,
      stroke: '#FAF9F6',
      'stroke-width': 1.2,
    }, svg);
  }
}

function initHeroSparklines() {
  const idx2024 = POPULATION_SERIES.findIndex((d) => d.year === 2024);
  drawMiniSparkline('spark-total', POPULATION_SERIES.map((d) => d.total), '#181A1F', idx2024);
  drawMiniSparkline('spark-aging', POPULATION_SERIES.map((d) => (d.elderly / d.total) * 100), '#DC2626', idx2024);
  drawMiniSparkline('spark-tfr', VITALS_SERIES.map((d) => d.tfr), '#B45309', VITALS_SERIES.length - 1);
  drawMiniSparkline('spark-support', POPULATION_SERIES.map((d) => d.working / d.elderly), '#2563EB', idx2024);
}

function initScrollUX() {
  const progressBar = document.getElementById('reading-progress');
  const navLinks = Array.from(document.querySelectorAll('.top-nav-links a'));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const onScroll = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
    if (progressBar) progressBar.style.width = `${pct.toFixed(1)}%`;

    let currentId = sections[0]?.id;
    const offset = window.scrollY + 140;
    for (const sec of sections) {
      if (sec.offsetTop <= offset) {
        currentId = sec.id;
      }
    }
    navLinks.forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${currentId}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // セクションの自然なフェードイン
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll('.viz-section').forEach((sec) => io.observe(sec));
  } else {
    document.querySelectorAll('.viz-section').forEach((sec) => sec.classList.add('is-revealed'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSparklines();
  initPyramidViz();
  initStructureViz();
  initVitalsViz();
  initPrefectureViz();
  initInternationalViz();
  initScrollUX();
});
