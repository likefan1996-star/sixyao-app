const { getHistoryRecords, deleteHistoryRecord } = require('../../utils/history')
const { logUserAction } = require('../../utils/logger')

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatRecord(record) {
  const changedName = record.changedHexagramName || ''
  return {
    ...record,
    displayQuestion: record.question || '未填写主题',
    displayHexagram: changedName
      ? `${record.hexagramName || '本卦'} → ${changedName}`
      : (record.hexagramName || '本卦'),
    displayTime: formatTime(record.createdAt || record.dateTime),
    displayTier: record.tierName || '结构参考',
  }
}

Page({
  data: {
    records: [],
    hasRecords: false,
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const records = getHistoryRecords().map(formatRecord)
    this.setData({
      records,
      hasRecords: records.length > 0,
    })
  },

  onOpenRecord(e) {
    const id = e.currentTarget.dataset.id
    const record = this.data.records.find(item => item.id === id)
    if (!record) return

    logUserAction('open_local_history', {
      hasQuestion: !!record.question,
      yaoCount: Array.isArray(record.yao) ? record.yao.length : 0,
    })

    wx.navigateTo({
      url: `/pages/result/result?question=${encodeURIComponent(record.question || '')}&yao=${encodeURIComponent(JSON.stringify(record.yao || []))}&dateTime=${encodeURIComponent(record.dateTime || '')}&fromHistory=1`,
    })
  },

  onDeleteRecord(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    deleteHistoryRecord(id)
    this.loadRecords()
    wx.showToast({ title: '已移除本机记录', icon: 'none' })
  },
})
