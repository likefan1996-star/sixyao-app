const { GOLDEN_CASES } = require('../data/golden-cases')
const { paipan } = require('../utils/paipan')

const VALID_YAO = new Set(['laoyang', 'shaoyin', 'shaoyang', 'laoyin'])
const VALID_STATUS = new Set(['draft', 'verified'])

function assertCase(condition, message, id) {
  if (!condition) {
    throw new Error(id ? `${id}: ${message}` : message)
  }
}

function normalizeChangedName(changedHexagram) {
  return changedHexagram ? changedHexagram.name : ''
}

function buildSnapshot(result) {
  return {
    hexagram: result.hexagram.name,
    changedHexagram: normalizeChangedName(result.changedHexagram),
    binaryStr: result.binaryStr,
    changedBinaryStr: result.changedBinaryStr || '',
    shi: result.shiying.shi,
    ying: result.shiying.ying,
    dayStem: result.today.dayStem,
    dayBranch: result.today.dayBranch,
    monthBranch: result.today.monthBranch,
    najia: result.yaoDetails.map(yao => `${yao.stem}${yao.branch}`),
    liuqin: result.yaoDetails.map(yao => yao.liuqin),
    liushen: result.yaoDetails.map(yao => yao.liushen),
    movingPositions: result.movingPositions,
    yongshen: result.fortune.yongshen,
    tierKey: result.fortune.tierKey,
    tierName: result.fortune.tierName,
  }
}

function compareArray(actual, expected, label, id) {
  assertCase(Array.isArray(expected), `${label} expected should be an array`, id)
  assertCase(actual.length === expected.length, `${label} length expected ${expected.length}, got ${actual.length}`, id)
  expected.forEach((item, index) => {
    assertCase(actual[index] === item, `${label}[${index}] expected ${item}, got ${actual[index]}`, id)
  })
}

function compareExpected(snapshot, expected, id) {
  Object.keys(expected).forEach(key => {
    if (Array.isArray(expected[key])) {
      compareArray(snapshot[key], expected[key], key, id)
      return
    }
    assertCase(snapshot[key] === expected[key], `${key} expected ${expected[key]}, got ${snapshot[key]}`, id)
  })
}

function validateCase(item, index, seenIds) {
  assertCase(item && typeof item === 'object', `case at index ${index} should be an object`)
  assertCase(item.id && typeof item.id === 'string', 'id is required')
  assertCase(!seenIds.has(item.id), 'id should be unique', item.id)
  seenIds.add(item.id)

  assertCase(item.title && typeof item.title === 'string', 'title is required', item.id)
  assertCase(VALID_STATUS.has(item.status), 'status should be draft or verified', item.id)
  assertCase(item.question && typeof item.question === 'string', 'question is required', item.id)
  assertCase(item.topicType && typeof item.topicType === 'string', 'topicType is required', item.id)
  assertCase(item.dateTime && !Number.isNaN(new Date(item.dateTime).getTime()), 'dateTime should be a valid fixed time', item.id)
  assertCase(Array.isArray(item.yao) && item.yao.length === 6, 'yao should contain 6 lines', item.id)
  item.yao.forEach(type => assertCase(VALID_YAO.has(type), `invalid yao type ${type}`, item.id))

  if (item.status === 'verified') {
    assertCase(item.expected && typeof item.expected === 'object', 'verified case requires expected output', item.id)
  }
}

function main() {
  assertCase(Array.isArray(GOLDEN_CASES), 'GOLDEN_CASES should be an array')
  assertCase(GOLDEN_CASES.length >= 5, 'at least 5 draft cases should be prepared')

  const seenIds = new Set()
  let draftCount = 0
  let verifiedCount = 0

  GOLDEN_CASES.forEach((item, index) => {
    validateCase(item, index, seenIds)
    const result = paipan({
      yao: item.yao,
      question: item.question,
      dateTime: item.dateTime,
    })
    const snapshot = buildSnapshot(result)

    if (item.status === 'verified') {
      compareExpected(snapshot, item.expected, item.id)
      verifiedCount += 1
      return
    }

    draftCount += 1
    console.log(`[draft] ${item.id} ${snapshot.hexagram}${snapshot.changedHexagram ? ` -> ${snapshot.changedHexagram}` : ''}`)
  })

  console.log(`golden case check passed: ${verifiedCount} verified, ${draftCount} draft`)
}

if (require.main === module) {
  main()
}

module.exports = {
  buildSnapshot,
  compareExpected,
  validateCase,
}
