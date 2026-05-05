/** 首页逻辑 — 铜钱盏长按摇卦 + 分层音效 */
const { logUserAction } = require('../../utils/logger')

const CASTING_TIMING = {
  MIN_HOLD_DURATION: 360,
  SETTLE_ANIMATION_DELAY: 560,
  QUICK_RESULT_DELAY: 620,
  FINAL_RESULT_DELAY: 520,
}

const AUDIO_CONFIG = {
  SHAKE_INTERVAL: 220,
  NOISE_BUFFER_DURATION: 0.032,
  NOISE_DECAY_EXPONENT: 1.35,
  TICK_START_FREQUENCY: 620,
  TICK_RANDOM_RANGE: 120,
  TICK_END_FREQUENCY: 360,
}

Page({
  data: {
    question: '',
    throwing: false,
    holding: false,
    animClass: '',
    stepText: '按住铜钱盏 · 摇第 1 爻',
    currentStep: 0,
    progressVisible: false,
    results: [],
    throwRecords: [],
    progressDots: [],
    completedYaoSummary: [],
    topicTypes: [
      { key: 'relationship', label: '感情关系' },
      { key: 'work', label: '工作事业' },
      { key: 'finance', label: '财务合作' },
      { key: 'other', label: '其他' },
    ],
    relationshipRoles: [
      { key: 'person', label: '想看 TA' },
      { key: 'whole', label: '看这段关系' },
    ],
    selectedTopic: 'relationship',
    selectedRole: '',
  },

  onLoad() {
    this.audioCtx = null
    this.shakeTimer = null
    this.holdStartedAt = 0
    this.initAudio()
    this.setData({
      progressDots: this.buildProgressDots([]),
      completedYaoSummary: this.buildCompletedYaoSummary([]),
    })
  },

  onUnload() {
    this.stopShakeLoop()
  },

  resetThrowingState(keepQuestion = true) {
    this.stopShakeLoop()
    this.holdStartedAt = 0
    this.setData({
      question: keepQuestion ? this.data.question : '',
      throwing: false,
      holding: false,
      animClass: '',
      stepText: '按住铜钱盏 · 摇第 1 爻',
      currentStep: 0,
      progressVisible: false,
      results: [],
      throwRecords: [],
      progressDots: this.buildProgressDots([]),
      completedYaoSummary: this.buildCompletedYaoSummary([]),
    })
  },

  initAudio() {
    try {
      this.audioCtx = wx.createWebAudioContext ? wx.createWebAudioContext() : null
    } catch(e) {
      // 无音效不影响使用
    }
  },

  onInput(e) {
    this.setData({ question: e.detail.value })
  },

  onSelectTopic(e) {
    const selectedTopic = e.currentTarget.dataset.key
    this.setData({
      selectedTopic,
      selectedRole: selectedTopic === 'relationship' ? this.data.selectedRole : '',
    })
  },

  onSelectRole(e) {
    this.setData({ selectedRole: e.currentTarget.dataset.key })
  },

  onOpenHistory() {
    logUserAction('open_local_history_entry')
    wx.navigateTo({ url: '/pages/history/history' })
  },

  onHoldStart() {
    if (this.data.throwing) return

    if (!this.data.question.trim()) {
      wx.showToast({ title: '请先记录学习主题', icon: 'none' })
      return
    }

    if (this.data.currentStep >= 6) return

    const nextStep = this.data.currentStep + 1
    logUserAction('hold_cast_start', { step: nextStep })
    this.holdStartedAt = Date.now()
    this.setData({
      throwing: true,
      holding: true,
      progressVisible: true,
      animClass: 'holding',
      stepText: `松手落爻 · 第 ${nextStep} 爻`,
    })
    this.startShakeLoop()
  },

  onHoldEnd() {
    if (!this.data.holding) return
    const elapsed = Date.now() - this.holdStartedAt
    const delay = Math.max(0, CASTING_TIMING.MIN_HOLD_DURATION - elapsed)
    this.stopShakeLoop()
    setTimeout(() => this.settleThrow(), delay)
  },

  onHoldCancel() {
    if (!this.data.holding) return
    this.stopShakeLoop()
    this.setData({
      throwing: false,
      holding: false,
      animClass: '',
      stepText: `按住铜钱盏 · 摇第 ${this.data.currentStep + 1} 爻`,
    })
  },

  onQuickComplete() {
    if (this.data.throwing) return

    if (!this.data.question.trim()) {
      wx.showToast({ title: '请先记录学习主题', icon: 'none' })
      return
    }

    if (this.data.currentStep >= 6) return

    this.stopShakeLoop()
    logUserAction('quick_complete_cast', { fromStep: this.data.currentStep })
    const nextResults = this.data.results.slice()
    while (nextResults.length < 6) {
      nextResults.push(this.createYao())
    }

    this.playSettleSound()
    this.setData({
      throwing: true,
      holding: false,
      progressVisible: true,
      animClass: 'settling',
      stepText: '一键成卦中…',
      currentStep: 6,
      results: nextResults,
      throwRecords: nextResults.map((type, i) => this.getYaoRecord(type, i)),
      progressDots: this.buildProgressDots(nextResults),
      completedYaoSummary: this.buildCompletedYaoSummary(nextResults),
    })

    setTimeout(() => this.goResult(nextResults), CASTING_TIMING.QUICK_RESULT_DELAY)
  },

  startShakeLoop() {
    this.stopShakeLoop()
    this.playShakeLoopSound()
    this.shakeTimer = setInterval(() => this.playShakeLoopSound(), AUDIO_CONFIG.SHAKE_INTERVAL)
  },

  stopShakeLoop() {
    if (this.shakeTimer) {
      clearInterval(this.shakeTimer)
      this.shakeTimer = null
    }
  },

  playShakeLoopSound() {
    try {
      if (!this.audioCtx) return
      const ctx = this.audioCtx
      const now = ctx.currentTime

      const bufferSize = Math.floor(ctx.sampleRate * AUDIO_CONFIG.NOISE_BUFFER_DURATION)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, AUDIO_CONFIG.NOISE_DECAY_EXPONENT)
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.042, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
      noise.connect(noiseGain)
      noiseGain.connect(ctx.destination)
      noise.start(now)

      const tick = ctx.createOscillator()
      const tickGain = ctx.createGain()
      tick.type = 'triangle'
      tick.frequency.setValueAtTime(AUDIO_CONFIG.TICK_START_FREQUENCY + Math.random() * AUDIO_CONFIG.TICK_RANDOM_RANGE, now)
      tick.frequency.exponentialRampToValueAtTime(AUDIO_CONFIG.TICK_END_FREQUENCY, now + 0.055)
      tickGain.gain.setValueAtTime(0.026, now)
      tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
      tick.connect(tickGain)
      tickGain.connect(ctx.destination)
      tick.start(now)
      tick.stop(now + 0.075)
    } catch(e) {
      // 音效失败不影响使用
    }
  },

  playSettleSound() {
    try {
      if (!this.audioCtx) return
      const ctx = this.audioCtx
      const now = ctx.currentTime

      ;[0, 0.055, 0.115].forEach((offset, index) => {
        const clink = ctx.createOscillator()
        const clinkGain = ctx.createGain()
        clink.type = 'sine'
        clink.frequency.setValueAtTime(1500 - index * 180, now + offset)
        clink.frequency.exponentialRampToValueAtTime(540 - index * 60, now + offset + 0.15)
        clinkGain.gain.setValueAtTime(0.09 - index * 0.018, now + offset)
        clinkGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2)
        clink.connect(clinkGain)
        clinkGain.connect(ctx.destination)
        clink.start(now + offset)
        clink.stop(now + offset + 0.22)
      })

      const body = ctx.createOscillator()
      const bodyGain = ctx.createGain()
      body.type = 'triangle'
      body.frequency.setValueAtTime(260, now + 0.035)
      body.frequency.exponentialRampToValueAtTime(150, now + 0.28)
      bodyGain.gain.setValueAtTime(0.075, now + 0.035)
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34)
      body.connect(bodyGain)
      bodyGain.connect(ctx.destination)
      body.start(now + 0.035)
      body.stop(now + 0.36)
    } catch(e) {
      // 音效失败不影响使用
    }
  },

  settleThrow() {
    this.playSettleSound()
    this.setData({ holding: false, animClass: 'settling', stepText: '铜钱落定中…' })

    setTimeout(() => {
      const nextResults = this.data.results.concat(this.createYao())
      const currentStep = nextResults.length

      this.setData({
        throwing: false,
        holding: false,
        currentStep,
        results: nextResults,
        throwRecords: nextResults.map((type, i) => this.getYaoRecord(type, i)),
        progressDots: this.buildProgressDots(nextResults),
        completedYaoSummary: this.buildCompletedYaoSummary(nextResults),
        animClass: '',
        stepText: currentStep >= 6 ? '卦象生成中…' : `按住铜钱盏 · 摇第 ${currentStep + 1} 爻`,
      })

      if (currentStep >= 6) {
        setTimeout(() => this.goResult(nextResults), CASTING_TIMING.FINAL_RESULT_DELAY)
      }
    }, CASTING_TIMING.SETTLE_ANIMATION_DELAY)
  },

  goResult(results) {
    logUserAction('navigate_result', { yaoCount: results.length })
    const dateTime = new Date().toISOString()
    wx.navigateTo({
      url: `/pages/result/result?question=${encodeURIComponent(this.data.question)}&yao=${encodeURIComponent(JSON.stringify(results))}&dateTime=${encodeURIComponent(dateTime)}`
    })
  },

  createYao() {
    const coin1 = Math.random() > 0.5 ? 3 : 2
    const coin2 = Math.random() > 0.5 ? 3 : 2
    const coin3 = Math.random() > 0.5 ? 3 : 2
    const total = coin1 + coin2 + coin3

    if (total === 6) return 'laoyin'
    if (total === 7) return 'shaoyang'
    if (total === 8) return 'shaoyin'
    return 'laoyang'
  },

  buildProgressDots(results) {
    const dots = []
    for (let index = 0; index < 6; index++) {
      const record = results[index] ? this.getYaoRecord(results[index], index) : null
      dots.push({
        index: index + 1,
        done: !!record,
        moving: record ? record.moving : false,
      })
    }
    return dots
  },

  buildCompletedYaoSummary(results) {
    return results
      .map((type, index) => this.getYaoRecord(type, index))
      .slice(-2)
      .map(record => ({
        text: `${record.index}爻 ${record.name}`,
      }))
  },

  getYaoRecord(type, index) {
    const map = {
      laoyang: { name: '老阳', symbol: '阳', moving: true },
      shaoyang: { name: '少阳', symbol: '阳', moving: false },
      shaoyin: { name: '少阴', symbol: '阴', moving: false },
      laoyin: { name: '老阴', symbol: '阴', moving: true },
    }
    const item = map[type] || { name: '未知', symbol: '—', moving: false }
    return {
      index: index + 1,
      name: item.name,
      symbol: item.symbol,
      moving: item.moving,
      text: `第${index + 1}爻 ${item.name}${item.moving ? ' · 动' : ''}`,
    }
  },
})
