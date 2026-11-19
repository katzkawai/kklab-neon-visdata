/**
 * 47都道府県別 少子高齢化データ（2024年公式統計）
 *
 * 出典:
 * - agingRate (高齢化率・65歳以上人口割合 %): 総務省統計局「人口推計（2024年10月1日現在）」 全国 29.3%
 * - tfr (合計特殊出生率): 厚生労働省「人口動態統計（令和6年/2024年確定数）」 全国 1.15
 * - popChange (人口増減率・前年比 %): 総務省統計局「人口推計（2024年10月1日現在）」 全国 -0.44%
 *
 * col, row: 14×12 日本列島タイル地図（カラムマップ）上の座標
 */

export const NATIONAL_AVG = {
  agingRate: 29.3,
  tfr: 1.15,
  popChange: -0.44,
};

export const REGIONS = [
  { id: 'all', label: '全国（47）', color: '#334155' },
  { id: 'hokkaido-tohoku', label: '北海道・東北', color: '#2563EB' },
  { id: 'kanto', label: '関東', color: '#DC2626' },
  { id: 'chubu', label: '中部', color: '#D97706' },
  { id: 'kinki', label: '近畿', color: '#7C3AED' },
  { id: 'chugoku-shikoku', label: '中国・四国', color: '#0891B2' },
  { id: 'kyushu-okinawa', label: '九州・沖縄', color: '#059669' },
];

export const REGION_COLOR_MAP = Object.fromEntries(REGIONS.map((r) => [r.id, r.color]));

