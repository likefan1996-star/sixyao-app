/** 结果页逻辑 — v0.1 经典版 适配纯前端引擎 */
const { paipan } = require('../../utils/paipan')
const { logUserAction } = require('../../utils/logger')
const { saveHistoryRecord } = require('../../utils/history')

const CONSUMER_COPY = {
  shangshang: {
    name: '很顺',
    conclusion: '这件事的支撑很足，可以顺着主线往前看。',
    overview: '支撑比较足，主线清楚。',
    suitable: '确认机会，推进小步骤。',
    caution: '别忽略局部牵制。'
  },
  daji: {
    name: '偏顺',
    conclusion: '整体条件不错，但还要确认几个关键细节。',
    overview: '有推进空间，阻力不算重。',
    suitable: '先谈条件，看反馈。',
    caution: '别一次投入太重。'
  },
  zhongji: {
    name: '小顺',
    conclusion: '大方向还算顺，但需要边走边看。',
    overview: '有一些支撑，还要继续观察。',
    suitable: '稳步推进，先做验证。',
    caution: '别把短期顺利当定局。'
  },
  xiaoji: {
    name: '有变',
    conclusion: '事情有起伏，重点看变化点怎么发展。',
    overview: '不算顺，也没卡死，变化点关键。',
    suitable: '先观察转折，拆小步骤。',
    caution: '别急着定性。'
  },
  zhongping: {
    name: '平平',
    conclusion: '整体比较中性，暂时不宜下太重的判断。',
    overview: '支撑和阻力都有，倾向不明显。',
    suitable: '整理信息，保持节奏。',
    caution: '别过度解读。'
  },
  xiaxia: {
    name: '偏难',
    conclusion: '阻力偏多，先找出最卡的地方。',
    overview: '阻力偏多，支撑不够集中。',
    suitable: '先补短板，降低投入。',
    caution: '别硬推，先找卡点。'
  },
  xiong: {
    name: '卡住',
    conclusion: '这件事现在卡点较重，先不要急着往前冲。',
    overview: '卡点较重，适合停下来复盘。',
    suitable: '重新确认目标和路径。',
    caution: '别把象意当成定论。'
  },
  error: {
    name: '异常',
    conclusion: '这次数据不完整，请重新摇卦再看。',
    overview: '排盘参数异常，暂时无法形成有效参考。',
    suitable: '适合返回首页重新摇卦，确保六爻数据完整。',
    caution: '注意不要继续解读异常数据。'
  }
}

function getConsumerCopy(key) {
  return CONSUMER_COPY[key] || CONSUMER_COPY.zhongping
}

function buildReadingGuide(tier, movingStr) {
  const base = getConsumerCopy(tier.key)
  const movingHint = movingStr && movingStr !== '无'
    ? `有${movingStr}动，重点看变化点。`
    : '无动爻，先看稳定状态。'

  return {
    overview: `${base.overview}${movingHint}`,
    suitable: base.suitable,
    caution: base.caution,
  }
}

const TERM_TIPS = [
  { term: '用神', meaning: '这次主要看的对象' },
  { term: '动爻', meaning: '事情里正在变化的地方' },
  { term: '世应', meaning: '自己和外部的关系' },
  { term: '月日', meaning: '当前环境的影响' },
  { term: '卦宫', meaning: '本卦所属的结构类别' },
  { term: '动变', meaning: '动爻变化后形成的线索' },
]

const YONGSHEN_MEANINGS = {
  世爻: '代表自己这边',
  应爻: '代表对方或外部',
  妻财: '常看资源、财务或伴侣线索',
  官鬼: '常看规则、压力或对象线索',
  父母: '常看信息、文书或居所线索',
  兄弟: '常看同伴、竞争或消耗线索',
  子孙: '常看缓和、结果或身心状态',
}

const MONTH_BRANCH_COPY = {
  寅: '木气当令',
  卯: '木气当令',
  辰: '土气承接',
  巳: '火气当令',
  午: '火气当令',
  未: '土气承接',
  申: '金气当令',
  酉: '金气当令',
  戌: '土气承接',
  亥: '水气当令',
  子: '水气当令',
  丑: '土气承接',
}

function getYongshenMeaning(yongshen) {
  return YONGSHEN_MEANINGS[yongshen] || '这次主要看的对象'
}

function getMonthBranchCopy(monthBranch) {
  if (!monthBranch) return '按节气时间切换'
  return `${monthBranch}月，${MONTH_BRANCH_COPY[monthBranch] || '看当前环境'}`
}

