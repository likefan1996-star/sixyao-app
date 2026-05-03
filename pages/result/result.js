/** 结果页逻辑 — 经典版适配纯前端引擎 */
const app = getApp()
const { paipan } = require('../../utils/paipan')

Page({
  data: {
    question: '',
    hexagram: {},
    changedHexagram: {},
    shiying: {},
    yaoDetails: [],
    auspicious: {},
    analysisItems: [],
    movingPositionsStr: '',
    dayStem: '',
    dayBranch: '',
    monthBranch: '',
    yongshen: '',
    verdictColor: '',
    showDetail: false,
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
      this.renderFallback(yaoData, question)
    }
  },

  renderResult(d, question) {
    // 中文等级 → CSS class 映射
    const levelMap = {
      '顺畅': 'shunchang',
      '平缓': 'pinghuan',
      '阻滞': 'zuzhi',
      '凶险': 'xiongxian',
    }

    // 爻数据（从上爻到初爻展示）
    const displayYao = [...(d.yao_details || [])].reverse().map(y => ({
      position: y.position,
      value: y.binary === 1 ? 'yang' : 'yin',
      stem: y.stem,
      branch: y.branch,
      liuqin: y.liuqin,
      liushen: y.liushen,
      is_moving: y.isMoving || false,
    }))

    const movingStr = (d.movingPositions || []).map(p => `第${p}爻`).join('、') || '无'

    // 古风吉凶映射
    const tierColors = {
      '顺畅': '#2d7d46',
      '平缓': '#b8860b',
      '阻滞': '#c0392b',
      '凶险': '#2c3e50',
    }

    this.setData({
      question,
      hexagram: {
        name: d.hexagram?.name || '未知',
        character: d.hexagram?.name?.charAt(0) || '☯',
        palace: d.hexagram?.palace || '',
        gua_ci: d.hexagram?.judgment || '',
      },
      changedHexagram: d.changedHexagram ? {
        name: d.changedHexagram.name || '',
        character: d.changedHexagram.name?.charAt(0) || '',
      } : {},
      shiying: {
        shiyao: d.shiying?.shi || 0,
        yingyao: d.shiying?.ying || 0,
      },
      yaoDetails: displayYao,
      auspicious: {
        level: d.fortune?.verdictText || '平缓',
        score: d.fortune?.score || 0,
      },
      analysisItems: d.fortune?.items || [],
      movingPositionsStr: movingStr,
      dayStem: d.today?.dayStem || '',
      dayBranch: d.today?.dayBranch || '',
      monthBranch: d.today?.monthBranch || '',
      yongshen: d.fortune?.yongshen || '',
      verdictColor: tierColors[d.fortune?.verdictText] || '#86868b',
      levelClass: 'level-' + (levelMap[d.fortune?.verdictText] || 'pinghuan'),
    })
  },

  renderFallback(yaoData, question) {
    const yaoDisplay = [...yaoData].reverse().map((t, i) => ({
      position: 6 - i,
      value: (t === 'laoyang' || t === 'shaoyang') ? 'yang' : 'yin',
      liuqin: '', liushen: '', stem: '', branch: '',
      is_moving: (t === 'laoyang' || t === 'laoyin'),
    }))

    this.setData({
      question,
      hexagram: { name: '排盘异常', character: '⚠', palace: '' },
      changedHexagram: {},
      shiying: {},
      yaoDetails: yaoDisplay,
      auspicious: { level: '—', score: 0 },
      analysisItems: ['排盘引擎异常，请重试'],
      movingPositionsStr: '—',
    })
  },

  toggleDetail() {
    this.setData({ showDetail: !this.data.showDetail })
  },

  onEnd() {
    wx.navigateBack({ delta: 1 })
  }
})
