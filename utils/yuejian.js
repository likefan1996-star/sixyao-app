/**
 * 月建旺相休囚死判定
 *
 * 月建（月令）主管当月五行旺衰。
 * 当令者旺，令生者相，生令者休，克令者囚，令克者死。
 *
 * 分值: 旺=+10, 相=+6, 休=0, 囚=-6, 死=-10
 */
const { BRANCH_ELEMENT, ELEMENT_GENERATES, ELEMENT_OVERRIDES } = require('../data/constants')

// 月建地支 → 所属季节的当令五行
function getSeasonElement(monthBranch) {
  const seasonMap = {
    '寅': '木', '卯': '木', '辰': '木',
    '巳': '火', '午': '火', '未': '火',
    '申': '金', '酉': '金', '戌': '金',
    '亥': '水', '子': '水', '丑': '水'
  }
  return seasonMap[monthBranch] || '土'
}

/**
 * 判定一爻在月建上的旺衰
 * @param {string} monthBranch - 月建地支（如 '寅'）
 * @param {string} branch - 爻的地支
 * @returns {{ score: number, label: string }}
 */
function judgeYue(monthBranch, branch) {
  if (!monthBranch || !branch) return { score: 0, label: '未知' }

  const seasonEl = getSeasonElement(monthBranch)
  const branchEl = BRANCH_ELEMENT[branch]
  if (!branchEl) return { score: 0, label: '未知' }

  if (branchEl === seasonEl) {
    return { score: 10, label: '旺' }
  }
  if (ELEMENT_GENERATES[seasonEl] === branchEl) {
    return { score: 6, label: '相' }
  }
  if (ELEMENT_GENERATES[branchEl] === seasonEl) {
    return { score: 0, label: '休' }
  }
  if (ELEMENT_OVERRIDES[seasonEl] === branchEl) {
    return { score: -10, label: '死' }
  }
  if (ELEMENT_OVERRIDES[branchEl] === seasonEl) {
    return { score: -6, label: '囚' }
  }
  return { score: 0, label: '平' }
}

module.exports = { judgeYue, getSeasonElement }
