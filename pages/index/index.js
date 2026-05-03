/** 首页逻辑 — 材质与音效升级版 v3.0 **/
const app = getApp()

Page({
  data: {
    question: '',
    throwing: false,
    animClass: '',
    stepText: '点击铜钱 · 开始模拟推演',
    currentStep: 0,
    results: [],
    throwHistory: [],
  },

  onLoad() {
    this.audioCtx = null
    this.initAudio()
  },

  initAudio() {
    try {
      this.audioCtx = wx.createWebAudioContext ? wx.createWebAudioContext() : null
    } catch(e) {}
  },

  /** 
   * 升级版金属撞击音效
   * 模拟：瞬时噪声(撞击) -> 多频共振(金属体) -> 指数衰减(余韵)
   */
  playCoinSound() {
    try {
      if (!this.audioCtx) return
      const ctx = this.audioCtx
      const now = ctx.currentTime

      // 1. 冲击波 (Impact): 模拟硬币触地瞬间的宽频噪声
      const impactBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate)
      const impactData = impactBuffer.getChannelData(0)
      for (let i = 0; i < impactBuffer.length; i++) {
        impactData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (impactBuffer.length * 0.5))
      }
      const impactSrc = ctx.createBufferSource()
      impactSrc.buffer = impactBuffer
      const impactGain = ctx.createGain()
      impactGain.gain.setValueAtTime(0.3, now)
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
      impactSrc.connect(impactGain)
      impactGain.connect(ctx.destination)
      impactSrc.start(now)

      // 2. 金属主共振 (Main Resonance): 1200Hz - 1800Hz
      const createResonance = (freq, gainVal, startOffset, decayTime) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + startOffset)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + startOffset + decayTime)
        gain.gain.setValueAtTime(gainVal, now + startOffset)
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + decayTime)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + startOffset)
        osc.stop(now + startOffset + decayTime)
      }

      // 叠加多个谐波，模拟真实金属材质
      createResonance(1400, 0.15, 0.002, 0.12) // 基频
      createResonance(2800, 0.08, 0.005, 0.08) // 一倍频
      createResonance(4200, 0.04, 0.01, 0.05)  // 二倍频
      createResonance(800, 0.05, 0.01, 0.15)   // 低频共鸣

    } catch(e) {
      console.error('音效合成失败', e)
    }
  },

  onInput(e) {
    this.setData({ question: e.detail.value })
  },

  onThrow() {
    if (this.data.throwing) return
    if (!this.data.question.trim()) {
      wx.showToast({ title: '请输入您的问题', icon: 'none' })
      return
    }

    this.setData({
      throwing: true,
      currentStep: 0,
      results: [],
      throwHistory: [],
      animClass: 'shaking',
    })
    setTimeout(() => this.doThrow(0, []), 400)
  },

  doThrow(count, results) {
    if (count >= 6) {
      this.setData({
        throwing: false,
        animClass: '',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/result/result?question=${encodeURIComponent(this.data.question)}&yao=${encodeURIComponent(JSON.stringify(results))}`
        })
      }, 500)
      return
    }

    this.playCoinSound()
    this.setData({ animClass: 'toss' })

    setTimeout(() => {
      const coin1 = Math.random() > 0.5 ? 3 : 2
      const coin2 = Math.random() > 0.5 ? 3 : 2
      const coin3 = Math.random() > 0.5 ? 3 : 2
      const total = coin1 + coin2 + coin3

      let yao
      if (total === 6) yao = 'laoyin'
      else if (total === 7) yao = 'shaoyang'
      else if (total === 8) yao = 'shaoyin'
      else yao = 'laoyang'

      results.push(yao)
      count++

      const readable = {
        'laoyang': '阳 · 变',
        'shaoyang': '阳',
        'shaoyin': '阴',
        'laoyin': '阴 · 变'
      }
      const currentHistory = this.data.throwHistory || []
      
      if (count < 6) {
        this.setData({
          currentStep: count,
          throwHistory: [...currentHistory, readable[yao]],
          animClass: 'shaking',
        })
        setTimeout(() => this.doThrow(count, results), 550)
      } else {
        this.setData({
          currentStep: count,
          throwHistory: [...currentHistory, readable[yao]],
        })
        setTimeout(() => this.doThrow(count, results), 350)
      }
    }, 650)
  },
})
