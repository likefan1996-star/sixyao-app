/**
 * 工具函数（兼容层）
 *
 * YaoTypeMap 已迁移至 data/constants.js
 * HexagramMap 已迁移至 data/hexagrams.js
 * 排盘引擎统一使用 utils/paipan.js
 */

/** 六爻类型映射（保留兼容） */
const YaoTypeMap = {
  laoyang:  { symbol: '⚊', name: '老阳', value: 'yang', moving: true, num: 9 },
  shaoyin:  { symbol: '⚋', name: '少阴', value: 'yin',  moving: false, num: 8 },
  shaoyang: { symbol: '⚊', name: '少阳', value: 'yang', moving: false, num: 7 },
  laoyin:   { symbol: '⚋', name: '老阴', value: 'yin',  moving: true, num: 6 },
}

module.exports = { YaoTypeMap }
