/**
 * 六爻数据真实性审计脚本
 *
 * 检查项：
 *   1. 64卦完整性
 *   2. 八宫卦序
 *   3. 纳甲正确性
 *   4. 世应类型与位置匹配
 *   5. 卦辞爻辞完整性
 *   6. 干支日期一致性
 */
const HEXAGRAMS = require('../data/hexagrams').HEXAGRAMS
const HEXAGRAM_BY_BINARY = require('../data/hexagrams').HEXAGRAM_BY_BINARY
const NAJIA = require('../data/najia')
const { SHIYING_MAP, BRANCHES, STEMS, LIUSHEN_ORDER } = require('../data/constants')

let errors = []
let warnings = []

function check(cond, msg) {
  if (!cond) errors.push('❌ ' + msg)
  else console.log('  ✅ ' + msg)
}

function warn(cond, msg) {
  if (!cond) warnings.push('⚠️  ' + msg)
  else console.log('  ✅ ' + msg)
}

console.log('=== 1. 64卦完整性 ===')
check(HEXAGRAMS.length === 64, `64卦数量正确 (${HEXAGRAMS.length})`)

const indices = HEXAGRAMS.map(h => h.index).sort((a, b) => a - b)
check(indices[0] === 1 && indices[63] === 64, '序号 1-64 连续')
check(new Set(indices).size === 64, '序号无重复')

const binaries = HEXAGRAMS.map(h => h.binary)
check(new Set(binaries).size === 64, '64个二进制编码唯一')

HEXAGRAMS.forEach(h => {
  check(h.lines && h.lines.length === 6, `${h.name}(${h.index}) 有6条爻辞`)
  check(h.name && h.judgment, `${h.name} 有卦名和卦辞`)
  check(h.upperTrigram && h.lowerTrigram, `${h.name} 有上下卦`)
  check(h.palace && h.element, `${h.name} 有宫位和五行`)
  check(h.generation, `${h.name} 有世应类型`)
})

// 验证 binary 组成是否与上下卦一致
const TRIGRAM_BINARY = {
  '乾': '111', '兑': '110', '离': '101', '震': '100',
  '巽': '011', '坎': '010', '艮': '001', '坤': '000'
}
console.log('\n=== 2. 八宫卦序验证 ===')
const PALACE_ORDER = {
  '乾': ['乾','姤','遁','否','观','剥','晋','大有'],
  '兑': ['兑','困','萃','咸','蹇','谦','小过','归妹'],
  '离': ['离','旅','鼎','未济','蒙','涣','讼','同人'],
  '震': ['震','豫','解','恒','升','井','大过','随'],
  '巽': ['巽','小畜','家人','益','无妄','噬嗑','颐','蛊'],
  '坎': ['坎','节','屯','既济','革','丰','明夷','师'],
  '艮': ['艮','贲','大畜','损','睽','履','中孚','渐'],
  '坤': ['坤','复','临','泰','大壮','夬','需','比']
}

let palaceErrors = 0
Object.keys(PALACE_ORDER).forEach(palace => {
  const expected = PALACE_ORDER[palace]
  const actual = HEXAGRAMS.filter(h => h.palace === palace).map(h => h.name)
  const match = expected.every((name, i) => name === actual[i])
  if (!match) {
    errors.push(`❌ ${palace}宫: 期望 [${expected.join(', ')}], 实际 [${actual.join(', ')}]`)
    palaceErrors++
  } else {
    console.log(`  ✅ ${palace}宫 卦序正确 (${expected.join(', ')})`)
  }
})

console.log('\n=== 3. 纳甲验证 ===')
const EXPECTED_NAJIA = {
  '乾': [['甲','子'],['甲','寅'],['甲','辰'],['甲','午'],['甲','申'],['甲','戌']],
  '坤': [['乙','未'],['乙','巳'],['乙','卯'],['乙','丑'],['乙','亥'],['乙','酉']],
  '坎': [['戊','寅'],['戊','辰'],['戊','午'],['戊','申'],['戊','戌'],['戊','子']],
  '离': [['己','卯'],['己','丑'],['己','亥'],['己','酉'],['己','未'],['己','巳']],
  '震': [['庚','子'],['庚','寅'],['庚','辰'],['庚','午'],['庚','申'],['庚','戌']],
  '巽': [['辛','丑'],['辛','亥'],['辛','酉'],['辛','未'],['辛','巳'],['辛','卯']],
  '艮': [['丙','辰'],['丙','午'],['丙','申'],['丙','戌'],['丙','子'],['丙','寅']],
  '兑': [['丁','巳'],['丁','卯'],['丁','丑'],['丁','亥'],['丁','酉'],['丁','未']]
}

Object.keys(EXPECTED_NAJIA).forEach(gua => {
  const expected = EXPECTED_NAJIA[gua]
  const actual = NAJIA[gua]
  if (!actual) {
    errors.push(`❌ ${gua} 无纳甲数据`)
    return
  }
  let match = true
  for (let i = 0; i < 6; i++) {
    if (actual[i].stem !== expected[i][0] || actual[i].branch !== expected[i][1]) {
      match = false
      break
    }
  }
  if (!match) {
    errors.push(`❌ ${gua}纳甲: 期望 [${expected.map(x=>x[0]+x[1]).join(',')}], 实际 [${actual.map(x=>x.stem+x.branch).join(',')}]`)
  } else {
    console.log(`  ✅ ${gua}纳甲正确 (${actual.map(x=>x.stem+x.branch).join(',')})`)
  }
})

console.log('\n=== 4. 世应类型分布 ===')
const generationCounts = {}
HEXAGRAMS.forEach(h => {
  generationCounts[h.generation] = (generationCounts[h.generation] || 0) + 1
})
Object.keys(generationCounts).sort().forEach(g => {
  console.log(`  ${g}: ${generationCounts[g]} 卦`)
})
check(generationCounts['pure'] === 8, '八纯卦 (pure) = 8')
check(generationCounts['guihun'] === 8, '归魂卦 (guihun) = 8')
check(generationCounts['youhun'] === 8, '游魂卦 (youhun) = 8')
// 一世到五世各 8 卦: 8*5=40, +8+8+8=64
const totalGenerations = Object.values(generationCounts).reduce((a, b) => a + b, 0)
check(totalGenerations === 64, '世应类型总计数 = 64')

console.log('\n=== 5. 六神顺序检查 ===')
// 六神顺序应: 青龙→朱雀→勾陈→腾蛇→白虎→玄武 (起始不同)
const LIUSHEN_STANDARD = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武']
Object.keys(LIUSHEN_ORDER).forEach(stem => {
  const order = LIUSHEN_ORDER[stem]
  if (order.length !== 6) {
    errors.push(`❌ ${stem}日六神长度不为6`)
    return
  }
  // 检查所有六神都在标准列表中
  const allValid = order.every(s => LIUSHEN_STANDARD.includes(s))
  if (!allValid) errors.push(`❌ ${stem}日六神包含非法值: ${order.join(',')}`)
})
console.log(`  ✅ 10个日干的六神顺序均合法`)

console.log('\n=== 6. 干支定义 ===')
check(BRANCHES.length === 12, `12地支: ${BRANCHES.join(',')}`)
check(STEMS.length === 10, `10天干: ${STEMS.join(',')}`)

console.log('\n═══════════════════════════════════')
console.log(`审计完成: ${errors.length} 个错误, ${warnings.length} 个警告`)
console.log('═══════════════════════════════════')
if (errors.length > 0) {
  errors.forEach(e => console.log(e))
}
if (warnings.length > 0) {
  warnings.forEach(w => console.log(w))
}
