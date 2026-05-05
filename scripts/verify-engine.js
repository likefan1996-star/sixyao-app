/**
 * 六爻排盘引擎验证脚本 v4
 * 核心修正：验证二进制卦象与卦名的映射是否正确
 */

const { paipan } = require('../utils/paipan')
const { HEXAGRAM_BY_BINARY, HEXAGRAMS } = require('../data/hexagrams')
const { getStemBranchFromDateTime } = require('../utils/dateutil')

// 先列出所有64卦的二进制与卦名对应关系，确认映射正确性
console.log('═'.repeat(80))
console.log('64卦 二进制 ↔ 卦名 映射表验证')
console.log('═'.repeat(80))

// 按宫排列
const PALACE_MAP = {
  '乾宫': HEXAGRAMS.filter(h => h.palace === '乾').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '兑宫': HEXAGRAMS.filter(h => h.palace === '兑').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '离宫': HEXAGRAMS.filter(h => h.palace === '离').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '震宫': HEXAGRAMS.filter(h => h.palace === '震').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '巽宫': HEXAGRAMS.filter(h => h.palace === '巽').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '坎宫': HEXAGRAMS.filter(h => h.palace === '坎').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '艮宫': HEXAGRAMS.filter(h => h.palace === '艮').map(h => `${h.binary}→${h.name}(${h.generation})`),
  '坤宫': HEXAGRAMS.filter(h => h.palace === '坤').map(h => `${h.binary}→${h.name}(${h.generation})`),
}

Object.entries(PALACE_MAP).forEach(([palace, items]) => {
  console.log(`\n${palace}:`)
  items.forEach(item => console.log(`  ${item}`))
})

// 关键二进制验证
console.log('\n' + '═'.repeat(80))
console.log('关键二进制编码验证')
console.log('═'.repeat(80))

const KEY_BINARY = [
  ['111111', '乾'],
  ['000000', '坤'],
  ['011111', '姤'],
  ['001111', '遁'],
  ['000111', '否'],
  ['000011', '观'],
  ['000001', '剥'],
  ['000101', '晋'],
  ['111101', '大有'],
  ['100000', '复'],
  ['110000', '临'],
  ['101001', '贲'],
  ['100100', '震'],
  ['001001', '大有'],
]

KEY_BINARY.forEach(([binary, expectedName]) => {
  const h = HEXAGRAM_BY_BINARY[binary]
  const status = h?.name === expectedName ? '✅' : '❌'
  console.log(`${status} ${binary} → ${h?.name || 'NOT FOUND'} (期望: ${expectedName})`)
})

// 计算2026-05-05的月建
console.log('\n' + '═'.repeat(80))
console.log('月建验证（2026年）')
console.log('═'.repeat(80))

const SOLAR_TERMS_2026 = [
  ['2026-01-05T16:22:53+08:00', '小寒', '丑'],
  ['2026-02-04T04:01:51+08:00', '立春', '寅'],
  ['2026-03-05T22:02:43+08:00', '惊蛰', '卯'],
  ['2026-04-05T02:39:43+08:00', '清明', '辰'],
  ['2026-05-05T19:48:25+08:00', '立夏', '巳'],
  ['2026-06-05T23:48:04+08:00', '芒种', '午'],
  ['2026-07-07T09:57:50+08:00', '小暑', '未'],
  ['2026-08-07T19:42:26+08:00', '立秋', '申'],
  ['2026-09-07T22:40:59+08:00', '白露', '酉'],
  ['2026-10-08T14:28:59+08:00', '寒露', '戌'],
  ['2026-11-07T17:51:46+08:00', '立冬', '亥'],
  ['2026-12-07T10:52:14+08:00', '大雪', '子'],
]

function getMonthBranchTest(date) {
  const target = date.getTime()
  let result = '子'
  for (const [time, name, branch] of SOLAR_TERMS_2026) {
    if (target >= new Date(time).getTime()) result = branch
  }
  return result
}

// 测试几个关键日期
const testDates = [
  '2026-01-05T16:00:00+08:00', // 小寒前
  '2026-01-05T17:00:00+08:00', // 小寒后
  '2026-05-05T19:00:00+08:00', // 立夏前（辰月）
  '2026-05-05T20:00:00+08:00', // 立夏后（巳月）
]

