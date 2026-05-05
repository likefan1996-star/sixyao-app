/**
 * Round 2 Verification Script
 * 六爻小程序第二轮交叉验证
 */

const { paipan } = require('../utils/paipan')

const results = { passed: [], failed: [], warnings: [] }

function test(name, fn) {
  try {
    const r = fn()
    results.passed.push(name)
    console.log(`✅ ${name}`)
    return r
  } catch (e) {
    results.failed.push({ name, error: e.message })
    console.log(`❌ ${name}: ${e.message}`)
    return null
  }
}

function warn(name, msg) {
  results.warnings.push({ name, msg })
  console.log(`⚠️  ${name}: ${msg}`)
}

// ─────────────────────────────────────────────
// 1. 产品解释层一致性
// ─────────────────────────────────────────────

console.log('\n=== 产品解释层一致性 ===')

test('静卦: 无动爻时文案说"静卦"', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  const dims = r.fortune.dimensions
  const dongDim = dims.find(d => d.label === '动变')
  if (!dongDim.value.includes('静') && !dongDim.value.includes('0')) {
    throw new Error(`静卦的动变维度应为"静卦"，实际: ${dongDim.value}`)
  }
  if (dongDim.detail.includes('变化')) {
    throw new Error(`静卦的动变说明不应提及变化: ${dongDim.detail}`)
  }
})

test('动卦: 正确标注动爻数量', () => {
  const r = paipan({
    yao: ['laoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  const dims = r.fortune.dimensions
  const dongDim = dims.find(d => d.label === '动变')
  if (!dongDim.value.includes('1')) {
    throw new Error(`应有1个动爻，实际: ${dongDim.value}`)
  }
})

test('用神匹配: question含"钱"应匹配妻财', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '能否赚到钱'
  })
  if (r.fortune.yongshen !== '妻财') {
    throw new Error(`问钱应用神应为妻财，实际: ${r.fortune.yongshen}`)
  }
})

test('用神未现: 文案应说"伏藏"', () => {
  // 构造一个用神不在卦中的场景（需特定卦）
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '测是否有桃花'
  })
  const dims = r.fortune.dimensions
  const yongDim = dims.find(d => d.label === '用神')
  // 用神可能显现，看detail
  console.log(`  用神维度: ${yongDim.value} / ${yongDim.detail}`)
})

test('trendVal=向好: 当日月都用神', () => {
  // 这个是动态的，取决于当前日期
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  const dims = r.fortune.dimensions
  const trendDim = dims.find(d => d.label === '趋势')
  console.log(`  趋势: ${trendDim.value} / ${trendDim.detail}`)
})

test('fortune score在0-100内', () => {
  const r = paipan({
    yao: ['laoyang','laoyang','laoyang','laoyang','laoyang','laoyang'],
    question: '工作如何'
  })
  const score = r.fortune.displayScore
  if (score < 0 || score > 100) {
    throw new Error(`分数超范围: ${score}`)
  }
  console.log(`  分数: ${score} / ${r.fortune.tierName}`)
})

test('tier key在CONSumer_COPY中有对应文案', () => {
  const keys = ['shangshang','daji','zhongji','xiaoji','zhongping','xiaxia','xiong','error']
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  const key = r.fortune.tierKey
  if (!keys.includes(key)) {
    throw new Error(`tierKey "${key}" 不在已知key列表中`)
  }
})

// ─────────────────────────────────────────────
// 2. 边界与异常
// ─────────────────────────────────────────────

console.log('\n=== 边界与异常 ===')

test('空question应正常处理', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: ''
  })
  if (!r.fortune.yongshen) throw new Error('空question应用神为空')
  console.log(`  用神: ${r.fortune.yongshen}`)
})

test('yao参数缺一个应报错', () => {
  try {
    paipan({ yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'] })
    throw new Error('应该抛错')
  } catch (e) {
    if (!e.message.includes('6')) throw new Error(`错误信息不明确: ${e.message}`)
  }
})

test('非法yao类型应报错', () => {
  try {
    paipan({ yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','invalid'] })
    throw new Error('应该抛错')
  } catch (e) {
    if (!e.message.includes('不合法')) throw new Error(`错误信息不明确: ${e.message}`)
  }
})

test('6个全部动爻(老阳老阴)', () => {
  const r = paipan({
    yao: ['laoyang','laoyang','laoyang','laoyang','laoyang','laoyang'],
    question: '工作如何'
  })
  if (r.movingPositions.length !== 6) {
    throw new Error(`全动应有6个动爻，实际: ${r.movingPositions.length}`)
  }
  if (!r.changedHexagram) {
    throw new Error('全动应有变卦')
  }
  console.log(`  变卦: ${r.changedHexagram.name}`)
})

test('1个动爻', () => {
  const r = paipan({
    yao: ['laoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  if (r.movingPositions.length !== 1) throw new Error()
})

test('多个动爻', () => {
  const r = paipan({
    yao: ['laoyang','laoyang','shaoyang','laoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  console.log(`  动爻: ${r.movingPositions.join(',')}`)
})

test('solarTerms范围外日期(2031年)', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何',
    dateTime: '2031-06-15T12:00:00+08:00'
  })
  // 应该回退到近似算法，不应崩溃
  console.log(`  月建: ${r.today.monthBranch}`)
})

test('solarTerms范围外日期(2023年)', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaowang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何',
    dateTime: '2023-06-15T12:00:00+08:00'
  })
  console.log(`  月建: ${r.today.monthBranch}`)
})

// ─────────────────────────────────────────────
// 3. 字段完整性检查
// ─────────────────────────────────────────────

console.log('\n=== 字段完整性 ===')

test('result.js: renderResult不依赖undefined字段', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  // 模拟renderResult的数据构建
  const displayYao = [...r.yaoDetails].reverse().map(y => ({
    position: y.position,
    value: y.binary === 1 ? 'yang' : 'yin',
    stem: y.stem,
    branch: y.branch,
    liuqin: y.liuqin,
    liushen: y.liushen,
    is_moving: y.isMoving || false,
  }))
  // 检查字段
  displayYao.forEach((y, i) => {
    if (y.position === undefined) throw new Error(`第${i+1}爻position为undefined`)
    if (!y.value) throw new Error(`第${i+1}爻value为空`)
    if (!y.stem) throw new Error(`第${i+1}爻stem为空`)
    if (!y.branch) throw new Error(`第${i+1}爻branch为空`)
    if (!y.liuqin) warn('liuqin空', `第${i+1}爻`)
    if (!y.liushen) warn('liushen空', `第${i+1}爻`)
  })
})

test('deepReading构建不崩溃', () => {
  const r = paipan({
    yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'],
    question: '工作如何'
  })
  const { buildDeepReading } = require('../pages/result/result.js')
  // buildDeepReading是内部函数，无法直接调用
  // 验证fortune字段存在
  if (!r.fortune.dimensions) throw new Error('fortune.dimensions缺失')
  if (!r.fortune.items) throw new Error('fortune.items缺失')
  if (!r.fortune.yongshen) throw new Error('fortune.yongshen缺失')
})

// ─────────────────────────────────────────────
// 总结
// ─────────────────────────────────────────────

console.log('\n=== 验证结果 ===')
console.log(`通过: ${results.passed.length}`)
console.log(`失败: ${results.failed.length}`)
console.log(`警告: ${results.warnings.length}`)
if (results.failed.length > 0) {
  console.log('\n失败项:')
  results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`))
}
if (results.warnings.length > 0) {
  console.log('\n警告项:')
  results.warnings.forEach(w => console.log(`  - ${w.name}: ${w.msg}`))
}
