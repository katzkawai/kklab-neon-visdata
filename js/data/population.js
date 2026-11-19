/**
 * 日本の人口構造データ（1950〜2070年）
 *
 * 出典:
 * - 1950〜2020年: 総務省統計局「国勢調査」（5年ごと）
 * - 2024年: 総務省統計局「人口推計（2024年10月1日現在・確定値）」
 * - 2025〜2070年: 国立社会保障・人口問題研究所「日本の将来推計人口（令和5年推計）」
 *   （出生中位・死亡中位推計、および出生高位・出生低位の総人口推計）
 *
 * 単位: 千人（年齢3区分および総数）
 */

export const POPULATION_SERIES = [
  // --- 実績値（国勢調査・人口推計） ---
  { year: 1950, total: 84115, young: 29786, working: 50168, elderly: 4155, projected: false },
  { year: 1955, total: 89276, young: 29798, working: 54729, elderly: 4747, projected: false },
  { year: 1960, total: 94302, young: 28434, working: 60469, elderly: 5398, projected: false },
  { year: 1965, total: 98275, young: 25166, working: 66928, elderly: 6181, projected: false },
  { year: 1970, total: 104665, young: 25153, working: 72119, elderly: 7393, projected: false },
  { year: 1975, total: 111940, young: 27221, working: 75807, elderly: 8865, projected: false },
  { year: 1980, total: 117060, young: 27507, working: 78835, elderly: 10647, projected: false },
  { year: 1985, total: 121049, young: 26033, working: 82506, elderly: 12468, projected: false },
  { year: 1990, total: 123611, young: 22486, working: 85904, elderly: 14895, projected: false },
  { year: 1995, total: 125570, young: 20014, working: 87165, elderly: 18261, projected: false },
  { year: 2000, total: 126926, young: 18472, working: 86220, elderly: 22005, projected: false },
  { year: 2005, total: 127768, young: 17521, working: 84092, elderly: 25672, projected: false },
  { year: 2008, total: 128084, young: 17176, working: 82300, elderly: 28216, projected: false }, // 人口ピーク年
  { year: 2010, total: 128057, young: 16803, working: 81032, elderly: 29246, projected: false },
  { year: 2015, total: 127095, young: 15951, working: 77282, elderly: 33869, projected: false },
  { year: 2020, total: 126146, young: 15032, working: 75088, elderly: 36027, projected: false },
  { year: 2024, total: 123802, young: 13830, working: 73728, elderly: 36243, projected: false },

  // --- 将来推計（社人研 令和5年推計：出生中位・死亡中位、および高位/低位総数） ---
  { year: 2025, total: 123262, young: 13633, working: 73101, elderly: 36529, totalHigh: 123460, totalLow: 123060, projected: true },
  { year: 2030, total: 120116, young: 12397, working: 70757, elderly: 36962, totalHigh: 121050, totalLow: 119180, projected: true },
  { year: 2035, total: 116639, young: 11691, working: 67216, elderly: 37732, totalHigh: 118350, totalLow: 115080, projected: true },
  { year: 2040, total: 112837, young: 11041, working: 62512, elderly: 39285, totalHigh: 115480, totalLow: 110680, projected: true },
  { year: 2045, total: 108801, young: 10735, working: 58615, elderly: 39451, totalHigh: 112450, totalLow: 105990, projected: true },
  { year: 2050, total: 104686, young: 10406, working: 55402, elderly: 38878, totalHigh: 109450, totalLow: 101210, projected: true },
  { year: 2055, total: 100508, young: 9659, working: 53070, elderly: 37779, totalHigh: 106310, totalLow: 96250, projected: true },
  { year: 2060, total: 96148, young: 8930, working: 50781, elderly: 36437, totalHigh: 102960, totalLow: 91120, projected: true },
  { year: 2065, total: 91587, young: 8360, working: 48093, elderly: 35134, totalHigh: 99350, totalLow: 85760, projected: true },
  { year: 2070, total: 86996, young: 7975, working: 45350, elderly: 33671, totalHigh: 95490, totalLow: 80240, projected: true },
];

export const PYRAMID_MILESTONES = [
  { year: 1950, label: '1950', sub: '戦後復興', shape: '富士山型', desc: '年少人口が35%超。第1次ベビーブーム（団塊の世代）が裾野を広げ、高齢者1人を12.1人の現役世代が支えた。' },
  { year: 1970, label: '1970', sub: '高度成長', shape: 'つりがね型への移行期', desc: '高齢化率が7.1%に達し「高齢化社会」へ。団塊の世代が20代となり、日本の高度経済成長を牽引した。' },
  { year: 1990, label: '1990', sub: 'バブル期', shape: 'ひょうたん型', desc: '団塊の世代（40代）と団塊ジュニア（10代後半）の2つのコブが鮮明。生産年齢人口比率がピーク圏へ。' },
  { year: 2008, label: '2008', sub: '人口ピーク', shape: 'つぼ型', desc: '日本の総人口が1億2,808万人で歴史的ピークを記録。2007年に高齢化率21%超の「超高齢社会」へ突入。' },
  { year: 2024, label: '2024', sub: '現在（実績）', shape: 'つぼ型（少子化加速）', desc: '団塊の世代が全員75歳以上の後期高齢者に到達する直前。高齢化率29.3%、出生数は初の70万人割れ。' },
  { year: 2040, label: '2040', sub: '2040年問題', shape: '逆さピラミッド型へ', desc: '団塊ジュニア世代が65歳以上となり、高齢者数は約3,928万人（2043年ピーク直前）。生産年齢人口が急減。' },
  { year: 2070, label: '2070', sub: '将来推計', shape: '逆さピラミッド型', desc: '総人口8,700万人、高齢化率38.7%（約2.6人に1人が高齢者）。高齢者1人を1.3人の現役世代で支える社会へ。' },
];

