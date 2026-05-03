/**
 * 吉凶评分引擎 v2 — 多维判定
 *
 * 整合月建/日辰/用神/旬空/月破/日冲/动爻/世应 八大维度
 *
 * 评分公式:
 *   总分 = 50(基准)
 *     + 月建旺衰平均分 (-10 ~ +10)
 *     + 日辰状态 (用神/世爻, -8 ~ +8)
 *     + 用神旬空 (-15)
 *     + 用神月破 (-20)
 *     + 日冲 (-6 ~ +6)
 *     + 动爻生扶用神 (+12/个)
 *     + 动爻克害用神 (-12/个)
 *     + 世应关系 (-10 ~ +10)
 *
 * 结果: 多维文字描述 + 评分明细
 */
const { BRANCH_ELEMENT, ELEMENT_GENERATES, ELEMENT_OVERRIDES, SIX_COMBINATION, SIX_CLASH } = require('../data/constants')
const { judgeYue } = require('./yuejian')
const { judgeDay } = require('./richen')
const { matchYongshen } = require('./yongshen')
const { isKongWang, isMonthBroken, judgeDayClash } = require('./kongwang')

/**
 * 评分 → 文字总评
 */
function getVerdict(score) {
  if (score >= 70) return { text: '顺畅', desc: '整体趋势积极，建议顺势推进', color: '#4CAF50' }
  if (score >= 50) return { text: '平缓', desc: '状态平衡，宜稳中求进', color: '#8E8E93' }
  if (score >= 30) return { text: '阻滞', desc: '存在明显阻力，建议审慎观望', color: '#FF9800' }
  return { text: '凶险', desc: '阻力极大，强行推进恐有不利', color: '#F44336' }
}

/**
 * 主评分函数
 * @param {Array} yao_details - 每爻详细信息 (含 branch, liuqin, isMoving)
 * @param {Object} shiying - { shi: number, ying: number }
 * @param {number[]} moving_positions - 动爻位置
 * @param {string} question - 用户问题
 * @param {Object} today - 今日干支 { dayStem, dayBranch, dayIndex, monthBranch }
 * @returns {{ score, verdict, dimensions, items }}
 */
