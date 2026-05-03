/**
 * 世应定位 - 根据卦的世应类型确定世爻和应爻位置
 */

const { SHIYING_MAP } = require('../data/constants')

/**
 * 获取世爻和应爻的位置
 * @param {string} generation - 世应类型
 *   "pure"    - 八纯卦（世在上爻，应在三爻）
 *   "first"   - 一世卦（世在初爻，应在四爻）
 *   "second"  - 二世卦（世在二爻，应在五爻）
 *   "third"   - 三世卦（世在三爻，应在六爻）
 *   "fourth"  - 四世卦（世在四爻，应在初爻）
 *   "fifth"   - 五世卦（世在五爻，应在二爻）
 *   "youhun"  - 游魂卦（世在四爻，应在初爻）
 *   "guihun"  - 归魂卦（世在三爻，应在六爻）
 * @returns {{ shi: number, ying: number }}
 *   位置从1开始计数（1=初爻，6=上爻）
 */
function getShiYing(generation) {
  const rule = SHIYING_MAP[generation]
  if (!rule) {
    // 未知类型，默认为八纯卦
    return { shi: 6, ying: 3 }
  }
  return { shi: rule.shi, ying: rule.ying }
}

module.exports = { getShiYing }
