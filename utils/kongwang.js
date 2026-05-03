/**
 * 旬空 / 月破 / 日冲 判定
 */
const { BRANCHES, SIX_CLASH } = require('../data/constants')

// 旬空表: 天干序号(0-9) → [空亡地支1, 空亡地支2]
// 六十甲子每旬10天，对应一组空亡地支
const KONG_TABLE = [
  // 天干序号范围 → 空亡地支 (索引)
  // 甲0-乙1-丙2-丁3-戊4-己5-庚6-辛7-壬8-癸9
  [10, 11],  // 甲子旬: 戌(10)亥(11)
  [8, 9],    // 甲戌旬: 申(8)酉(9)
  [6, 7],    // 甲申旬: 午(6)未(7)
  [4, 5],    // 甲午旬: 辰(4)巳(5)
  [2, 3],    // 甲辰旬: 寅(2)卯(3)
  [0, 1],    // 甲寅旬: 子(0)丑(1)
]

/**
 * 获取今日旬空的地支
 * @param {number} dayStemIndex - 天干序号 (0-9)
 * @returns {number[]} 空亡地支的索引数组
 */
function getKongBranches(dayStemIndex) {
  const tableIdx = Math.floor(dayStemIndex)  // 天干序号0-9 对应 旬表0
  // 实际需要用六十甲子序号来查，但这里用天干做简化
  // 精确做法：用六十甲子序号 ÷ 10 取整
  // dayIndex % 60, 然后 Math.floor(dayIndex / 10)
  return KONG_TABLE[tableIdx] || []
}

/**
 * 精确的旬空判定（使用六十甲子序号）
 * @param {number} dayIndex - 六十甲子序号 (0-59)
 * @returns {string[]} 空亡地支名称数组
 */
function getKongBranchesByIndex(dayIndex) {
  const tableIdx = Math.floor((dayIndex % 60) / 10)
  const indices = KONG_TABLE[tableIdx] || []
  return indices.map(i => BRANCHES[i])
}

/**
 * 旬空判定：某爻是否逢空
 * @param {string} branch - 爻的地支
 * @param {number} dayIndex - 六十甲子序号
 * @returns {boolean}
 */
function isKongWang(branch, dayIndex) {
  const kongBranches = getKongBranchesByIndex(dayIndex)
  return kongBranches.includes(branch)
}

/**
 * 月破判定：某爻是否月破（月建所冲）
 * @param {string} branch - 爻的地支
 * @param {string} monthBranch - 月建地支
 * @returns {boolean}
 */
function isMonthBroken(branch, monthBranch) {
  if (!branch || !monthBranch) return false
  return SIX_CLASH[branch] === monthBranch
}

/**
 * 日冲判定：某爻是否日冲（日辰所冲）
 * @param {string} branch - 爻的地支
 * @param {string} dayBranch - 日辰地支
 * @param {boolean} isMoving - 是否为动爻
 * @returns {{ isClashed: boolean, effect: string, score: number }}
 *   静爻逢冲为暗动(+6)，动爻逢冲为散(-6)
 */
function judgeDayClash(branch, dayBranch, isMoving) {
  if (!branch || !dayBranch) return { isClashed: false, effect: '', score: 0 }
  if (SIX_CLASH[branch] !== dayBranch) return { isClashed: false, effect: '', score: 0 }

  if (isMoving) {
    return { isClashed: true, effect: '散', score: -6 }
  }
  return { isClashed: true, effect: '暗动', score: 6 }
}

module.exports = {
  getKongBranchesByIndex,
  isKongWang,
  isMonthBroken,
  judgeDayClash
}
