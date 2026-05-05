const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { getFortuneTier } = require('../utils/fortune')
const { paipan } = require('../utils/paipan')
const { getMonthBranch } = require('../utils/dateutil')
const { matchYongshen } = require('../utils/yongshen')
const constants = require('../data/constants')
const { YAO_CHAR, YAO_SYMBOL } = constants
const { HEXAGRAM_BY_BINARY } = require('../data/hexagrams')

const tierCases = [
  [100, '极盛'],
  [90, '极盛'],
  [89, '偏盛'],
  [75, '偏盛'],
  [74, '平顺'],
  [60, '平顺'],
  [59, '小动'],
  [45, '小动'],
  [44, '平衡'],
  [30, '平衡'],
  [29, '偏弱'],
  [15, '偏弱'],
  [14, '受制'],
  [0, '受制'],
]

tierCases.forEach(([score, expectedName]) => {
  const tier = getFortuneTier(score)
  assert.strictEqual(tier.name, expectedName, `${score} should be ${expectedName}`)
  assert.strictEqual(tier.activeIndex, tier.tiers.findIndex(item => item.active), `${score} should expose active index`)
  assert.ok(tier.detailAdvice.length >= 40, `${score} should have detailed advice`)
})

assert.throws(
  () => paipan({ yao: ['x', 'shaoyang', 'shaoyin', 'laoyin', 'laoyang', 'shaoyang'] }),
  /爻数据不合法/
)

assert.strictEqual(YAO_CHAR.laoyang, '○', 'old yang should expose a moving mark')
assert.strictEqual(YAO_CHAR.laoyin, '×', 'old yin should expose a moving mark')
const originalPureYangHexagram = HEXAGRAM_BY_BINARY['111111']
delete HEXAGRAM_BY_BINARY['111111']
assert.throws(
  () => paipan({ yao: ['shaoyang', 'shaoyang', 'shaoyang', 'shaoyang', 'shaoyang', 'shaoyang'] }),
  /找不到对应卦象/
)
HEXAGRAM_BY_BINARY['111111'] = originalPureYangHexagram

assert.strictEqual(YAO_CHAR.shaoyang, '', 'young yang should not expose a moving mark')
assert.strictEqual(YAO_CHAR.shaoyin, '', 'young yin should not expose a moving mark')
assert.ok(YAO_SYMBOL.shaoyang, 'young yang line shape should stay available separately')
assert.ok(YAO_SYMBOL.shaoyin, 'young yin line shape should stay available separately')
assert.strictEqual(constants.FORTUNE_TIERS, undefined, 'shared constants should not expose a stale fortune tier table')
assert.strictEqual(getMonthBranch(2026, 1, 5, 16, 0), '子', 'before 2026 Xiaohan should still use Zi month')
assert.strictEqual(getMonthBranch(2026, 1, 5, 17, 0), '丑', 'after 2026 Xiaohan should use Chou month')
assert.strictEqual(getMonthBranch(2026, 2, 4, 3, 0), '丑', 'before 2026 Lichun should still use Chou month')
assert.strictEqual(getMonthBranch(2026, 2, 4, 5, 0), '寅', 'after 2026 Lichun should use Yin month')
assert.strictEqual(getMonthBranch(2026, 5, 5, 19, 0), '辰', 'before 2026 Lixia exact time should still use Chen month')
assert.strictEqual(getMonthBranch(2026, 5, 5, 20, 0), '巳', 'after 2026 Lixia exact time should use Si month')
const samplePaipan = paipan({ yao: ['shaoyang', 'shaoyin', 'shaoyang', 'shaoyin', 'shaoyang', 'shaoyin'] })
assert.ok(Array.isArray(samplePaipan.yaoDetails), 'paipan should expose camelCase yao details')
assert.strictEqual(samplePaipan.yaoDetails, samplePaipan.yao_details, 'legacy yao_details should alias camelCase yaoDetails')

const visibleCopyFiles = [
  'app.js',
  'pages/index/index.wxml',
  'pages/result/result.wxml',
  'pages/result/result.js',
  'utils/fortune.js',
].map(file => path.join(__dirname, '..', file))

