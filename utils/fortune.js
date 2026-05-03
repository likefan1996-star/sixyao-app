/**
 * 吉凶评分引擎 - 六档评分制
 *
 * 规则：
 *   基准分：40
 *   + 世爻旺相（世爻地支受日辰生扶）：+10
 *   + 用神生世（官鬼或妻财生世）：+15
 *   + 忌神克世（兄弟或子孙克世）：-10
 *   + 每个动爻相生世爻：+8
 *   + 每个动爻相克世爻：-8
 *   + 世应相合（六合）：+10
 *   + 世应相冲（六冲）：-5
 *
 *   等级：大吉(>80) / 上吉(61-80) / 中吉(41-60) / 中平(21-40) / 下下(1-20) / 大凶(≤0)
 */

const { FORTUNE_TIERS, SIX_COMBINATION, SIX_CLASH, BRANCH_ELEMENT, ELEMENT_GENERATES, ELEMENT_OVERRIDES } = require('../data/constants')

/**
 * 根据评分获取等级信息
 */
function getTier(score) {
  for (const tier of FORTUNE_TIERS) {
    if (score >= tier.min) {
      return { label: tier.label, color: tier.color }
    }
  }
  return { label: '大凶', color: '#3a3a3c' }
}

/**
 * 计算吉凶评分
 * @param {Object} options
 * @param {Array} options.yao_details - 每爻详细信息数组（含 branch, liuqin, isMoving, position 等字段）
 * @param {Object} options.shiying - { shi: number, ying: number }
 * @param {number[]} options.moving_positions - 动爻位置数组
 * @returns {{ score: number, tier: string, tierColor: string, items: string[] }}
 */
function calculateFortune(yao_details, shiying, moving_positions) {
  const items = []
  let score = 40

  // 找出世爻和应爻
  const shiYao = yao_details.find(y => y.position === shiying.shi)
  const yingYao = yao_details.find(y => y.position === shiying.ying)

  // 1. 世爻旺相（地支为寅卯巳午申亥等旺相地支）
  // 简化为：地支为寅、午、申、亥、卯、巳 视为旺相
  if (shiYao && shiYao.branch) {
    const strongBranches = ['寅', '午', '申', '亥', '卯', '巳']
    if (strongBranches.includes(shiYao.branch)) {
      score += 10
      items.push(`世爻旺相 +10（${shiYao.branch}）`)
    }
  }

  // 2. 用神生世
  // 用神 = 妻财（生世爻）或 官鬼（生世爻）
  if (shiYao && shiYao.liuqin) {
    // 用神生世：看是否有爻是妻财或官鬼，且生世爻
    yao_details.forEach(yao => {
      if (yao.liuqin === '妻财' || yao.liuqin === '官鬼') {
        if (yao.branch && shiYao.branch) {
          const yaoEl = BRANCH_ELEMENT[yao.branch]
          const shiEl = BRANCH_ELEMENT[shiYao.branch]
          if (yaoEl && shiEl && ELEMENT_GENERATES[yaoEl] === shiEl) {
            score += 15
            items.push(`${yao.liuqin}生世 +15（${yao.branch}→${shiYao.branch}）`)
          }
        }
      }
    })
  }

  // 3. 忌神克世
  // 忌神 = 兄弟 或 子孙（克世爻）
  if (shiYao && shiYao.liuqin) {
    yao_details.forEach(yao => {
      if (yao.liuqin === '兄弟' || yao.liuqin === '子孙') {
        if (yao.branch && shiYao.branch) {
          const yaoEl = BRANCH_ELEMENT[yao.branch]
          const shiEl = BRANCH_ELEMENT[shiYao.branch]
          if (yaoEl && shiEl && ELEMENT_OVERRIDES[yaoEl] === shiEl) {
            score -= 10
            items.push(`${yao.liuqin}克世 -10（${yao.branch}→${shiYao.branch}）`)
          }
        }
      }
    })
  }

  // 4+5. 动爻相生/相克世爻
  if (shiYao && shiYao.branch) {
    moving_positions.forEach(pos => {
      const movingYao = yao_details.find(y => y.position === pos)
      if (!movingYao || !movingYao.branch) return

      const movingEl = BRANCH_ELEMENT[movingYao.branch]
      const shiEl = BRANCH_ELEMENT[shiYao.branch]
      if (!movingEl || !shiEl) return

      if (ELEMENT_GENERATES[movingEl] === shiEl) {
        score += 8
        items.push(`${pos}爻动生世 +8`)
      } else if (ELEMENT_OVERRIDES[movingEl] === shiEl) {
        score -= 8
        items.push(`${pos}爻动克世 -8`)
      }
    })
  }

  // 6. 世应相合（六合）
  if (shiYao && yingYao && shiYao.branch && yingYao.branch) {
    if (SIX_COMBINATION[shiYao.branch] === yingYao.branch) {
      score += 10
      items.push(`世应相合 +10（${shiYao.branch}${yingYao.branch}合）`)
    }
  }

  // 7. 世应相冲（六冲）
  if (shiYao && yingYao && shiYao.branch && yingYao.branch) {
    if (SIX_CLASH[shiYao.branch] === yingYao.branch) {
      score -= 5
      items.push(`世应相冲 -5（${shiYao.branch}${yingYao.branch}冲）`)
    }
  }

  const tier = getTier(score)

  return {
    score,
    tier: tier.label,
    tierColor: tier.color,
    items
  }
}

module.exports = { calculateFortune }
