/**
 * 日辰十二宫生旺墓绝判定
 *
 * 五行长生十二宫：从长生到养，循环往复。
 * 简化版：只取关键状态分段赋分。
 *
 * 重要状态:
 *   临官/帝旺 → +8  (强)
 *   长生/沐浴/冠带 → +8 (亦属旺盛期)
 *   衰/病 → 0
 *   死/墓/绝 → -8  (极弱)
 *   胎/养 → +4  (萌芽)
 */
const { BRANCH_ELEMENT } = require('../data/constants')

const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

// 五行长生起始位置（地支索引，0=子）
const START_INDEX = {
  '木': 10,  // 木长生在亥
  '火': 2,   // 火长生在寅
  '金': 5,   // 金长生在巳
  '水': 8,   // 水土长生在申
  '土': 8
}

const STAGE_NAMES = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养']

// 各阶段计分：[强(8), 萌芽(4), 弱(-8)]
function stageScore(stageIndex) {
  if (stageIndex <= 4) return 8   // 长生~帝旺
  if (stageIndex <= 6) return 0   // 衰~病
  if (stageIndex <= 9) return -8  // 死~墓~绝
  return 4                         // 胎~养
}

/**
 * 判定日辰对某爻的影响
 * @param {string} dayBranch - 日辰地支
 * @param {string} branch - 爻的地支
 * @returns {{ score: number, stage: string }}
 */
function judgeDay(dayBranch, branch) {
  if (!dayBranch || !branch) return { score: 0, stage: '未知' }

  const el = BRANCH_ELEMENT[branch]
  if (!el) return { score: 0, stage: '未知' }

  const startIdx = START_INDEX[el]
  if (startIdx === undefined) return { score: 0, stage: '未知' }

  const dayIdx = BRANCHES.indexOf(dayBranch)
  if (dayIdx === -1) return { score: 0, stage: '未知' }

  const stageIdx = ((dayIdx - startIdx) + 12) % 12
  return {
    score: stageScore(stageIdx),
    stage: STAGE_NAMES[stageIdx]
  }
}

module.exports = { judgeDay, STAGE_NAMES }
