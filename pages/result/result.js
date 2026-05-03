/** 结果页逻辑 v3 — 多维分析报告 **/
const app = getApp()
const { paipan } = require('../../utils/paipan')

Page({
  data: {
    question: '',
    guaName: '',
    guaPalace: '',
    verdictText: '',
    verdictDesc: '',
    verdictColor: '',
    dimensions: [],
    yaoList: [],
    detailItems: [],
    showDetail: false,
    yongshen: '',
    quoteText: '',
  },

  onLoad(options) {
    const question = decodeURIComponent(options.question || '')
    const yaoStr = decodeURIComponent(options.yao || '[]')
    const yaoData = JSON.parse(yaoStr)

    try {
      const result = paipan({ yao: yaoData, question })
      this.renderResult(result, question)
    } catch (e) {
      console.error('排盘出错', e)
      this.renderFallback(question)
    }
  },

  renderResult(d, question) {
    const guaName = d.hexagram?.name || '未知卦象'
    const guaPalace = d.hexagram?.palace || ''

    // 爻位列表（从上爻到初爻展示）
    const yaoList = [...(d.yao_details || [])].reverse().map((y, index) => ({
      index: 6 - y.position,
      type: y.binary === 1 ? 'yang' : 'yin',
      status: y.type.includes('老') ? (y.binary === 1 ? '阳变' : '阴变') : (y.binary === 1 ? '阳爻' : '阴爻'),
      isChanged: y.isMoving || false,
      liuqin: y.liuqin || '',
      liushen: y.liushen || '',
      branch: y.branch || '',
      animClass: 'yao-row-active'
    }))

    // 多维分析
    const dimensions = d.fortune?.dimensions || []

    // 评分明细
    const detailItems = d.fortune?.items || []

    this.setData({
      question,
      guaName,
      guaPalace,
      verdictText: d.fortune?.verdictText || '平缓',
      verdictDesc: d.fortune?.verdictDesc || '',
      verdictColor: d.fortune?.verdictColor || '#8E8E93',
      dimensions,
      yaoList,
      detailItems,
      yongshen: d.fortune?.yongshen || '世爻',
      quoteText: d.hexagram?.judgment || '暂无古籍对照原文'
    })
  },

  renderFallback(question) {
    this.setData({
      question,
      guaName: '排盘异常',
      verdictText: '—',
      verdictDesc: '排盘引擎处理异常，请尝试重新起卦',
      verdictColor: '#8E8E93',
      yaoList: [],
      dimensions: [],
      detailItems: ['引擎异常：请重试'],
      quoteText: '—'
    })
  },

  toggleDetail() {
    this.setData({ showDetail: !this.data.showDetail })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  }
})