export const AGE_BRACKETS = [
  '0–4', '5–9', '10–14', '15–19', '20–24', '25–29',
  '30–34', '35–39', '40–44', '45–49', '50–54', '55–59',
  '60–64', '65–69', '70–74', '75–79', '80–84', '85–89', '90+'
];

/**
 * 出生コホート（出生年ごとの年間出生数・千人）のアンカー点
 * 1865年〜2070年までの歴史的出生推移と社人研推計を反映し、
 * 団塊の世代（1947-49）、ひのえうま（1966）、団塊ジュニア（1971-74）の波を正確に再現する。
 */
const BIRTH_COHORT_ANCHORS = [
  [1860, 850], [1875, 1020], [1890, 1250], [1900, 1420], [1910, 1710],
  [1920, 2025], [1925, 2086], [1930, 2085], [1935, 2190], [1940, 2115],
  [1943, 2253], [1945, 1685], [1946, 1905], [1947, 2679], [1948, 2682],
  [1949, 2697], [1950, 2338], [1952, 2005], [1955, 1731], [1958, 1653],
  [1960, 1606], [1963, 1660], [1965, 1824], [1966, 1361], [1967, 1936],
  [1970, 1934], [1971, 2001], [1972, 2039], [1973, 2092], [1974, 2030],
  [1975, 1901], [1978, 1709], [1980, 1577], [1985, 1432], [1990, 1222],
  [1995, 1187], [2000, 1191], [2005, 1063], [2010, 1071], [2015, 1006],
  [2018, 918], [2020, 841], [2022, 771], [2023, 727], [2024, 686],
  [2030, 740], [2040, 720], [2050, 660], [2060, 580], [2070, 510],
];

function getAnnualBirths(birthYear) {
  if (birthYear <= BIRTH_COHORT_ANCHORS[0][0]) return BIRTH_COHORT_ANCHORS[0][1];
  const last = BIRTH_COHORT_ANCHORS[BIRTH_COHORT_ANCHORS.length - 1];
  if (birthYear >= last[0]) return last[1];
  for (let i = 0; i < BIRTH_COHORT_ANCHORS.length - 1; i++) {
    const [y0, b0] = BIRTH_COHORT_ANCHORS[i];
    const [y1, b1] = BIRTH_COHORT_ANCHORS[i + 1];
    if (birthYear >= y0 && birthYear <= y1) {
      const t = (birthYear - y0) / (y1 - y0);
      return b0 + (b1 - b0) * t;
    }
  }
  return 1000;
}

/**
 * 年次ごとの公式年齢3区分人口（補間含む）を取得
 */
export function getPopulationAtYear(year) {
  const clamped = Math.max(1950, Math.min(2070, year));
  for (let i = 0; i < POPULATION_SERIES.length; i++) {
    if (POPULATION_SERIES[i].year === clamped) {
      return { ...POPULATION_SERIES[i] };
    }
    if (i < POPULATION_SERIES.length - 1) {
      const a = POPULATION_SERIES[i];
      const b = POPULATION_SERIES[i + 1];
      if (clamped > a.year && clamped < b.year) {
        const t = (clamped - a.year) / (b.year - a.year);
        const lerp = (u, v) => u + (v - u) * t;
        return {
          year: clamped,
          total: Math.round(lerp(a.total, b.total)),
          young: Math.round(lerp(a.young, b.young)),
          working: Math.round(lerp(a.working, b.working)),
          elderly: Math.round(lerp(a.elderly, b.elderly)),
          projected: clamped > 2024,
        };
      }
    }
  }
  return { ...POPULATION_SERIES[POPULATION_SERIES.length - 1] };
}

/**
 * コホート要因法モデルを各年の公式年齢3区分統計（年少・生産年齢・老年）に厳密キャリブレーションし、
 * 5歳階級×男女別の人口ピラミッドデータ（18階級）を生成する。
 * これにより、団塊の世代・団塊ジュニアの移動と公式統計の合計値が完全に整合する。
 */
const pyramidCache = new Map();

