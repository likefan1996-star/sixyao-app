const fs = require('fs')
const path = require('path')

const { GOLDEN_CASES } = require('../data/golden-cases')
const { paipan } = require('../utils/paipan')
const { buildSnapshot, validateCase } = require('./verify-golden-cases')

const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'golden-case-review.csv')

const HEADERS = [
  '案例ID',
  '状态',
  '标题',
  '问题',
  '主题',
  '角色',
  '固定时间',
  '爻值',
  '本卦',
  '变卦',
  '本卦二进制',
  '变卦二进制',
  '世',
  '应',
  '日干',
  '日支',
  '月建',
  '动爻',
  '纳甲',
  '六亲',
  '六神',
  '用神',
  '倾向Key',
  '倾向名称',
  '人工校验状态',
  '人工校验备注',
]

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(' / ') : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function toRow(item, index, seenIds) {
  validateCase(item, index, seenIds)
  const result = paipan({
    yao: item.yao,
    question: item.question,
    dateTime: item.dateTime,
  })
  const snapshot = buildSnapshot(result)

  return [
    item.id,
    item.status,
    item.title,
    item.question,
    item.topicType,
    item.role || '',
    item.dateTime,
    item.yao,
    snapshot.hexagram,
    snapshot.changedHexagram,
    snapshot.binaryStr,
    snapshot.changedBinaryStr,
    snapshot.shi,
    snapshot.ying,
    snapshot.dayStem,
    snapshot.dayBranch,
    snapshot.monthBranch,
    snapshot.movingPositions,
    snapshot.najia,
    snapshot.liuqin,
    snapshot.liushen,
    snapshot.yongshen,
    snapshot.tierKey,
    snapshot.tierName,
    '',
    '',
  ].map(csvCell).join(',')
}

function buildReviewCsv() {
  const seenIds = new Set()
  const rows = [
    HEADERS.map(csvCell).join(','),
    ...GOLDEN_CASES.map((item, index) => toRow(item, index, seenIds)),
  ]
  return `${rows.join('\n')}\n`
}

function main() {
  const csv = buildReviewCsv()
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, `\uFEFF${csv}`, 'utf8')
  console.log(`golden case review table exported: ${OUTPUT_PATH}`)
}

if (require.main === module) {
  main()
}

module.exports = {
  buildReviewCsv,
  OUTPUT_PATH,
}
