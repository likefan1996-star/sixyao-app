/**
 * 六亲装配 - 根据卦宫五行和爻的地支五行确定六亲
 *
 * 规则：
 *   以卦宫五行为"我"
 *   生我者 → 父母
 *   我生者 → 子孙
 *   克我者 → 官鬼
 *   我克者 → 妻财
 *   同我者 → 兄弟
 */

const { BRANCH_ELEMENT, ELEMENT_GENERATES, ELEMENT_OVERRIDES, LIUQIN_TYPES } = require('../data/constants')

/**
 * 计算一爻的六亲
 * @param {string} palaceElement - 卦宫五行（金木水火土）
 * @param {string} branch - 爻的地支
 * @returns {string} 六亲名称
 */
function getLiuqin(palaceElement, branch) {
  if (!branch || !palaceElement) return ''

  const branchElement = BRANCH_ELEMENT[branch]
  if (!branchElement) return ''

  if (palaceElement === branchElement) return '兄弟'

  // 我生者 = 子孙
  if (ELEMENT_GENERATES[palaceElement] === branchElement) return '子孙'

  // 生我者 = 父母
  if (ELEMENT_GENERATES[branchElement] === palaceElement) return '父母'

  // 我克者 = 妻财
  if (ELEMENT_OVERRIDES[palaceElement] === branchElement) return '妻财'

  // 克我者 = 官鬼
  if (ELEMENT_OVERRIDES[branchElement] === palaceElement) return '官鬼'

  return ''
}

/**
 * 批量计算六亲
 * @param {string} palaceElement - 卦宫五行
 * @param {string[]} branches - 6个爻的地支
 * @returns {string[]} 6个爻的六亲
 */
function getLiuqinList(palaceElement, branches) {
  return branches.map(branch => getLiuqin(palaceElement, branch))
}

module.exports = { getLiuqin, getLiuqinList }