export const PREFECTURES = [
  // 北海道・東北
  { code: '01', name: '北海道', short: '北海', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 33.3, tfr: 1.01, popChange: -0.97, col: 13, row: 0 },
  { code: '02', name: '青森県', short: '青森', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 35.7, tfr: 1.14, popChange: -1.66, col: 12, row: 1 },
  { code: '03', name: '岩手県', short: '岩手', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 35.4, tfr: 1.09, popChange: -1.57, col: 12, row: 2 },
  { code: '04', name: '宮城県', short: '宮城', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 29.6, tfr: 1.00, popChange: -0.73, col: 12, row: 3 },
  { code: '05', name: '秋田県', short: '秋田', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 39.5, tfr: 1.04, popChange: -1.87, col: 11, row: 2 },
  { code: '06', name: '山形県', short: '山形', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 35.6, tfr: 1.17, popChange: -1.49, col: 11, row: 3 },
  { code: '07', name: '福島県', short: '福島', region: 'hokkaido-tohoku', regionLabel: '北海道・東北', agingRate: 33.7, tfr: 1.15, popChange: -1.35, col: 11, row: 4 },

  // 関東
  { code: '08', name: '茨城県', short: '茨城', region: 'kanto', regionLabel: '関東', agingRate: 30.9, tfr: 1.16, popChange: -0.64, col: 12, row: 5 },
  { code: '09', name: '栃木県', short: '栃木', region: 'kanto', regionLabel: '関東', agingRate: 30.5, tfr: 1.15, popChange: -0.66, col: 11, row: 5 },
  { code: '10', name: '群馬県', short: '群馬', region: 'kanto', regionLabel: '関東', agingRate: 31.1, tfr: 1.20, popChange: -0.62, col: 10, row: 5 },
  { code: '11', name: '埼玉県', short: '埼玉', region: 'kanto', regionLabel: '関東', agingRate: 27.5, tfr: 1.09, popChange: +0.01, col: 10, row: 6 },
  { code: '12', name: '千葉県', short: '千葉', region: 'kanto', regionLabel: '関東', agingRate: 28.1, tfr: 1.09, popChange: -0.08, col: 12, row: 6 },
  { code: '13', name: '東京都', short: '東京', region: 'kanto', regionLabel: '関東', agingRate: 22.7, tfr: 0.96, popChange: +0.66, col: 11, row: 6 },
  { code: '14', name: '神奈川県', short: '神奈', region: 'kanto', regionLabel: '関東', agingRate: 26.0, tfr: 1.08, popChange: -0.05, col: 11, row: 7 },

  // 中部
  { code: '15', name: '新潟県', short: '新潟', region: 'chubu', regionLabel: '中部', agingRate: 34.2, tfr: 1.14, popChange: -1.29, col: 10, row: 4 },
  { code: '16', name: '富山県', short: '富山', region: 'chubu', regionLabel: '中部', agingRate: 33.2, tfr: 1.29, popChange: -1.00, col: 8, row: 5 },
  { code: '17', name: '石川県', short: '石川', region: 'chubu', regionLabel: '中部', agingRate: 30.7, tfr: 1.23, popChange: -1.00, col: 7, row: 5 },
  { code: '18', name: '福井県', short: '福井', region: 'chubu', regionLabel: '中部', agingRate: 31.8, tfr: 1.46, popChange: -0.77, col: 7, row: 6 },
  { code: '19', name: '山梨県', short: '山梨', region: 'chubu', regionLabel: '中部', agingRate: 32.0, tfr: 1.26, popChange: -0.63, col: 9, row: 6 },
  { code: '20', name: '長野県', short: '長野', region: 'chubu', regionLabel: '中部', agingRate: 32.9, tfr: 1.30, popChange: -0.84, col: 9, row: 5 },
  { code: '21', name: '岐阜県', short: '岐阜', region: 'chubu', regionLabel: '中部', agingRate: 31.4, tfr: 1.27, popChange: -0.81, col: 8, row: 6 },
  { code: '22', name: '静岡県', short: '静岡', region: 'chubu', regionLabel: '中部', agingRate: 31.2, tfr: 1.19, popChange: -0.80, col: 10, row: 7 },
  { code: '23', name: '愛知県', short: '愛知', region: 'chubu', regionLabel: '中部', agingRate: 25.8, tfr: 1.22, popChange: -0.23, col: 9, row: 7 },

  // 近畿
  { code: '24', name: '三重県', short: '三重', region: 'kinki', regionLabel: '近畿', agingRate: 30.9, tfr: 1.24, popChange: -0.94, col: 9, row: 8 },
  { code: '25', name: '滋賀県', short: '滋賀', region: 'kinki', regionLabel: '近畿', agingRate: 27.2, tfr: 1.32, popChange: -0.32, col: 8, row: 7 },
  { code: '26', name: '京都府', short: '京都', region: 'kinki', regionLabel: '近畿', agingRate: 29.8, tfr: 1.05, popChange: -0.60, col: 7, row: 7 },
  { code: '27', name: '大阪府', short: '大阪', region: 'kinki', regionLabel: '近畿', agingRate: 27.6, tfr: 1.14, popChange: -0.07, col: 7, row: 8 },
  { code: '28', name: '兵庫県', short: '兵庫', region: 'kinki', regionLabel: '近畿', agingRate: 30.2, tfr: 1.23, popChange: -0.61, col: 6, row: 7 },
  { code: '29', name: '奈良県', short: '奈良', region: 'kinki', regionLabel: '近畿', agingRate: 32.9, tfr: 1.19, popChange: -0.80, col: 8, row: 8 },
  { code: '30', name: '和歌山県', short: '和歌', region: 'kinki', regionLabel: '近畿', agingRate: 34.4, tfr: 1.24, popChange: -1.34, col: 8, row: 9 },

  // 中国・四国
  { code: '31', name: '鳥取県', short: '鳥取', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 33.7, tfr: 1.43, popChange: -1.16, col: 5, row: 7 },
  { code: '32', name: '島根県', short: '島根', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 35.2, tfr: 1.43, popChange: -1.16, col: 4, row: 7 },
  { code: '33', name: '岡山県', short: '岡山', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 31.2, tfr: 1.27, popChange: -0.84, col: 6, row: 8 },
  { code: '34', name: '広島県', short: '広島', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 30.4, tfr: 1.29, popChange: -0.86, col: 5, row: 8 },
  { code: '35', name: '山口県', short: '山口', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 35.5, tfr: 1.36, popChange: -1.26, col: 4, row: 8 },
  { code: '36', name: '徳島県', short: '徳島', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 35.8, tfr: 1.32, popChange: -1.36, col: 6, row: 10 },
  { code: '37', name: '香川県', short: '香川', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 32.8, tfr: 1.36, popChange: -0.93, col: 6, row: 9 },
  { code: '38', name: '愛媛県', short: '愛媛', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 34.5, tfr: 1.28, popChange: -1.22, col: 5, row: 9 },
  { code: '39', name: '高知県', short: '高知', region: 'chugoku-shikoku', regionLabel: '中国・四国', agingRate: 36.6, tfr: 1.25, popChange: -1.56, col: 5, row: 10 },

  // 九州・沖縄
  { code: '40', name: '福岡県', short: '福岡', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 28.6, tfr: 1.22, popChange: -0.21, col: 2, row: 8 },
  { code: '41', name: '佐賀県', short: '佐賀', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 32.0, tfr: 1.41, popChange: -0.82, col: 1, row: 8 },
  { code: '42', name: '長崎県', short: '長崎', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 34.7, tfr: 1.39, popChange: -1.21, col: 0, row: 9 },
  { code: '43', name: '熊本県', short: '熊本', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 32.6, tfr: 1.39, popChange: -0.69, col: 1, row: 9 },
  { code: '44', name: '大分県', short: '大分', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 34.4, tfr: 1.37, popChange: -1.00, col: 2, row: 9 },
  { code: '45', name: '宮崎県', short: '宮崎', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 34.0, tfr: 1.43, popChange: -0.89, col: 2, row: 10 },
  { code: '46', name: '鹿児島県', short: '鹿児', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 34.2, tfr: 1.38, popChange: -1.10, col: 1, row: 10 },
  { code: '47', name: '沖縄県', short: '沖縄', region: 'kyushu-okinawa', regionLabel: '九州・沖縄', agingRate: 24.2, tfr: 1.54, popChange: -0.11, col: 0, row: 11 },
];

// 順位（1〜47位）を事前計算して付与
function computeRanks(arr, key, desc = true) {
  const sorted = [...arr].sort((a, b) => (desc ? b[key] - a[key] : a[key] - b[key]));
  const rankMap = new Map();
  let lastVal = null;
  let lastRank = 0;
  sorted.forEach((item, idx) => {
    if (item[key] !== lastVal) {
      lastRank = idx + 1;
      lastVal = item[key];
    }
    rankMap.set(item.code, lastRank);
  });
  return rankMap;
}

const agingRanks = computeRanks(PREFECTURES, 'agingRate', true);
const tfrRanks = computeRanks(PREFECTURES, 'tfr', true);
const popChangeRanks = computeRanks(PREFECTURES, 'popChange', true);

PREFECTURES.forEach((p) => {
  p.agingRank = agingRanks.get(p.code);
  p.tfrRank = tfrRanks.get(p.code);
  p.popChangeRank = popChangeRanks.get(p.code);
});
