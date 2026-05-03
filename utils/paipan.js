/**
 * 排盘引擎 - 六爻排盘主入口
 *
 * 输入: 6次摇卦结果（爻类型数组）
 * 输出: 完整排盘结果（本卦、变卦、爻详细、世应、吉凶评分等）
 */

const { YAO_BINARY, YAO_MOVING, YAO_SYMBOL, YAO_CHAR } = require('../data/constants')
const { HEXAGRAM_BY_BINARY } = require('../data/hexagrams')
const { getNajia } = require('./najia')
const { getShiYing } = require('./shiying')
const { getLiuqinList } = require('./liuqin')
const { getLiushenList } = require('./liushen')
const { calculateFortune } = require('./fortune')
const { getTodayStemBranch } = require('./dateutil')

/**
 * 主排盘函数
 * @param {Object} options
 * @param {string[]} options.yao - 6个爻类型数组（从初爻到上爻）
 * @param {string} [options.question] - 所问之事
 * @returns {Object} 完整排盘结果
 */
function paipan(options) {
  const { yao, question } = options
  if (!yao || yao.length !== 6) {
    throw new Error('需要6个爻数据')
  }

  // 获取今日干支（含月建）
  const today = getTodayStemBranch()

  // ── 1. 计算本卦二进制 ──
  const binaryStr = yao.map(y => YAO_BINARY[y]).join('')
  const movingFlags = yao.map(y => YAO_MOVING[y])

  // ── 2. 查找本卦 ──
  const hexagram = HEXAGRAM_BY_BINARY[binaryStr]

  // ── 3. 找出动爻位置 ──
  const movingPositions = []
  yao.forEach((type, i) => {
    if (YAO_MOVING[type]) movingPositions.push(i + 1)
  })

  // ── 4. 计算变卦 ──
  let changedHexagram = null
  let changedBinaryStr = null
  if (movingPositions.length > 0) {
    const changedBits = binaryStr.split('').map((bit, i) => {
      return movingFlags[i] ? (bit === '1' ? '0' : '1') : bit
    })
    changedBinaryStr = changedBits.join('')
    changedHexagram = HEXAGRAM_BY_BINARY[changedBinaryStr] || null
  }

  // ── 5. 纳甲 ──
  const lowerTri = hexagram ? hexagram.lowerTrigram : ''
  const upperTri = hexagram ? hexagram.upperTrigram : ''
  const najiaAssignments = getNajia(lowerTri, upperTri)

  // ── 6. 世应定位 ──
  const generation = hexagram ? hexagram.generation : 'pure'
  const shiying = getShiYing(generation)

  // ── 7. 六亲装配 ──
  const palaceElement = hexagram ? hexagram.element : ''
  const branches = najiaAssignments.map(a => a.branch)
  const liuqinList = getLiuqinList(palaceElement, branches)

  // ── 8. 六神装配 ──
  const liushenList = getLiushenList(today.dayStem)

  // ── 9. 组装每爻详细信息 ──
  const yaoDetails = []
  const hexagramLines = hexagram ? hexagram.lines : ['', '', '', '', '', '']
  const changedLines = changedHexagram ? changedHexagram.lines : ['', '', '', '', '', '']

  for (let i = 0; i < 6; i++) {
    const position = i + 1
    const yaoType = yao[i]
    const isMoving = movingFlags[i]

    yaoDetails.push({
      position,
      binary: YAO_BINARY[yaoType],
      type: yaoType,
      symbol: YAO_SYMBOL[yaoType],
      char: YAO_CHAR[yaoType],
      stem: najiaAssignments[i].stem,
      branch: najiaAssignments[i].branch,
      liuqin: liuqinList[i] || '',
      liushen: liushenList[i] || '',
      isMoving,
      text: hexagramLines[i] || '',
      changedText: isMoving && changedHexagram ? (changedLines[i] || '') : ''
    })
  }

  // ── 10. 吉凶评分（v2 多维判定） ──
  const fortune = calculateFortune(yaoDetails, shiying, movingPositions, question, today)

  return {
    hexagram,
    changedHexagram,
    binaryStr,
    changedBinaryStr,
    movingPositions,
    shiying,
    yao_details: yaoDetails,
    fortune,          // 新: 包含 score, verdictText, dimensions, items, yongshen
    today,            // 新: 传递干支数据
    // 兼容旧版字段
    tier: fortune.verdictText,
    score: fortune.score,
    analysis: fortune.items
  }
}

module.exports = { paipan }