function buildDeepReading(d, fortune, movingStr) {
  const hexagramName = d.hexagram?.name || '本卦'
  const changedName = d.changedHexagram?.name || ''
  const yongshen = fortune.yongshen || '世爻'
  const monthCopy = getMonthBranchCopy(d.today?.monthBranch || '')
  const dayCopy = d.today?.dayStem && d.today?.dayBranch ? `${d.today.dayStem}${d.today.dayBranch}日` : '当前日辰'
  const hasMoving = movingStr && movingStr !== '无'
  const transition = changedName ? `变卦为${changedName}` : '没有形成变卦'

  return {
    badge: '按本卦生成',
    summary: `${hexagramName}${changedName ? `转${changedName}` : ''}，先看本卦结构，再看${transition}后的走向。当前倾向不宜只看一句结论，更适合结合盘面、动爻和月日一起观察。`,
    items: [
      {
        label: '本卦',
        body: `${hexagramName}是这次排盘的主结构，代表事情当前呈现出来的状态。阅读时先看它的主题，再看它和问题之间的对应关系。`,
      },
      {
        label: '变卦',
        body: changedName ? `${transition}，说明后续重点会从当前状态转向新的结构。这里适合观察事情会往哪里变，而不是急着下定论。` : '本卦没有变卦，说明这次更适合先看当前结构和稳定状态，不必过度放大短期波动。',
      },
      {
        label: '动爻',
        body: hasMoving ? `${movingStr}动，是这次盘面里最明显的变化点。它提示事情正在变化，重点看这些爻位对应的角色和关系。` : '本卦无动爻，先看整体稳定性、世应关系和用神状态。',
      },
      {
        label: '用神世应',
        body: `用神取${yongshen}，${getYongshenMeaning(yongshen)}。世应关系可用于观察自己与对方或外部环境之间的互动。`,
      },
      {
        label: '月日影响',
        body: `${monthCopy}，${dayCopy}参与判断。月日更像当前环境，会影响各爻旺衰和事情推进节奏。`,
      },
    ],
    footer: '深度解读用于传统文化学习与自我梳理，后续可接入 AI 根据问题、卦象和盘面生成更贴合的说明。',
  }
}

