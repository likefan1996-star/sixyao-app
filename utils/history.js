const STORAGE_KEY = 'sixyao_history_records'
const MAX_HISTORY_RECORDS = 20

function safeStorageRead() {
  try {
    const records = wx.getStorageSync(STORAGE_KEY)
    return Array.isArray(records) ? records : []
  } catch (e) {
    return []
  }
}

function safeStorageWrite(records) {
  try {
    wx.setStorageSync(STORAGE_KEY, records)
    return true
  } catch (e) {
    return false
  }
}

function normalizeQuestion(question) {
  const text = String(question || '').trim()
  return text.slice(0, 80)
}

function normalizeYao(yao) {
  return Array.isArray(yao) ? yao.slice(0, 6) : []
}

function createHistoryId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getHistoryRecords() {
  return safeStorageRead()
}

function saveHistoryRecord(record) {
  if (!record || !Array.isArray(record.yao) || record.yao.length !== 6) return false

  const createdAt = record.createdAt || record.dateTime || new Date().toISOString()
  const normalized = {
    id: record.id || createHistoryId(),
    createdAt,
    dateTime: record.dateTime || createdAt,
    question: normalizeQuestion(record.question),
    yao: normalizeYao(record.yao),
    hexagramName: record.hexagramName || '',
    changedHexagramName: record.changedHexagramName || '',
    tierName: record.tierName || '',
    tierKey: record.tierKey || '',
  }

  const records = getHistoryRecords()
    .filter(item => item.id !== normalized.id)
    .filter(item => {
      if (!normalized.question || !item.question) return true
      return !(item.question === normalized.question && item.dateTime === normalized.dateTime)
    })

  return safeStorageWrite([normalized].concat(records).slice(0, MAX_HISTORY_RECORDS))
}

function deleteHistoryRecord(id) {
  const targetId = String(id || '')
  if (!targetId) return false
  const nextRecords = getHistoryRecords().filter(item => item.id !== targetId)
  return safeStorageWrite(nextRecords)
}

module.exports = {
  MAX_HISTORY_RECORDS,
  getHistoryRecords,
  saveHistoryRecord,
  deleteHistoryRecord,
}
