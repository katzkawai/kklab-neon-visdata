/**
 * 高齢化率の国際比較データ（1950〜2050年）および倍加年数
 *
 * 出典:
 * - 内閣府「高齢社会白書」
 * - 国連「World Population Prospects」
 * - 日本は総務省「国勢調査」「人口推計」および社人研「日本の将来推計人口（令和5年推計）」
 */

export const DOUBLING_YEARS = [
  { id: 'kr', name: '韓国', years: 18, reached7: 1999, reached14: 2017, reached21: 2025, region: 'asia', color: '#7C3AED' },
  { id: 'sg', name: 'シンガポール', years: 20, reached7: 1999, reached14: 2019, reached21: 2026, region: 'asia', color: '#0891B2' },
  { id: 'cn', name: '中国', years: 23, reached7: 2000, reached14: 2023, reached21: 2033, region: 'asia', color: '#D97706' },
  { id: 'jp', name: '日本', years: 24, reached7: 1970, reached14: 1994, reached21: 2007, region: 'japan', color: '#DC2626' },
  { id: 'de', name: 'ドイツ', years: 40, reached7: 1932, reached14: 1972, reached21: 2014, region: 'west', color: '#475569' },
  { id: 'uk', name: 'イギリス', years: 46, reached7: 1929, reached14: 1975, reached21: 2029, region: 'west', color: '#64748B' },
  { id: 'us', name: 'アメリカ', years: 72, reached7: 1942, reached14: 2014, reached21: 2032, region: 'west', color: '#2563EB' },
  { id: 'se', name: 'スウェーデン', years: 85, reached7: 1887, reached14: 1972, reached21: 2024, region: 'west', color: '#0D9488' },
  { id: 'fr', name: 'フランス', years: 127, reached7: 1864, reached14: 1991, reached21: 2021, region: 'west', color: '#6366F1' },
];

export const INTERNATIONAL_YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2024, 2030, 2040, 2050];

export const INTERNATIONAL_TRAJECTORIES = [
  {
    id: 'jp',
    name: '日本',
    color: '#DC2626',
    emphasis: true,
    values: [4.9, 5.7, 7.1, 9.1, 12.1, 17.4, 23.0, 28.6, 29.3, 30.8, 34.8, 37.1],
  },
  {
    id: 'kr',
    name: '韓国',
    color: '#7C3AED',
    emphasis: false,
    values: [2.9, 3.3, 3.1, 3.8, 5.1, 7.2, 10.8, 15.8, 19.2, 25.3, 34.4, 40.1],
  },
  {
    id: 'de',
    name: 'ドイツ',
    color: '#475569',
    emphasis: false,
    values: [9.7, 11.5, 13.7, 15.6, 14.9, 16.4, 20.6, 21.9, 23.0, 26.2, 28.8, 30.0],
  },
  {
    id: 'fr',
    name: 'フランス',
    color: '#6366F1',
    emphasis: false,
    values: [11.4, 11.6, 12.9, 14.0, 14.0, 16.0, 16.9, 20.8, 22.0, 24.4, 27.1, 28.2],
  },
  {
    id: 'se',
    name: 'スウェーデン',
    color: '#0D9488',
    emphasis: false,
    values: [10.3, 11.8, 13.7, 16.3, 17.8, 17.3, 18.2, 20.1, 20.7, 22.2, 23.8, 25.0],
  },
  {
    id: 'cn',
    name: '中国',
    color: '#D97706',
    emphasis: false,
    values: [4.5, 3.9, 3.7, 4.4, 5.4, 6.8, 8.2, 12.6, 14.7, 18.2, 26.2, 30.1],
  },
  {
    id: 'us',
    name: 'アメリカ',
    color: '#2563EB',
    emphasis: false,
    values: [8.3, 9.2, 9.8, 11.3, 12.5, 12.4, 13.1, 16.2, 17.9, 20.4, 21.8, 22.8],
  },
];