Page({
  data: {
    question: '',
    hexagram: {},
    changedHexagram: {},
    shiying: {},
    yaoDetails: [],
    auspicious: {},
    analysisItems: [],
    suggestion: '',
    movingPositionsStr: '',
    dayStem: '',
    yaoData: [],
    deepReading: {
      badge: '',
      summary: '',
      items: [],
      footer: '',
    },
    tier: {
      name: '平衡',
      key: 'zhongping',
      range: '30-44',
      advice: '结构趋于中和，强弱信号相对均衡。',
      detailAdvice: '当前分值处在中间区间，说明卦象中支撑与牵制大致并存，结构倾向不特别突出。学习时可重点比较各维度的相互抵消关系。',
      score: 0,
      percent: 0,
      activeIndex: 4,
      displayName: '平平',
    },
    tierScale: [],
    keyInsights: [],
    termTips: TERM_TIPS,
    consumerConclusion: '',
    readingGuide: {
      overview: '',
      suitable: '',
      caution: '',
    },
  },

  onLoad(options) {
    try {
      const question = decodeURIComponent(options.question || '')
      const yaoStr = decodeURIComponent(options.yao || '[]')
      const dateTime = decodeURIComponent(options.dateTime || '')
      const fromHistory = options.fromHistory === '1'
      const yaoData = JSON.parse(yaoStr)

      this.setData({ question, yaoData, dateTime })
      const result = paipan({ yao: yaoData, question, dateTime: dateTime || undefined })
      logUserAction('render_result', {
        hasQuestion: !!question,
        yaoCount: Array.isArray(yaoData) ? yaoData.length : 0,
        hexagram: result.hexagram?.name || '',
      })
      this.renderResult(result, question, yaoData, dateTime, fromHistory)
    } catch (e) {
      console.error('排盘出错', e)
      logUserAction('render_result_fallback', { reason: e.message || 'unknown' })
      wx.showToast({ title: '排盘数据异常，请重新起卦', icon: 'none' })
      const question = decodeURIComponent(options.question || '')
      this.renderFallback([], question)
    }
  },

  renderResult(d, question, yaoData = [], dateTime = '', fromHistory = false) {
    const rawYaoDetails = d.yaoDetails || d.yao_details || []
    const displayYao = [...rawYaoDetails].reverse().map(y => ({
      position: y.position,
      value: y.binary === 1 ? 'yang' : 'yin',
      stem: y.stem,
      branch: y.branch,
      liuqin: y.liuqin,
      liushen: y.liushen,
      is_moving: y.isMoving || false,
    }))

    const movingStr = (d.movingPositions || []).map(p => `第${p}爻`).join('、') || '无'

    const fortune = d.fortune || {}
    const displayScore = fortune.displayScore !== undefined ? fortune.displayScore : (fortune.score || 0)
    const tierPercent = fortune.tierPercent !== undefined ? fortune.tierPercent : displayScore
    const tierScale = fortune.tierScale || []
    const tier = {
      name: fortune.tierName || fortune.verdictText || '平衡',
      key: fortune.tierKey || 'zhongping',
      range: fortune.tierRange || '30-44',
      advice: fortune.tierAdvice || fortune.verdictDesc || '结构趋于中和，强弱信号相对均衡。',
      detailAdvice: fortune.tierDetailAdvice || fortune.tierAdvice || fortune.verdictDesc || '当前结构信息尚不充分，可结合月日、用神、动爻与世应关系进行学习观察。',
      score: displayScore,
      percent: tierPercent,
      activeIndex: fortune.tierActiveIndex !== undefined ? fortune.tierActiveIndex : tierScale.findIndex(item => item.active),
    }
    const consumerCopy = getConsumerCopy(tier.key)
    tier.displayName = consumerCopy.name
    const scaleDisplay = tierScale.map(item => ({
      ...item,
      displayName: getConsumerCopy(item.key).name,
    }))
    const verdict = tier.name

    // ── 构建详细分析条目 ──
    const items = []
    const rawItems = fortune.items || []

    // 找出关键分值来源
    const yueItems = rawItems.filter(i => i.includes('月建'))
    const riItems = rawItems.filter(i => i.includes('日辰') || i.includes('日冲'))
    const yongItems = rawItems.filter(i => i.includes('用神'))
    const movingItems = rawItems.filter(i => i.includes('动'))
    const shiyingItems = rawItems.filter(i => i.includes('世应'))

    if (yueItems.length > 0) {
      items.push({
        title: '月令旺衰',
        content: yueItems.join('；') + '。月建主管当月五行气势，影响各爻的旺衰程度。'
      })
    }

    if (riItems.length > 0) {
      items.push({
        title: '日辰影响',
        content: riItems.join('；') + '。日辰为当日之气，对爻位产生生扶或克制。'
      })
    }

    if (yongItems.length > 0) {
      items.push({
        title: '用神状态',
        content: yongItems.join('；') + '。用神可作为观察卦象结构强弱、动静关系的学习参考。'
      })
    }

    if (movingItems.length > 0) {
      items.push({
        title: '动爻变化',
        content: movingItems.join('；') + '。动爻体现卦中变化线索，可用于观察结构重心的转移。'
      })
    }

    if (shiyingItems.length > 0) {
      items.push({
        title: '世应关系',
        content: shiyingItems.join('；') + '。世爻代表自身，应爻代表对方或环境。'
      })
    }

    const hexagramName = d.hexagram?.name || ''
    const deepReading = buildDeepReading(d, fortune, movingStr)

    this.setData({
      question,
      hexagram: {
        name: hexagramName || '未知',
        character: d.hexagram?.name?.charAt(0) || '☯',
        palace: d.hexagram?.palace || '',
        gua_ci: d.hexagram?.judgment || '',
        source: hexagramName ? `文献出处：《周易·${hexagramName}卦》卦辞` : '文献出处：《周易》卦辞',
      },
      changedHexagram: d.changedHexagram ? {
        name: d.changedHexagram.name || '',
        character: d.changedHexagram.name?.charAt(0) || '',
      } : {},
      shiying: {
        shiPosition: d.shiying?.shi || 0,
        yingPosition: d.shiying?.ying || 0,
      },
      yaoDetails: displayYao,
      auspicious: {
        level: verdict,
        score: fortune.score || 0,
      },
      tier,
      tierScale: scaleDisplay,
      keyInsights: [],
      deepReading,
      consumerConclusion: consumerCopy.conclusion,
      readingGuide: buildReadingGuide(tier, movingStr),
      suggestion: tier.detailAdvice,
      analysisItems: items,
      movingPositionsStr: movingStr,
      dayStem: d.today?.dayStem || '',
      levelClass: 'level-' + tier.key,
    })

    if (!fromHistory) {
      saveHistoryRecord({
        question,
        yao: yaoData,
        dateTime: dateTime || new Date().toISOString(),
        hexagramName: d.hexagram?.name || '',
        changedHexagramName: d.changedHexagram?.name || '',
        tierName: tier.displayName || tier.name || '',
        tierKey: tier.key || '',
      })
    }
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
      hexagram: { name: '排盘异常', character: '⚠', palace: '', source: '' },
      changedHexagram: {},
      shiying: {},
      yaoDetails: yaoDisplay,
      auspicious: { level: '—', score: 0 },
      tier: {
        name: '异常',
        key: 'error',
        range: '—',
        advice: '排盘参数异常，请返回首页重新摇卦。',
        detailAdvice: '排盘参数异常，请返回首页重新摇卦。',
        score: 0,
        percent: 0,
        activeIndex: 0,
        displayName: '异常',
      },
      tierScale: [],
      keyInsights: [],
      deepReading: {
        badge: '异常',
        summary: '这次排盘数据不完整，暂时无法生成具体卦象解读。',
        items: [],
        footer: '请返回首页重新起卦后再查看。',
      },
      termTips: TERM_TIPS,
      consumerConclusion: getConsumerCopy('error').conclusion,
      readingGuide: buildReadingGuide({ key: 'error' }, '—'),
      suggestion: '排盘参数异常，请返回首页重新摇卦。',
      analysisItems: [{ title: '提示', content: '排盘引擎异常，请重试' }],
      movingPositionsStr: '—',
    })
  },

  resetPreviousIndexState() {
    if (this.hasResetIndexState) return
    this.hasResetIndexState = true
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && typeof prevPage.resetThrowingState === 'function') {
      prevPage.resetThrowingState()
    }
  },

  onUnload() {
    this.resetPreviousIndexState()
  },

  onEnd() {
    logUserAction('return_home_from_result')
    this.resetPreviousIndexState()
    wx.navigateBack({ delta: 1 })
  }
})