export function getPyramidData(year) {
  const y = Math.round(Math.max(1950, Math.min(2070, year)));
  if (pyramidCache.has(y)) return pyramidCache.get(y);

  const official = getPopulationAtYear(y);

  // 年次に応じた平均寿命（男女）の推移（厚労省・社人研ベース）
  const progress = Math.max(0, Math.min(1, (y - 1950) / 120));
  const maleLE = y <= 2024
    ? 58.0 + 23.1 * Math.pow((y - 1950) / 74, 0.72)
    : 81.1 + 4.8 * ((y - 2024) / 46);
  const femaleLE = y <= 2024
    ? 61.5 + 25.6 * Math.pow((y - 1950) / 74, 0.72)
    : 87.1 + 4.5 * ((y - 2024) / 46);

  // 戦争による1910-1925年生まれ男性の損耗効果（1950〜2000年代に顕著）
  const warLossFactor = (birthYear, isMale) => {
    if (!isMale) return 1.0;
    if (birthYear >= 1912 && birthYear <= 1925) {
      const center = 1919;
      const dist = Math.abs(birthYear - center) / 7;
      return 1.0 - 0.17 * Math.max(0, 1 - dist * dist);
    }
    return 1.0;
  };

  // ロジスティック生存関数（高齢期の死亡率カーブ：85歳以降の現実的な減衰を反映）
  const survival = (age, le) => {
    const k = 0.145 + 0.03 * progress;
    const infantSurvival = 0.93 + 0.068 * Math.min(1, (y - 1945) / 45);
    const adultCurve = 1 / (1 + Math.exp(k * (age - (le + 1.5))));
    const baseAtZero = 1 / (1 + Math.exp(k * (0 - (le + 1.5))));
    const oldAgeTail = age > 85 ? Math.exp(-0.11 * (age - 85)) : 1.0;
    return infantSurvival * (adultCurve / baseAtZero) * oldAgeTail;
  };

  const lastIdx = AGE_BRACKETS.length - 1;
  const raw = AGE_BRACKETS.map((label, idx) => {
    const ageStart = idx * 5;
    const ageEnd = idx === lastIdx ? 100 : ageStart + 4;
    let mSum = 0;
    let fSum = 0;

    for (let age = ageStart; age <= ageEnd; age++) {
      const birthYear = y - age;
      const births = getAnnualBirths(birthYear);
      // 出生性比 男 51.2% : 女 48.8%
      const mSurv = survival(age, maleLE) * warLossFactor(birthYear, true);
      const fSurv = survival(age, femaleLE);
      mSum += births * 0.512 * mSurv;
      fSum += births * 0.488 * fSurv;
    }

    const group = idx < 3 ? 'young' : idx < 13 ? 'working' : 'elderly';
    return {
      index: idx,
      label,
      ageStart,
      ageEnd: idx === lastIdx ? null : ageEnd,
      birthStart: idx === lastIdx ? null : y - ageEnd,
      birthEnd: y - ageStart,
      group,
      male: mSum,
      female: fSum,
    };
  });

  // 年齢3区分それぞれの合計を公式統計値に厳密一致させる
  const rawTotals = { young: 0, working: 0, elderly: 0 };
  for (const row of raw) {
    rawTotals[row.group] += row.male + row.female;
  }

  const scales = {
    young: official.young / (rawTotals.young || 1),
    working: official.working / (rawTotals.working || 1),
    elderly: official.elderly / (rawTotals.elderly || 1),
  };

  const brackets = raw.map((row) => {
    const s = scales[row.group];
    const male = Math.round(row.male * s);
    const female = Math.round(row.female * s);
    // 団塊の世代(1947-49)・団塊ジュニア(1971-74)が含まれる階級を判定
    const isDankai = row.birthStart !== null && row.birthStart <= 1949 && row.birthEnd >= 1947;
    const isDankaiJr = row.birthStart !== null && row.birthStart <= 1974 && row.birthEnd >= 1971;
    return {
      ...row,
      male,
      female,
      total: male + female,
      isDankai,
      isDankaiJr,
    };
  });

  const sumTotal = brackets.reduce((acc, b) => acc + b.total, 0);

  // 中位年齢を算出
  let cum = 0;
  let medianAge = 40;
  for (const b of brackets) {
    if (cum + b.total >= sumTotal / 2) {
      const frac = (sumTotal / 2 - cum) / (b.total || 1);
      medianAge = +(b.ageStart + frac * 5).toFixed(1);
      break;
    }
    cum += b.total;
  }

  const agingRate = +((official.elderly / official.total) * 100).toFixed(1);
  const youngRate = +((official.young / official.total) * 100).toFixed(1);
  const workingRate = +((official.working / official.total) * 100).toFixed(1);
  const supportRatio = +(official.working / official.elderly).toFixed(1);

  const shapeLabel =
    y < 1965 ? '富士山型' :
    y < 1985 ? 'つりがね型' :
    y < 2005 ? 'ひょうたん・つぼ移行期' :
    y < 2035 ? 'つぼ型' :
    '逆さピラミッド型';

  const result = {
    year: y,
    projected: y > 2024,
    total: official.total,
    young: official.young,
    working: official.working,
    elderly: official.elderly,
    agingRate,
    youngRate,
    workingRate,
    supportRatio,
    medianAge,
    shapeLabel,
    brackets,
  };

  pyramidCache.set(y, result);
  return result;
}