const forbiddenTerms = [
  ['七档', '吉凶', '判断'],
  ['综合', '建议'],
  ['预', '测'],
  ['运', '势'],
  ['决策', '建议'],
  ['AI ', '解卦'],
  ['算', '命'],
  ['止', '损'],
  ['强行', '推进'],
  ['风险', '极高'],
].map(parts => parts.join(''))

visibleCopyFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8')
  forbiddenTerms.forEach(term => {
    assert.ok(!content.includes(term), `${path.relative(path.join(__dirname, '..'), file)} should not include ${term}`)
  })
})

const resultWxml = fs.readFileSync(path.join(__dirname, '..', 'pages/result/result.wxml'), 'utf8')
const resultJs = fs.readFileSync(path.join(__dirname, '..', 'pages/result/result.js'), 'utf8')
const resultWxss = fs.readFileSync(path.join(__dirname, '..', 'pages/result/result.wxss'), 'utf8')
const hexagramsJs = fs.readFileSync(path.join(__dirname, '..', 'data/hexagrams.js'), 'utf8')
const fortuneJs = fs.readFileSync(path.join(__dirname, '..', 'utils/fortune.js'), 'utf8')
const kongwangJs = fs.readFileSync(path.join(__dirname, '..', 'utils/kongwang.js'), 'utf8')
assert.ok(!kongwangJs.includes('function getKongBranches('), 'kongwang should not keep the simplified unused kong branches helper')
assert.ok(fortuneJs.includes('findCoreYaos'), 'fortune should collect core yaos in one pass')
assert.ok(fortuneJs.includes('primaryYue'), 'fortune should reuse primary yue result')
assert.ok(fortuneJs.includes('primaryDay'), 'fortune should reuse primary day result')
assert.ok(fortuneJs.includes("value: primaryYao ? '显现' : '用神不现'"), 'fortune should not label absent yongshen as hidden/伏藏')
assert.ok(resultJs.includes('TERM_TIPS'), 'result page should keep term tips in a shared constant')
assert.strictEqual((resultJs.match(/termTips:/g) || []).length, 2, 'result page should only assign term tips from the shared constant')
assert.ok(resultJs.includes("{ term: '卦宫'"), 'term tips should explain palace/gong context')
assert.ok(resultJs.includes("{ term: '动变'"), 'term tips should explain moving-change context')
assert.ok(resultJs.includes('wx.showToast'), 'result page should give users a light error prompt when rendering fallback')
assert.ok(!resultWxml.includes('shiyao'), 'result view should use clear camelCase shi position naming')
assert.ok(!resultWxml.includes('yingyao'), 'result view should use clear camelCase ying position naming')
assert.ok(resultWxml.includes('shiying.shiPosition'), 'result view should bind shi position with a clear name')
assert.ok(resultWxml.includes('shiying.yingPosition'), 'result view should bind ying position with a clear name')
assert.ok(resultJs.includes('logUserAction'), 'result page should log key user actions through a local wrapper')
assert.ok(hexagramsJs.includes('数据来源'), 'hexagram data should document its source basis')
assert.ok(hexagramsJs.includes('《周易》'), 'hexagram data should reference the Zhouyi text source')
assert.ok(resultWxml.includes('source-note'), 'result page should render a literature source note')
assert.ok(resultWxml.includes('hexagram.source'), 'result page should bind the source note from hexagram data')
assert.ok(resultJs.includes('文献出处：《周易'), 'result data should provide a Zhouyi source label')
assert.ok(!resultWxml.includes('range-badge'), 'result page should not render the top-right range badge')
assert.ok(resultWxml.includes('readingGuide.overview'), 'result page should render a structured reading guide')
assert.ok(resultWxml.includes('consumerConclusion'), 'result page should render a plain-language conclusion')
assert.ok(resultJs.includes('scaleDisplay'), 'result page should build consumer-friendly scale names')
assert.ok(resultWxml.includes('fortune-accent'), 'result conclusion card should have a subtle copper accent')
assert.ok(resultWxml.includes('fortune-brand'), 'result conclusion card should include a screenshot-friendly brand label')
assert.ok(resultWxml.includes('fortune-signature'), 'result conclusion card should include a quiet source signature')
assert.ok(resultWxml.includes('周易六爻 · 文化参考'), 'result conclusion signature should carry product memory')
assert.ok(resultWxml.includes('guide-label">怎么看'), 'reading guide should include shorter plain overview label')
assert.ok(!resultWxml.includes('guide-label">现在怎么看'), 'reading guide should avoid the heavier overview label')
assert.ok(resultWxml.includes('guide-label">适合'), 'reading guide should include suitable label')
assert.ok(resultWxml.includes('guide-label">注意'), 'reading guide should include caution label')
assert.ok(resultWxml.includes('reading-guide-compact'), 'reading guide should be folded into the first-screen conclusion card')
assert.ok(resultWxml.indexOf('reading-guide-compact') > resultWxml.indexOf('fortune-hero'), 'reading guide should live inside the conclusion area')
assert.ok(!resultWxml.includes('reading-guide-card'), 'reading guide should not take a separate first-screen card')
assert.ok(resultWxml.includes('plate-card'), 'result page should render the professional plate card')
assert.ok(resultWxml.includes('deep-reading-card'), 'result page should render a concrete hexagram reading card')
assert.ok(resultWxml.includes('具体卦象解读'), 'result page should title the deep hexagram reading')
assert.ok(resultWxml.includes('term-card'), 'result page should render term explainer cards')
assert.ok(resultWxml.includes('source-card'), 'result page should render a lightweight source card')
assert.ok(resultWxml.includes('资料来源'), 'source card should use a simple source title')
assert.ok(resultWxml.includes('卦辞爻辞参考《周易》通行文本'), 'source card should explain the text basis')
assert.ok(resultWxml.includes('当前页面为文化学习参考'), 'source card should keep the learning-reference positioning')
assert.ok(resultWxss.includes('.source-card'), 'result styles should define the source card')
assert.ok(!resultWxml.includes('为什么这么看'), 'result page should remove the duplicated evidence summary')
assert.ok(!resultWxml.includes('evidence-card'), 'result page should not keep the duplicated evidence card')
assert.ok(resultJs.includes('buildDeepReading'), 'result page should build concrete hexagram reading content')
assert.ok(resultJs.includes('getMonthBranchCopy'), 'result page should translate month branch into plain copy')
assert.ok(resultJs.includes('deepReading'), 'result page should expose deep reading data')
assert.ok(!resultWxml.includes('section-title">动爻变化'), 'result page should not show a separate moving-yao card')
assert.ok(!resultWxml.includes('change-name'), 'moving-yao copy should not be rendered as a separate card')
assert.ok(resultWxml.indexOf('plate-card') < resultWxml.indexOf('deep-reading-card'), 'professional plate should appear above deep reading')
assert.ok(resultWxml.indexOf('deep-reading-card') < resultWxml.indexOf('term-card'), 'deep reading should appear above term explainer')
assert.ok(resultWxml.indexOf('term-card') < resultWxml.indexOf('analysisItems'), 'term explainer should appear before structure evidence')
assert.ok(resultWxss.includes('.deep-reading-card'), 'result styles should define the deep reading card')
assert.ok(resultWxml.includes('内容用于传统文化学习与自我梳理'), 'disclaimer should use natural wording')
assert.ok(/\.btn-primary \{[\s\S]*width: 360rpx;[\s\S]*margin: 0 auto;/.test(resultWxss), 'result primary bottom button should be visually centered with fixed width')
assert.ok(/\.sticky-bar \{[\s\S]*align-items: center;/.test(resultWxss), 'result sticky bar should center its button vertically')
assert.ok(resultWxss.includes('-webkit-backdrop-filter: blur(20rpx);'), 'result sticky bar should include iOS blur compatibility')
assert.ok(/\.btn-primary \{[\s\S]*background: #1d1d1f;/.test(resultWxss), 'result primary bottom button should use an ink-black brand style')
assert.ok(resultWxss.includes('--tier-color'), 'result page should define tier colors through a shared CSS variable')
assert.ok(/\.fortune-accent \{[\s\S]*var\(--tier-color\)/.test(resultWxss), 'fortune accent should use the active tier color')
assert.ok(/\.scale-segment\.active \{[\s\S]*var\(--tier-color\)/.test(resultWxss), 'active scale pill should use the active tier color')
assert.ok(/\.segment-marker \{[\s\S]*var\(--tier-color\)/.test(resultWxss), 'active scale marker should use the active tier color')
;['shangshang', 'daji', 'zhongji', 'xiaoji', 'zhongping', 'xiaxia', 'xiong'].forEach(key => {
  assert.ok(resultWxss.includes(`.level-${key} {`), `result page should define color for ${key}`)
})

const indexWxml = fs.readFileSync(path.join(__dirname, '..', 'pages/index/index.wxml'), 'utf8')
const indexJs = fs.readFileSync(path.join(__dirname, '..', 'pages/index/index.js'), 'utf8')
const indexWxss = fs.readFileSync(path.join(__dirname, '..', 'pages/index/index.wxss'), 'utf8')
const goldenCasesPath = path.join(__dirname, '..', 'data/golden-cases.js')
const verifyGoldenCasesPath = path.join(__dirname, 'verify-golden-cases.js')
const exportGoldenCaseReviewPath = path.join(__dirname, 'export-golden-case-review.js')
const goldenCasesJs = fs.existsSync(goldenCasesPath) ? fs.readFileSync(goldenCasesPath, 'utf8') : ''
const verifyGoldenCasesJs = fs.existsSync(verifyGoldenCasesPath) ? fs.readFileSync(verifyGoldenCasesPath, 'utf8') : ''
const exportGoldenCaseReviewJs = fs.existsSync(exportGoldenCaseReviewPath) ? fs.readFileSync(exportGoldenCaseReviewPath, 'utf8') : ''
assert.ok(indexJs.includes('CASTING_TIMING'), 'index page should name casting timing constants')
assert.ok(indexJs.includes('AUDIO_CONFIG'), 'index page should name audio tuning constants')
assert.ok(indexJs.includes('MIN_HOLD_DURATION'), 'hold delay should be described by a constant')
assert.ok(indexJs.includes('SHAKE_INTERVAL'), 'shake audio interval should be described by a constant')
assert.ok(indexJs.includes('NOISE_BUFFER_DURATION'), 'noise buffer duration should be described by a constant')
assert.ok(indexJs.includes('logUserAction'), 'index page should log key user actions through a local wrapper')
assert.ok(indexWxml.includes('aria-label="写下一个想观察的问题"'), 'topic input should expose an accessible label')
assert.ok(indexWxml.includes('aria-label="按住铜钱盏摇卦"'), 'coin hold control should expose an accessible label')
assert.ok(indexWxml.includes('aria-label="一键完成六爻排盘"'), 'quick complete action should expose an accessible label')
assert.ok(indexJs.includes('resetThrowingState'), 'index page should expose a reset method for a new reading')
assert.ok(resultJs.includes('resetThrowingState'), 'result page should reset index state before returning home')
assert.ok(resultJs.includes('onUnload()'), 'result page should also reset index state when using the native back button')
assert.ok(resultJs.includes('resetPreviousIndexState'), 'result page should share reset logic between native back and bottom action')
assert.ok(indexWxml.includes('coin-tray'), 'index page should use a tray-based coin control')
assert.ok(indexWxml.includes('bindtouchstart="onHoldStart"'), 'coin tray should start shaking on press')
assert.ok(indexWxml.includes('bindtouchend="onHoldEnd"'), 'coin tray should settle on release')
assert.ok(indexWxml.includes('bindtouchcancel="onHoldCancel"'), 'coin tray should handle cancelled touches')
assert.ok(!indexWxml.includes('bindtap="onThrow"'), 'coin control should no longer be a one-tap auto throw')
assert.ok(indexJs.includes('onHoldStart'), 'index logic should expose hold start handler')
assert.ok(indexJs.includes('onHoldEnd'), 'index logic should expose hold end handler')
assert.ok(indexJs.includes('playShakeLoopSound'), 'index logic should include a softer hold-loop sound')
assert.ok(indexJs.includes('playSettleSound'), 'index page should include settle sound')
assert.ok(indexWxss.includes('.coin-tray'), 'index styles should define the tray surface')
assert.ok(indexWxml.includes('coin-stack-image'), 'coin tray should render a single image asset')
assert.ok(indexWxml.includes('/assets/images/coin-stack.svg'), 'coin tray should use the stable coin stack asset')
assert.ok(indexWxss.includes('.coin-stack-image'), 'index styles should size the coin stack image')
assert.ok(indexWxss.includes('.holding .coin-stack-image'), 'index styles should animate the whole coin stack while holding')
assert.ok(indexWxss.includes('.settling .coin-stack-image'), 'index styles should animate the whole coin stack landing')
assert.ok(!indexWxml.includes('ancient-coin'), 'coin tray should not render three independent CSS coins')
assert.ok(indexWxml.includes('gua-progress'), 'index page should render a light gua progress view')
assert.ok(indexWxml.includes('成卦中'), 'gua progress title should read like an in-progress process')
assert.ok(indexWxml.includes("progressVisible ? 'visible' : ''"), 'gua progress should be hidden until casting starts')
assert.ok(indexJs.includes('progressVisible: false'), 'index state should hide gua progress initially')
assert.ok(indexJs.includes('progressVisible: true'), 'index state should reveal gua progress when casting starts')
assert.ok(indexWxss.includes('.gua-progress.visible'), 'index styles should animate gua progress reveal')
assert.ok(indexWxml.includes('progressDots'), 'gua progress should bind to lightweight progress dots')
assert.ok(indexWxml.includes('completedYaoSummary'), 'gua progress should render compact completed yao summaries')
assert.ok(!indexWxml.includes('gua-line-row'), 'gua progress should avoid the heavy six-row line table')
assert.ok(indexWxml.includes('quick-complete'), 'index page should render a small quick complete action')
assert.ok(indexWxml.includes('一键成卦'), 'quick complete action should use the approved copy')
assert.ok(indexWxml.includes('casting-module'), 'coin interaction should be grouped as one casting module')
assert.ok(indexWxml.includes('module-support'), 'casting module should group support controls')
assert.ok(indexWxml.includes('coin-stage'), 'coin image should live inside a dedicated stage')
assert.ok(indexWxml.includes('quick-row'), 'quick complete action should be positioned by a dedicated row')
assert.ok(!indexWxml.includes('<button class="quick-complete"'), 'quick complete should avoid native button default centering')
assert.ok(indexWxml.includes('可先静心默念主题，再按住铜钱盏'), 'index page should include the safer quiet-focus hint')
assert.ok(indexWxml.includes('ritual-hint'), 'quiet-focus hint should have a dedicated style hook')
assert.ok(indexWxml.indexOf('ritual-hint') < indexWxml.indexOf('casting-module'), 'quiet-focus hint should sit above the casting module')
assert.ok(indexWxml.indexOf('cta-hint') < indexWxml.indexOf('coin-tray'), 'press instruction should appear above the coin control')
assert.ok(!indexWxml.includes('更准'), 'index page should not promise better accuracy')
assert.ok(indexWxml.includes('topic-card'), 'index page should use the topic card input style')
assert.ok(indexWxml.includes('topic-accent'), 'topic card should include a subtle focus accent')

assert.strictEqual(matchYongshen('能否赚到钱').yongshen, '妻财', 'money questions should match Wife Wealth')
assert.strictEqual(matchYongshen('最近能不能挣到钱').yongshen, '妻财', 'earn-money questions should match Wife Wealth')
assert.strictEqual(matchYongshen('恋人接下来怎么相处').yongshen, '妻财', 'relationship wording should match Wife Wealth')
assert.strictEqual(matchYongshen('职业发展怎么走').yongshen, '官鬼', 'career wording should match Officer/Ghost')

const projectConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'project.config.json'), 'utf8'))
const packIgnores = projectConfig.packOptions.ignore.map(item => `${item.type}:${item.value}`)
assert.ok(packIgnores.includes('file:DEVLOG.md'), 'developer log should be excluded from the uploaded mini-program package')
assert.ok(packIgnores.includes('file:VERIFICATION_REPORT.md'), 'verification report should be excluded from the uploaded mini-program package')
assert.ok(packIgnores.includes('folder:tmp_sensitive'), 'temporary sensitive working files should be excluded from the uploaded mini-program package')
assert.ok(/\.topic-accent \{[\s\S]*background: linear-gradient\(180deg, rgba\(176, 132, 61, 0\.82\), rgba\(134, 134, 139, 0\.18\)\);/.test(indexWxss), 'topic accent should echo the result card accent color')
assert.ok(indexWxml.includes('topic-pill'), 'topic card should include a restrained context tag')
assert.ok(indexWxml.includes('这次想看什么？'), 'topic card should read like a user question')
assert.ok(indexWxml.includes('写下一个想观察的问题'), 'topic placeholder should be plain and concrete')
assert.ok(indexWxml.includes('topic-chips'), 'topic card should include the preview topic chips')
assert.ok(indexJs.includes('感情关系'), 'topic chips should include relationship copy from the preview')
assert.ok(indexJs.includes('工作事业'), 'topic chips should include work copy from the preview')
assert.ok(indexJs.includes('财务合作'), 'topic chips should include finance copy from the preview')
assert.ok(indexJs.includes('想看 TA'), 'relationship chips should use consumer-friendly copy')
assert.ok(indexJs.includes('看这段关系'), 'relationship chips should explain the whole relationship option')
assert.ok(indexWxml.includes('不选也可以，系统会自动识别。'), 'topic card should reassure users that selection is optional')
assert.ok(indexWxml.includes('传统文化学习用的六爻排盘演示'), 'hero subtitle should stay concise')
assert.ok(!indexWxml.includes('周易纳甲 · 六爻排盘'), 'hero should avoid an extra technical eyebrow line')
assert.ok(indexWxml.includes('内容用于传统文化学习与自我梳理'), 'index footer should use the softer learning disclaimer')
assert.ok(indexJs.includes('onQuickComplete'), 'index logic should expose one-click completion')
assert.ok(indexJs.includes('buildProgressDots'), 'index logic should map results into lightweight progress dots')
assert.ok(indexJs.includes('buildCompletedYaoSummary'), 'index logic should summarize completed yao results')
assert.ok(indexWxss.includes('.gua-progress'), 'index styles should define the gua progress area')
assert.ok(indexWxss.includes('.casting-module'), 'index styles should define the unified casting module')
assert.ok(indexWxss.includes('.module-support'), 'index styles should define the support controls area')
assert.ok(indexWxss.includes('.coin-stage'), 'index styles should define a stable coin stage')
assert.ok(indexWxss.includes('.quick-complete'), 'index styles should define the one-click action')
assert.ok(indexWxss.includes('font-size: 56rpx;'), 'hero title should be large enough on real devices')
assert.ok(indexWxss.includes('linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.76))'), 'topic input should use a clean translucent white surface')
assert.ok(indexWxss.includes('border: 1rpx solid rgba(0, 0, 0, 0.06);'), 'topic input should avoid warm heavy borders')
assert.ok(indexWxss.includes('.topic-chips'), 'topic styles should define the preview chip layout')
assert.ok(indexWxss.includes('.role-chips'), 'topic styles should define the relationship chip row')
assert.ok(/\.casting-module \{[\s\S]*flex: none;/.test(indexWxss), 'casting module should not be pushed down by remaining page height')
assert.ok(indexWxss.includes('background: transparent;'), 'gua progress should read as a light preview rather than a heavy panel')
assert.ok(indexWxss.includes('coin-aura'), 'coin control should use a soft aura instead of a heavy plate')
assert.ok(indexWxml.includes('coin-aura'), 'coin tray should render a soft touch aura')
assert.ok(indexWxss.includes('coin-stack'), 'coin control should use an overlapping stack layout')
assert.ok(indexWxml.includes('coin-stack'), 'coin tray should render overlapping coins')
assert.ok(!/\\.coin-tray \\{[\\s\\S]*border-radius: 50%;/.test(indexWxss), 'coin tray should not look like a heavy round plate')
assert.ok(indexWxss.includes('color: #86868b;'), 'secondary labels and actions should use neutral iOS gray')
assert.ok(/\.quick-complete \{[\s\S]*width: 132rpx;[\s\S]*height: 56rpx;/.test(indexWxss), 'quick complete should be a compact refined tap target')
assert.ok(/\.quick-row \{[\s\S]*justify-content: flex-end;[\s\S]*padding-right: 72rpx;/.test(indexWxss), 'quick complete pill should sit on the right side of the page')
assert.ok(/\.quick-row \{[\s\S]*margin-top: 14rpx;/.test(indexWxss), 'quick complete pill should keep clear space below the coin stage')
assert.ok(/\.ritual-hint \{[\s\S]*width: calc\(100% - 80rpx\);[\s\S]*margin-top: 28rpx;/.test(indexWxss), 'quiet-focus hint should use the original upper placement spacing')
assert.ok(/\.ritual-hint \{[\s\S]*color: rgba\(154, 107, 47, 0\.72\);/.test(indexWxss), 'quiet-focus hint should softly echo the coin color')
assert.ok(/\.cta-hint\.active \{[\s\S]*color: rgba\(154, 107, 47, 0\.86\);/.test(indexWxss), 'active casting status should use the coin color instead of system blue')
assert.ok(!indexWxml.includes('module-rule'), 'casting module should avoid visible decorative divider')
assert.ok(!indexWxss.includes('.coin-stage::before'), 'coin stage should avoid an extra decorative light field')
assert.ok(!/\.module-support \{[\s\S]*border-top:/.test(indexWxss), 'support area should avoid a visible separator')
assert.ok(/\.quick-complete \{[\s\S]*display: flex;/.test(indexWxss), 'quick complete should center content with flex')
assert.ok(/\.quick-complete \{[\s\S]*text-align: center;/.test(indexWxss), 'quick complete text should be centered inside the pill')
assert.ok(/\.quick-complete \{[\s\S]*background: rgba\(236, 236, 240, 0\.92\);/.test(indexWxss), 'quick complete should use a refined light gray secondary button background')
assert.ok(/\.quick-complete \{[\s\S]*color: #424245;/.test(indexWxss), 'quick complete should use dark gray secondary button text')
assert.ok(/\.page-paper \{[\s\S]*min-height: 100vh;[\s\S]*padding-bottom: 48rpx;/.test(indexWxss), 'index page should reserve a full viewport for pushing the disclaimer down')
assert.ok(/\.footer-legal \{[\s\S]*margin-top: auto;/.test(indexWxss), 'index footer disclaimer should sit as low as possible')
assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets/images/coin-stack.svg')), 'coin stack asset should exist before review submission')
assert.ok(fs.existsSync(goldenCasesPath), 'golden case fixture should exist')
assert.ok(fs.existsSync(verifyGoldenCasesPath), 'golden case verifier should exist')
assert.ok(fs.existsSync(exportGoldenCaseReviewPath), 'golden case review exporter should exist')
assert.ok(goldenCasesJs.includes('GOLDEN_CASES'), 'golden case fixture should export GOLDEN_CASES')
assert.ok(goldenCasesJs.includes("status: 'draft'"), 'golden cases should start as draft instead of invented standards')
assert.ok(verifyGoldenCasesJs.includes('verified'), 'golden case verifier should distinguish verified cases from drafts')
assert.ok(verifyGoldenCasesJs.includes('expected'), 'golden case verifier should compare expected outputs once cases are verified')
assert.ok(verifyGoldenCasesJs.includes('dateTime'), 'golden case verifier should use fixed case time for deterministic checks')
assert.ok(exportGoldenCaseReviewJs.includes('golden-case-review.csv'), 'golden case review exporter should write a CSV review table')
assert.ok(exportGoldenCaseReviewJs.includes('人工校验'), 'golden case review exporter should reserve manual review columns')
assert.ok(exportGoldenCaseReviewJs.includes('buildSnapshot'), 'golden case review exporter should reuse deterministic golden snapshots')
assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs/golden-cases.md')), 'golden case workflow docs should exist')

console.log('fortune tier tests passed')