testDates.forEach(dateStr => {
  const d = new Date(dateStr)
  const mb = getMonthBranchTest(d)
  console.log(`${dateStr} → 月建: ${mb}`)
})

// 核心验证：用已知正确的案例测试
console.log('\n' + '═'.repeat(80))
console.log('核心功能验证')
console.log('═'.repeat(80))

// 测试1：乾为天（全阳静卦）
console.log('\n【测试1】乾为天')
const r1 = paipan({ yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'], question: '测试', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`本卦: ${r1.hexagram.name} (${r1.hexagram.binary})`)
console.log(`世应: 世${r1.shiying.shi}/应${r1.shiying.ying}`)
console.log(`纳甲: ${r1.yaoDetails.map(y => y.stem+y.branch).join(',')}`)
console.log(`六亲: ${r1.yaoDetails.map(y => y.liuqin).join(',')}`)
console.log(`六神: ${r1.yaoDetails.map(y => y.liushen).join(',')}`)
console.log(`generation: ${r1.hexagram.generation}`)
console.log(`月建: ${r1.today.monthBranch}`)
console.log(`日辰: ${r1.today.dayStem}${r1.today.dayBranch}`)

// 测试2：坤为地（全阴静卦）
console.log('\n【测试2】坤为地')
const r2 = paipan({ yao: ['shaoyin','shaoyin','shaoyin','shaoyin','shaoyin','shaoyin'], question: '测试', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`本卦: ${r2.hexagram.name} (${r2.hexagram.binary})`)
console.log(`世应: 世${r2.shiying.shi}/应${r2.shiying.ying}`)
console.log(`纳甲: ${r2.yaoDetails.map(y => y.stem+y.branch).join(',')}`)
console.log(`六亲: ${r2.yaoDetails.map(y => y.liuqin).join(',')}`)
console.log(`generation: ${r2.hexagram.generation}`)
console.log(`月建: ${r2.today.monthBranch}`)
console.log(`日辰: ${r2.today.dayStem}${r2.today.dayBranch}`)

// 测试3：测试二进制011111（姤卦）
console.log('\n【测试3】姤卦 binary=011111')
// 要得到011111，需要初爻到五爻都是阴(0)，上爻是阳(1)
// shaoyin=0, shaoyang=1
// 但要上爻动，需要 laoyang=1(但动)
// 011111 意味着 初=0,二=1,三=1,四=1,五=1,上=1
// 等等，这不对...让我重新思考

// 让我直接构造正确的yao数组来获得姤卦
// 姤卦是 乾宫一世卦，binary=011111
// 初爻(0)=阴，二爻(1)=阳，三爻(2)=阳，四爻(3)=阳，五爻(4)=阳，上爻(5)=阳
// 但是上爻是阳且不动...那应该是shaoyang=1
// 所以 yao = [shaoyin, shaoyang, shaoyang, shaoyang, shaoyang, shaoyang]
// shaoyin=0, shaoyang=1 -> binary = 011111

const r3 = paipan({ yao: ['shaoyin','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'], question: '测试', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`本卦: ${r3.hexagram.name} (${r3.hexagram.binary})`)
console.log(`generation: ${r3.hexagram.generation}`)
console.log(`世应: 世${r3.shiying.shi}/应${r3.shiying.ying}`)
console.log(`变卦: ${r3.changedHexagram?.name || '无'}`)
console.log(`动爻: ${r3.movingPositions.join(',') || '无'}`)

// 测试4：测试变卦（老阴动变阳，老阳动变阴）
console.log('\n【测试4】坤变乾（6个老阴全动）')
const r4 = paipan({ yao: ['laoyin','laoyin','laoyin','laoyin','laoyin','laoyin'], question: '测试', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`本卦: ${r4.hexagram.name} (${r4.hexagram.binary})`)
console.log(`变卦: ${r4.changedHexagram?.name || '无'} (${r4.changedBinaryStr || 'N/A'})`)
console.log(`动爻: ${r4.movingPositions.join(',')}`)
console.log(`generation: ${r4.hexagram.generation}`)

// 测试5：测试游魂卦
console.log('\n【测试5】晋卦（游魂卦）')
// 晋卦 binary=000101 (乾宫游魂)
// 初=0,二=0,三=0,四=1,五=0,上=1
const r5 = paipan({ yao: ['shaoyin','shaoyin','shaoyin','laoyang','shaoyin','laoyang'], question: '测试', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`本卦: ${r5.hexagram.name} (${r5.hexagram.binary})`)
console.log(`变卦: ${r5.changedHexagram?.name || '无'}`)
console.log(`generation: ${r5.hexagram.generation}`)
console.log(`世应: 世${r5.shiying.shi}/应${r5.shiying.ying}`)
console.log(`动爻: ${r5.movingPositions.join(',')}`)

// 测试6：测试归魂卦
console.log('\n【测试6】大有卦（归魂卦）')
// 大有卦 binary=001001 (离宫归魂)
// 初=0,二=0,三=1,四=0,五=0,上=1
const r6 = paipan({ yao: ['shaoyin','shaoyin','laoyang','shaoyin','shaoyin','laoyang'], question: '测试', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`本卦: ${r6.hexagram.name} (${r6.hexagram.binary})`)
console.log(`变卦: ${r6.changedHexagram?.name || '无'}`)
console.log(`generation: ${r6.hexagram.generation}`)
console.log(`世应: 世${r6.shiying.shi}/应${r6.shiying.ying}`)
console.log(`动爻: ${r6.movingPositions.join(',')}`)

// 测试7：节气边界 - 立夏前后
console.log('\n【测试7】节气边界：立夏前(19:00) vs 立夏后(20:00)')
const r7a = paipan({ yao: ['shaoyang','shaoyin','shaoyang','laoyang','shaoyin','shaoyang'], question: '测试', dateTime: '2026-05-05T19:00:00+08:00' })
const r7b = paipan({ yao: ['shaoyang','shaoyin','shaoyang','laoyang','shaoyin','shaoyang'], question: '测试', dateTime: '2026-05-05T20:00:00+08:00' })
console.log(`19:00 → 本卦:${r7a.hexagram.name} 月建:${r7a.today.monthBranch} (立夏前，应为辰)`)
console.log(`20:00 → 本卦:${r7b.hexagram.name} 月建:${r7b.today.monthBranch} (立夏后，应为巳)`)

// 测试8：测试具体的世应
console.log('\n【测试8】世应验证')
// 乾宫八卦的世应
const qianGua = HEXAGRAMS.filter(h => h.palace === '乾')
qianGua.forEach(h => {
  console.log(`${h.name}: generation=${h.generation}, expected shi=${SHIYING_MAP[h.generation]?.shi}, expected ying=${SHIYING_MAP[h.generation]?.ying}`)
})

const SHIYING_MAP = {
  'pure':   { shi: 6, ying: 3 },
  'first':  { shi: 1, ying: 4 },
  'second': { shi: 2, ying: 5 },
  'third':  { shi: 3, ying: 6 },
  'fourth':  { shi: 4, ying: 1 },
  'fifth':  { shi: 5, ying: 2 },
  'youhun': { shi: 4, ying: 1 },
  'guihun': { shi: 3, ying: 6 }
}

// 测试9：测试旬空
console.log('\n【测试9】旬空验证')
// 2026-05-05 dayIndex=15，属于甲子旬（第2旬），空亡寅卯
const r9 = paipan({ yao: ['shaoyang','shaoyang','shaoyang','shaoyang','shaoyang','shaoyang'], question: '财运', dateTime: '2026-05-05T10:00:00+08:00' })
console.log(`日辰: ${r9.today.dayStem}${r9.today.dayBranch}(${r9.today.dayIndex})`)
console.log(`旬空: 第${Math.floor((r9.today.dayIndex%60)/10)+1}旬，空亡应为寅卯`)
console.log(`用神: ${r9.fortune.yongshen}`)
console.log(`用神位置: ${r9.fortune.yongshenPosition}`)
console.log(`评分项: ${r9.fortune.items.join(', ')}`)

// 检查用神是否在旬空列表
const XUNKONG_TABLE = [
  ['戌','亥'], ['申','酉'], ['午','未'], ['辰','巳'],
  ['寅','卯'], ['子','丑']
]
const tableIdx = Math.floor((r9.today.dayIndex % 60) / 10)
console.log(`实际空亡: ${XUNKONG_TABLE[tableIdx].join(',')}`)