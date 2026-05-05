/**
 * 干支工具 - 推算当日天干地支 + 月建
 */
const { STEMS, BRANCHES } = require('../data/constants')
const { MONTH_BRANCH_TERMS } = require('../data/solarTerms')

function getDayIndex(year, month, day) {
  const base2024 = new Date(2024, 0, 1)
  const target = new Date(year, month - 1, day)
  const diff = Math.round((target - base2024) / 86400000)
  return ((diff % 60) + 60) % 60
}

/**
 * 获取今天的干支
 * @returns {{ dayStem, dayStemIndex, dayBranch, dayBranchIndex, dayIndex, monthBranch }}
 */
function getTodayStemBranch(date = new Date()) {
  const now = date instanceof Date ? date : new Date(date)
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const idx = getDayIndex(year, month, day)

  const monthBranch = getMonthBranch(year, month, day, now.getHours(), now.getMinutes(), now.getSeconds())

  return {
    dayStem: STEMS[idx % 10],
    dayStemIndex: idx % 10,
    dayBranch: BRANCHES[idx % 12],
    dayBranchIndex: idx % 12,
    dayIndex: idx,
    monthBranch
  }
}

/**
 * 获取月建。
 * 优先使用年度节气表的精确时间；表外年份回退到近似日期。
 */
function getMonthBranch(year, month, day, hour = 12, minute = 0, second = 0) {
  const accurateBranch = getMonthBranchFromSolarTerms(year, month, day, hour, minute, second)
  if (accurateBranch) return accurateBranch

  return getApproxMonthBranch(year, month, day)
}

function getMonthBranchFromSolarTerms(year, month, day, hour, minute, second) {
  const terms = MONTH_BRANCH_TERMS[year]
  if (!terms) return ''

  const target = new Date(year, month - 1, day, hour, minute, second || 0).getTime()
  for (let i = terms.length - 1; i >= 0; i--) {
    const [termTime, branch] = terms[i]
    if (target >= new Date(termTime).getTime()) return branch
  }

  return '子'
}

function getApproxMonthBranch(year, month, day) {
  // 计算年内第几天
  const start = new Date(year, 0, 0)
  const now = new Date(year, month - 1, day)
  const doy = Math.round((now - start) / 86400000)

  // 节气近似日 (day of year)
  const thresholds = [
    [6,   '丑'],   // 小寒(1/6)
    [35,  '寅'],   // 立春(2/4)
    [65,  '卯'],   // 惊蛰(3/6)
    [95,  '辰'],   // 清明(4/5)
    [126, '巳'],   // 立夏(5/6)
    [157, '午'],   // 芒种(6/6)
    [188, '未'],   // 小暑(7/7)
    [220, '申'],   // 立秋(8/8)
    [251, '酉'],   // 白露(9/8)
    [281, '戌'],   // 寒露(10/8)
    [311, '亥'],   // 立冬(11/7)
    [341, '子'],   // 大雪(12/7)
  ]

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (doy >= thresholds[i][0]) return thresholds[i][1]
  }
  return '子'  // 小寒前仍属上一年大雪后的子月
}

function getStemBranch(year, month, day, hour = 12, minute = 0, second = 0) {
  const idx = getDayIndex(year, month, day)
  const monthBranch = getMonthBranch(year, month, day, hour, minute, second)
  return {
    dayStem: STEMS[idx % 10],
    dayStemIndex: idx % 10,
    dayBranch: BRANCHES[idx % 12],
    dayBranchIndex: idx % 12,
    dayIndex: idx,
    monthBranch
  }
}

function getStemBranchFromDateTime(dateTime) {
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`时间格式不合法: ${dateTime}`)
  }
  return getStemBranch(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
}

module.exports = { getTodayStemBranch, getStemBranch, getStemBranchFromDateTime, getMonthBranch }
