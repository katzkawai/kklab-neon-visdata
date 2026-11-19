/**
 * 日本の人口動態統計（1947〜2024年）
 *
 * 出典: 厚生労働省「人口動態統計」（確定数）
 * - births: 出生数（千人）
 * - deaths: 死亡数（千人）
 * - tfr: 合計特殊出生率
 * 注: 1947〜1972年は沖縄県を含まない。
 */

export const REPLACEMENT_TFR = 2.07;

export const VITALS_SERIES = [
  { year: 1947, births: 2678.8, deaths: 1138.2, tfr: 4.54, note: '第1次ベビーブーム開始（団塊の世代）' },
  { year: 1948, births: 2681.6, deaths: 950.6, tfr: 4.40 },
  { year: 1949, births: 2696.6, deaths: 945.4, tfr: 4.32, note: '戦後最多の出生数（269.7万人）' },
  { year: 1950, births: 2337.5, deaths: 904.9, tfr: 3.65 },
  { year: 1952, births: 2005.2, deaths: 765.1, tfr: 2.98 },
  { year: 1955, births: 1730.7, deaths: 693.5, tfr: 2.37 },
  { year: 1957, births: 1566.7, deaths: 752.4, tfr: 2.04 },
  { year: 1960, births: 1606.0, deaths: 706.6, tfr: 2.00 },
  { year: 1963, births: 1659.5, deaths: 670.8, tfr: 2.00 },
  { year: 1965, births: 1823.7, deaths: 700.4, tfr: 2.14 },
  { year: 1966, births: 1361.0, deaths: 670.3, tfr: 1.58, note: 'ひのえうま（丙午）により一時急減' },
  { year: 1967, births: 1935.6, deaths: 675.0, tfr: 2.23 },
  { year: 1970, births: 1934.2, deaths: 713.0, tfr: 2.13 },
  { year: 1971, births: 2001.0, deaths: 684.5, tfr: 2.16, note: '第2次ベビーブーム開始（団塊ジュニア）' },
  { year: 1973, births: 2092.0, deaths: 709.4, tfr: 2.14, note: '第2次ベビーブームのピーク（209.2万人）' },
  { year: 1974, births: 2029.9, deaths: 710.5, tfr: 2.05, note: '人口置換水準（2.07）を下回り以後継続' },
  { year: 1975, births: 1901.4, deaths: 702.3, tfr: 1.91 },
  { year: 1978, births: 1708.6, deaths: 695.8, tfr: 1.79 },
  { year: 1980, births: 1576.9, deaths: 722.8, tfr: 1.75 },
  { year: 1982, births: 1515.4, deaths: 711.9, tfr: 1.77 },
  { year: 1984, births: 1489.8, deaths: 740.2, tfr: 1.81 },
  { year: 1985, births: 1431.6, deaths: 752.3, tfr: 1.76 },
  { year: 1987, births: 1346.7, deaths: 751.2, tfr: 1.69 },
  { year: 1989, births: 1246.8, deaths: 788.6, tfr: 1.57, note: '1.57ショック（ひのえうまの1.58を下回る）' },
  { year: 1990, births: 1221.6, deaths: 820.3, tfr: 1.54 },
  { year: 1993, births: 1188.3, deaths: 878.5, tfr: 1.46 },
  { year: 1995, births: 1187.1, deaths: 922.1, tfr: 1.42 },
  { year: 1998, births: 1203.1, deaths: 936.5, tfr: 1.38 },
  { year: 2000, births: 1190.5, deaths: 961.7, tfr: 1.36 },
  { year: 2003, births: 1123.6, deaths: 1015.0, tfr: 1.29 },
  { year: 2005, births: 1062.5, deaths: 1083.8, tfr: 1.26, note: '戦後初の自然減（死亡数が出生数を上回る）' },
  { year: 2006, births: 1092.7, deaths: 1084.5, tfr: 1.32 },
  { year: 2007, births: 1089.8, deaths: 1108.3, tfr: 1.34, note: '以降、現在まで毎年自然減が継続' },
  { year: 2008, births: 1091.2, deaths: 1142.4, tfr: 1.37 },
  { year: 2010, births: 1071.3, deaths: 1197.0, tfr: 1.39 },
  { year: 2012, births: 1037.2, deaths: 1256.4, tfr: 1.41 },
  { year: 2014, births: 1003.5, deaths: 1273.0, tfr: 1.42 },
  { year: 2015, births: 1005.7, deaths: 1290.4, tfr: 1.45, note: '近年の出生率の小ピーク（1.45）' },
  { year: 2016, births: 977.0, deaths: 1307.7, tfr: 1.44, note: '出生数が統計開始以来初の100万人割れ' },
  { year: 2017, births: 946.1, deaths: 1340.4, tfr: 1.43 },
  { year: 2018, births: 918.4, deaths: 1362.5, tfr: 1.42 },
  { year: 2019, births: 865.2, deaths: 1381.1, tfr: 1.36 },
  { year: 2020, births: 840.8, deaths: 1372.8, tfr: 1.33, note: 'コロナ禍で婚姻・出生の減少が加速' },
  { year: 2021, births: 811.6, deaths: 1439.9, tfr: 1.30 },
  { year: 2022, births: 770.8, deaths: 1569.0, tfr: 1.26 },
  { year: 2023, births: 727.3, deaths: 1576.0, tfr: 1.20 },
  { year: 2024, births: 686.2, deaths: 1605.4, tfr: 1.15, note: '初の70万人割れ・出生率1.15（過去最低）・自然減91.9万人' },
];

export const VITALS_ANNOTATIONS = [
  { year: 1949, label: '第1次ベビーブーム', sub: '269.7万人', side: 'births', dx: 4, dy: -22 },
  { year: 1966, label: 'ひのえうま', sub: '1.58', side: 'tfr', dx: 0, dy: 28 },
  { year: 1973, label: '第2次ベビーブーム', sub: '209.2万人', side: 'births', dx: 0, dy: -22 },
  { year: 1989, label: '1.57ショック', sub: '', side: 'tfr', dx: 0, dy: 24 },
  { year: 2005, label: '初の自然減', sub: '死亡 > 出生', side: 'cross', dx: -8, dy: -32 },
  { year: 2016, label: '100万人割れ', sub: '97.7万人', side: 'births', dx: -14, dy: 26 },
  { year: 2024, label: '68.6万人 / 1.15', sub: '過去最低', side: 'end', dx: -6, dy: 24 },
];
