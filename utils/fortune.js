/**
 * 卦象结构评分引擎 v2 — 多维参考
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
 * 结果: 结构参考描述 + 评分明细
 */
const { BRANCH_ELEMENT, ELEMENT_GENERATES, ELEMENT_OVERRIDES, SIX_COMBINATION, SIX_CLASH } = require('../data/constants')
const { judgeYue } = require('./yuejian')
const { judgeDay } = require('./richen')
const { matchYongshen } = require('./yongshen')
const { isKongWang, isMonthBroken, judgeDayClash } = require('./kongwang')

const FORTUNE_TIERS = [
  { min: 90, max: 100, name: '极盛', key: 'shangshang', advice: '结构气势充足，生扶关系较集中。', detailAdvice: '当前分值处在最高区间，表示月日、用神、动爻或世应关系中呈现较强支撑。学习时可重点观察生扶来源、旺相位置与动爻呼应，理解卦象结构为何显得饱满。', color: '#0066cc' },
  { min: 75, max: 89, name: '偏盛', key: 'daji', advice: '整体结构偏盛，主要要素较协调。', detailAdvice: '当前卦象结构多处呈现顺承关系，牵制因素相对不重。学习时可把它作为偏盛格局观察，比较用神、世应、月日之间的配合方式，以及哪些细节使结构保持均衡。', color: '#0066cc' },
  { min: 60, max: 74, name: '平顺', key: 'zhongji', advice: '结构较为平顺，支撑因素多于牵制因素。', detailAdvice: '当前分值显示卦象结构有部分连续性，生扶、动变与世应关系大体能够形成说明线索。学习时可关注支撑因素如何分布，同时留意仍存在的弱项或未显之处。', color: '#0066cc' },
  { min: 45, max: 59, name: '小动', key: 'xiaoji', advice: '结构略有起伏，动静关系值得细看。', detailAdvice: '当前卦象既有支撑也有牵制，整体强弱不算集中。学习时可从动爻、用神位置和日月状态入手，观察变化点如何影响结构重心，适合作为动静转换的示例。', color: '#0066cc' },
  { min: 30, max: 44, name: '平衡', key: 'zhongping', advice: '结构趋于中和，强弱信号相对均衡。', detailAdvice: '当前分值处在中间区间，说明卦象中支撑与牵制大致并存，结构倾向不特别突出。学习时可重点比较各维度的相互抵消关系，理解卦象如何形成平衡状态。', color: '#0066cc' },
  { min: 15, max: 29, name: '偏弱', key: 'xiaxia', advice: '结构力量偏弱，牵制关系较明显。', detailAdvice: '当前分值偏低，表示用神、日月或动爻关系中可能存在较多牵制。学习时可观察弱项来自旬空、月破、日冲还是动爻关系，并比较这些因素对整体结构的影响。', color: '#0066cc' },
  { min: 0, max: 14, name: '受制', key: 'xiong', advice: '结构受制较重，关键要素支撑不足。', detailAdvice: '当前分值处在最低区间，表示卦象中牵制、空破或克制因素较集中。学习时可把它作为受制结构示例，分析主要受制点、相关爻位和五行关系如何共同影响结构强弱。', color: '#0066cc' },
]

function clampScore(score) {
  const normalized = Number.isFinite(score) ? Math.round(score) : 0
  return Math.max(0, Math.min(100, normalized))
}

/**
 * 评分 → 卦象结构参考档位
 */
function getFortuneTier(score) {
  const displayScore = clampScore(score)
  const tier = FORTUNE_TIERS.find(t => displayScore >= t.min && displayScore <= t.max) || FORTUNE_TIERS[FORTUNE_TIERS.length - 1]
  const activeIndex = FORTUNE_TIERS.findIndex(t => t.key === tier.key)
  return {
    name: tier.name,
    key: tier.key,
    range: `${tier.min}-${tier.max}`,
    advice: tier.advice,
    detailAdvice: tier.detailAdvice,
    color: tier.color,
    displayScore,
    percent: displayScore,
    activeIndex,
    tiers: FORTUNE_TIERS.map(t => ({
      name: t.name,
      key: t.key,
      range: `${t.min}-${t.max}`,
      active: t.key === tier.key,
    })),
  }
}

function findCoreYaos(yaoDetails, yongshenLiqin, shiying) {
  let yongShenYao
  let shiYao
  let yingYao

  for (const y of yaoDetails) {
    if (!yongShenYao && y.liuqin === yongshenLiqin) yongShenYao = y
    if (!shiYao && y.position === shiying.shi) shiYao = y
    if (!yingYao && y.position === shiying.ying) yingYao = y
    if (yongShenYao && shiYao && yingYao) break
  }

  return { yongShenYao, shiYao, yingYao }
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

  const { yongShenYao, shiYao, yingYao } = findCoreYaos(yao_details, yongshenLiqin, shiying)
  const primaryYao = yongShenYao || shiYao  // 用神优先，无则世爻
  let primaryYue = null
  let primaryDay = null

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
    primaryYue = judgeYue(monthBranchName, primaryYao.branch)
    items.push(`用神月建: ${primaryYue.label} (${primaryYao.branch})`)
  }

  // ── 2. 日辰十二宫 ──
  if (primaryYao) {
    primaryDay = judgeDay(dayBranchName, primaryYao.branch)
    score += primaryDay.score
    if (primaryDay.score !== 0) items.push(`日辰${primaryDay.stage} ${primaryDay.score > 0 ? '+' : ''}${primaryDay.score} (${primaryYao.branch})`)
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
  const tier = getFortuneTier(score)
  const dimensions = buildDimensions(primaryYao, yao_details, moving_positions, yongshenLiqin, primaryYue, primaryDay)

  return {
    score,
    displayScore: tier.displayScore,
    verdictText: tier.name,
    verdictDesc: tier.advice,
    verdictColor: tier.color,
    tierName: tier.name,
    tierKey: tier.key,
    tierRange: tier.range,
    tierAdvice: tier.advice,
    tierDetailAdvice: tier.detailAdvice,
    tierPercent: tier.percent,
    tierActiveIndex: tier.activeIndex,
    tierScale: tier.tiers,
    dimensions,
    items,
    yongshen: yongshenLiqin,
    yongshenPosition: primaryYao ? primaryYao.position : 0
  }
}

/**
 * 构建三维度分析
 */
function buildDimensions(primaryYao, yao_details, movingPositions, yongshen, primaryYue, primaryDay) {
  const dims = []

  // 趋势维度
  if (primaryYao) {
    const yue = primaryYue || { score: 0, label: '未知' }
    const day = primaryDay || { score: 0, stage: '未知' }
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
    : `用神${yongshen}未在本卦中装配，学习时可改看世爻、应爻与动爻线索`
  dims.push({ label: '用神', value: primaryYao ? '显现' : '用神不现', detail: yongDetail })

  // 动变维度
  if (movingPositions.length > 0) {
    const movingDetail = movingPositions.map(p => {
      const y = yao_details.find(d => d.position === p)
      return y ? `${p}爻${y.liuqin}${y.isMoving ? '动' : ''}` : `${p}爻`
    }).join('、')
    dims.push({ label: '动变', value: `${movingPositions.length}处动爻`, detail: movingDetail })
  } else {
    dims.push({ label: '动变', value: '静卦', detail: '无动爻，主事态平稳发展' })
  }

  return dims
}

module.exports = { calculateFortune, getFortuneTier, FORTUNE_TIERS }