function calculateFortune(yao_details, shiying, moving_positions, question, today) {
  const items = []
  let score = 50

  const { monthBranch, dayBranch, dayIndex } = today
  const monthBranchName = monthBranch || ''
  const dayBranchName = dayBranch || ''

  // ── 用神匹配 ──
  const { yongshen: yongshenLiqin } = matchYongshen(question || '')

  // 找到用神对应的爻
  const yongShenYao = yao_details.find(y => y.liuqin === yongshenLiqin)
  // 找到世爻
  const shiYao = yao_details.find(y => y.position === shiying.shi)
  const yingYao = yao_details.find(y => y.position === shiying.ying)

  const primaryYao = yongShenYao || shiYao  // 用神优先，无则世爻

  // ── 1. 月建旺衰 ──
  let yueTotal = 0
  yao_details.forEach(y => {
    const r = judgeYue(monthBranchName, y.branch)
    yueTotal += r.score
  })
  const yueAvg = Math.round(yueTotal / yao_details.length)
  score += yueAvg
  if (yueAvg !== 0) items.push(`月建旺衰均分 ${yueAvg > 0 ? '+' : ''}${yueAvg}`)

  // 用神月建判定
  if (primaryYao) {
    const yue = judgeYue(monthBranchName, primaryYao.branch)
    items.push(`用神月建: ${yue.label} (${primaryYao.branch})`)
  }

  // ── 2. 日辰十二宫 ──
  if (primaryYao) {
    const day = judgeDay(dayBranchName, primaryYao.branch)
    score += day.score
    if (day.score !== 0) items.push(`日辰${day.stage} ${day.score > 0 ? '+' : ''}${day.score} (${primaryYao.branch})`)
  }

  // ── 3. 旬空 ──
  if (primaryYao && isKongWang(primaryYao.branch, dayIndex)) {
    score -= 15
    items.push(`用神旬空 -15 (${primaryYao.branch})`)
  }

  // ── 4. 月破 ──
  if (primaryYao && isMonthBroken(primaryYao.branch, monthBranchName)) {
    score -= 20
    items.push(`用神月破 -20 (${primaryYao.branch}冲${monthBranchName})`)
  }

  // ── 5. 日冲 ──
  if (primaryYao) {
    const clash = judgeDayClash(primaryYao.branch, dayBranchName, primaryYao.isMoving)
    if (clash.isClashed) {
      score += clash.score
      items.push(`日冲${clash.effect} ${clash.score > 0 ? '+' : ''}${clash.score}`)
    }
  }

  // ── 6. 动爻生扶/克害用神 ──
  if (primaryYao && moving_positions.length > 0) {
    moving_positions.forEach(pos => {
      const movingYao = yao_details.find(y => y.position === pos)
      if (!movingYao || !movingYao.branch || !primaryYao.branch) return

      const mEl = BRANCH_ELEMENT[movingYao.branch]
      const pEl = BRANCH_ELEMENT[primaryYao.branch]
      if (!mEl || !pEl) return

      if (ELEMENT_GENERATES[mEl] === pEl) {
        score += 12
        items.push(`${pos}爻动生用神 +12`)
      } else if (ELEMENT_OVERRIDES[mEl] === pEl) {
        score -= 12
        items.push(`${pos}爻动克用神 -12`)
      }
    })
  }

  // ── 7. 世应关系 ──
  if (shiYao && yingYao && shiYao.branch && yingYao.branch) {
    if (SIX_COMBINATION[shiYao.branch] === yingYao.branch) {
      score += 10
      items.push(`世应相合 +10`)
    } else if (SIX_CLASH[shiYao.branch] === yingYao.branch) {
      score -= 5
      items.push(`世应相冲 -5`)
    }
  }

  // ── 构建结果 ──
  const verdict = getVerdict(score)
  const dimensions = buildDimensions(primaryYao, yao_details, monthBranchName, dayBranchName, moving_positions, yongshenLiqin)

  return {
    score,
    verdictText: verdict.text,
    verdictDesc: verdict.desc,
    verdictColor: verdict.color,
    dimensions,
    items,
    yongshen: yongshenLiqin,
    yongshenPosition: primaryYao ? primaryYao.position : 0
  }
}

/**
 * 构建三维度分析
 */
function buildDimensions(primaryYao, yao_details, monthBranch, dayBranch, movingPositions, yongshen) {
  const dims = []

  // 趋势维度
  if (primaryYao) {
    const yue = judgeYue(monthBranch, primaryYao.branch)
    const day = judgeDay(dayBranch, primaryYao.branch)
    const trendVal = (yue.score >= 0 && day.score >= 0) ? '向好' :
                     (yue.score <= -6 && day.score <= -6) ? '转弱' : '平稳'
    dims.push({
      label: '趋势',
      value: trendVal,
      detail: `用神${yongshen}月建${yue.label}，日辰${day.stage}`
    })
  } else {
    dims.push({ label: '趋势', value: '平稳', detail: '用神不现，以外势为凭' })
  }

  // 用神维度
  const yongDetail = primaryYao
    ? `位于${primaryYao.position}爻，地支${primaryYao.branch}，六亲${primaryYao.liuqin}`
    : `用神${yongshen}未在卦中显现`
  dims.push({ label: '用神', value: primaryYao ? '显现' : '伏藏', detail: yongDetail })

  // 动变维度
  if (movingPositions.length > 0) {
    const movingDetail = movingPositions.map(p => {
      const y = yao_details.find(d => d.position === p)
      return y ? `${p}爻${y.liuqin}${y.type.includes('老') ? '动' : ''}` : `${p}爻`
    }).join('、')
    dims.push({ label: '动变', value: `${movingPositions.length}处动爻`, detail: movingDetail })
  } else {
    dims.push({ label: '动变', value: '静卦', detail: '无动爻，主事态平稳发展' })
  }

  return dims
}

module.exports = { calculateFortune }
