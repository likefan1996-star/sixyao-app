const assert = require('assert')

const storage = {}

global.wx = {
  getStorageSync(key) {
    return storage[key]
  },
  setStorageSync(key, value) {
    storage[key] = value
  },
}

const {
  MAX_HISTORY_RECORDS,
  getHistoryRecords,
  saveHistoryRecord,
  deleteHistoryRecord,
} = require('../utils/history')

function createRecord(index) {
  return {
    question: `record-${index}`,
    yao: ['shaoyang', 'shaoyin', 'shaoyang', 'shaoyin', 'shaoyang', 'shaoyin'],
    dateTime: `2026-05-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
    hexagramName: '同人',
    changedHexagramName: '',
    tierName: '有变',
    tierKey: 'xiaoji',
  }
}

function main() {
  assert.strictEqual(MAX_HISTORY_RECORDS, 20)
  assert.deepStrictEqual(getHistoryRecords(), [])

  for (let index = 0; index < 22; index++) {
    assert.strictEqual(saveHistoryRecord(createRecord(index)), true)
  }

  const records = getHistoryRecords()
  assert.strictEqual(records.length, 20)
  assert.strictEqual(records[0].question, 'record-21')
  assert.strictEqual(records[19].question, 'record-2')

  const deletedId = records[0].id
  assert.strictEqual(deleteHistoryRecord(deletedId), true)
  assert.ok(!getHistoryRecords().some(item => item.id === deletedId))

  assert.strictEqual(saveHistoryRecord({ yao: ['shaoyang'] }), false)

  console.log('history storage tests passed')
}

if (require.main === module) {
  main()
}
