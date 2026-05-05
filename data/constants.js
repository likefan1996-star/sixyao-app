/**
 * 六爻通用常量和映射表
 * 供排盘引擎各模块引用
 */

// 爻类型 → 二进制值
const YAO_BINARY = {
  laoyang: 1,
  shaoyin: 0,
  shaoyang: 1,
  laoyin: 0
}

// 爻类型 → 是否动爻
const YAO_MOVING = {
  laoyang: true,
  shaoyin: false,
  shaoyang: false,
  laoyin: true
}

// 爻类型 → 阴阳标记（用于UI展示）
const YAO_SYMBOL = {
  laoyang: '⚊',
  shaoyin: '⚋',
  shaoyang: '⚊',
  laoyin: '⚋'
}

// 爻类型 → 动爻标记（静爻不显示额外标记）
const YAO_CHAR = {
  laoyang: '○',
  shaoyin: '',
  shaoyang: '',
  laoyin: '×'
}

// 天干列表
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支列表
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 地支配五行
const BRANCH_ELEMENT = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水'
}

// 天干配五行
const STEM_ELEMENT = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

// 五行生：木→火→土→金→水→木
const ELEMENT_GENERATES = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木'
}

// 五行克：木→土→水→火→金→木
const ELEMENT_OVERRIDES = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木'
}

// 世应定位规则
// key = 卦的generation值, value = { shi: 世爻位置(1-6), ying: 应爻位置(1-6) }
const SHIYING_MAP = {
  'pure':   { shi: 6, ying: 3 },  // 八纯卦
  'first':  { shi: 1, ying: 4 },  // 一世卦
  'second': { shi: 2, ying: 5 },  // 二世卦
  'third':  { shi: 3, ying: 6 },  // 三世卦
  'fourth': { shi: 4, ying: 1 },  // 四世卦
  'fifth':  { shi: 5, ying: 2 },  // 五世卦
  'youhun': { shi: 4, ying: 1 },  // 游魂卦
  'guihun': { shi: 3, ying: 6 }   // 归魂卦
}

// 六神顺序（按天干起始）
const LIUSHEN_ORDER = {
  '甲': ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'],
  '乙': ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'],
  '丙': ['朱雀', '勾陈', '腾蛇', '白虎', '玄武', '青龙'],
  '丁': ['朱雀', '勾陈', '腾蛇', '白虎', '玄武', '青龙'],
  '戊': ['勾陈', '腾蛇', '白虎', '玄武', '青龙', '朱雀'],
  '己': ['勾陈', '腾蛇', '白虎', '玄武', '青龙', '朱雀'],
  '庚': ['白虎', '玄武', '青龙', '朱雀', '勾陈', '腾蛇'],
  '辛': ['白虎', '玄武', '青龙', '朱雀', '勾陈', '腾蛇'],
  '壬': ['玄武', '青龙', '朱雀', '勾陈', '腾蛇', '白虎'],
  '癸': ['玄武', '青龙', '朱雀', '勾陈', '腾蛇', '白虎']
}

// 六合：地支六合
const SIX_COMBINATION = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午'
}

// 六冲：地支六冲
const SIX_CLASH = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳'
}

// 六亲类型列表
const LIUQIN_TYPES = ['父母', '兄弟', '官鬼', '妻财', '子孙']

module.exports = {
  YAO_BINARY,
  YAO_MOVING,
  YAO_SYMBOL,
  YAO_CHAR,
  STEMS,
  BRANCHES,
  BRANCH_ELEMENT,
  STEM_ELEMENT,
  ELEMENT_GENERATES,
  ELEMENT_OVERRIDES,
  SHIYING_MAP,
  LIUSHEN_ORDER,
  SIX_COMBINATION,
  SIX_CLASH,
  LIUQIN_TYPES
}
