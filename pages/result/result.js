/** 结果页逻辑 — 指标化与深度报告 v2.0 **/
const app = getApp()
const { paipan } = require('../../utils/paipan')

Page({
  data: {
    question: '',
    guaName: '',
    guaType: '',
    syncRate: 0,
    syncDesc: '',
    yaoList: [],
    summaryText: '',
    detailedLogic: '',
    quoteText: '',
    strategyText: '',
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
    const guaName = d.hexagram?.name || '未知卦象'
    const guaType = d.hexagram?.palace || '通用'
    
    const yaoList = [...(d.yao_details || [])].reverse().map((y, index) => ({
      index: index,
      type: y.binary === 1 ? 'yang' : 'yin',
      status: y.binary === 1 ? '阳爻' : '阴爻',
      isChanged: y.isMoving || false,
      element: y.element || '',
      animClass: 'yao-row-active'
    }))

    // --- 指标化处理 (吉凶 -> 同步率) ---
    const tierMap = {
      '大吉': { rate: 95, desc: '逻辑高度同步，趋势极佳' },
      '上吉': { rate: 82, desc: '同步率较高，方向正确' },
      '中吉': { rate: 68, desc: '同步率良好，稳步推进' },
      '中平': { rate: 50, desc: '同步率中等，处于平衡态' },
      '下下': { rate: 32, desc: '同步率较低，存在波动' },
      '大凶': { rate: 15, desc: '同步率极低，显著阻滞' },
    }
    const metric = tierMap[d.tier] || { rate: 50, desc: '同步率中等，趋势平稳' }

    // --- 深度报告构建 ---
    // 1. 概要
    const summaryText = `当前模拟结果显示，目标方向与环境的同步率为 ${metric.rate}%。${metric.desc}。`

    // 2. 深度逻辑 (将 paipan 的 analysis 转换为结构化文本)
    let detailedLogic = '通过对爻位关系的推演分析：'
    if (d.analysis && d.analysis.length > 0) {
      detailedLogic += d.analysis.join(' ')
    } else {
      detailedLogic += '当前能量场分布均匀，无显著的冲突或驱动点，建议保持现状。'
    }

    // 3. 古籍对照
    const quoteText = d.hexagram?.judgment || '暂无古籍对照原文'

    // 4. 应对策略
    const strategies = {
      '顺畅': '此时宜【进】。建议果断采取行动，利用当前的高同步率迅速达成目标。',
      '良好': '此时宜【稳】。在保持现有节奏的同时，细化执行方案，确保不出现偏差。',
      '波动': '此时宜【审】。建议重新审视计划，寻找潜在的风险点，等待同步率回升。',
      '阻滞': '此时宜【静】。目前环境阻力较大，强行推进可能导致负面结果，建议以学习和准备为主。'
    }
    const matchedKey = Object.keys(strategies).find(k => metric.desc.includes(k)) || '良好'
    const strategyText = strategies[matchedKey]

    this.setData({
      question,
      guaName,
      guaType,
      syncRate: metric.rate,
      syncDesc: metric.desc,
      yaoList,
      summaryText,
      detailedLogic,
      quoteText,
      strategyText,
    })
  },

  renderFallback(yaoData, question) {
    this.setData({
      question,
      guaName: '模拟异常',
      guaType: '错误',
      syncRate: 0,
      syncDesc: '无法建立逻辑连接',
      yaoList: [],
      summaryText: '排盘引擎在处理过程中遇到异常，请尝试重新起卦。',
      detailedLogic: '系统未能正确解析随机数序列。',
      quoteText: '—',
      strategyText: '建议刷新页面后重试。'
    })
  },

  toggleDetail() {
    this.setData({ showDetail: !this.data.showDetail })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  }
})
