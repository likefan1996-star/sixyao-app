/**
 * 纳甲子模块 - 根据卦的下卦和上卦获取各爻天干地支
 */

const NAJIA_DATA = require('../data/najia')

/**
 * 获取某卦各爻的干支赋值
 * @param {string} lowerTrigram - 下卦（内卦）名
 * @param {string} upperTrigram - 上卦（外卦）名
 * @returns {Array<{stem:string, branch:string, stemIndex:number, branchIndex:number}>}
 *   长度为6，对应初爻→上爻
 *
 * 纳甲规则：内卦取该卦纳甲的前三爻（初、二、三）
 *          外卦取该卦纳甲的后三爻（四、五、上）
 */
function getNajia(lowerTrigram, upperTrigram) {
  const lower = NAJIA_DATA[lowerTrigram]
  const upper = NAJIA_DATA[upperTrigram]

  if (!lower || !upper) {
    // fallback: 返回空值
    return [
      { stem: '', branch: '', stemIndex: -1, branchIndex: -1 },
      { stem: '', branch: '', stemIndex: -1, branchIndex: -1 },
      { stem: '', branch: '', stemIndex: -1, branchIndex: -1 },
      { stem: '', branch: '', stemIndex: -1, branchIndex: -1 },
      { stem: '', branch: '', stemIndex: -1, branchIndex: -1 },
      { stem: '', branch: '', stemIndex: -1, branchIndex: -1 }
    ]
  }

  // 内卦取下卦的前三爻（初、二、三）
  // 外卦取上卦的后三爻（四、五、上）
  return [
    lower[0], // 初爻
    lower[1], // 二爻
    lower[2], // 三爻
    upper[3], // 四爻
    upper[4], // 五爻
    upper[5]  // 上爻
  ]
}

module.exports = { getNajia }
