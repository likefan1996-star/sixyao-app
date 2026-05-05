const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8')
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file))
}

function listFiles(dir, exts, acc = []) {
  const full = path.join(ROOT, dir)
  if (!fs.existsSync(full)) return acc
  fs.readdirSync(full, { withFileTypes: true }).forEach(entry => {
    const rel = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      listFiles(rel, exts, acc)
      return
    }
    if (exts.includes(path.extname(entry.name))) acc.push(rel)
  })
  return acc
}

function assertPackIgnored(config, type, value) {
  const ignored = config.packOptions?.ignore || []
  assert.ok(
    ignored.some(item => item.type === type && item.value === value),
    `${value} should be excluded from mini-program package`
  )
}

function main() {
  const app = JSON.parse(read('app.json'))
  const projectConfig = JSON.parse(read('project.config.json'))

  assert.deepStrictEqual(
    app.pages,
    ['pages/index/index', 'pages/result/result', 'pages/history/history'],
    'app.json should register index, result, and local history pages'
  )
  assert.ok(!exists('pages/lottery'), 'unregistered pages/lottery directory should not exist before upload')

  assertPackIgnored(projectConfig, 'file', 'DEVLOG.md')
  assertPackIgnored(projectConfig, 'file', 'VERIFICATION_REPORT.md')
  assertPackIgnored(projectConfig, 'folder', 'tmp_sensitive')

  assert.ok(exists('assets/images/coin-stack.svg'), 'coin stack asset should exist')
  assert.ok(exists('assets/images/app-icon-1024.png'), 'app icon upload asset should exist')
  assert.ok(exists('utils/history.js'), 'local history storage utility should exist')
  assert.ok(exists('pages/history/history.js'), 'history page logic should exist')
  assert.ok(exists('pages/history/history.wxml'), 'history page markup should exist')
  assert.ok(exists('pages/history/history.wxss'), 'history page style should exist')
  assert.ok(exists('pages/history/history.json'), 'history page config should exist')

  const sourceFiles = [
    ...listFiles('pages', ['.js', '.wxml', '.wxss']),
    ...listFiles('utils', ['.js']),
    'app.js',
  ].filter(file => exists(file))

  const forbiddenTerms = [
    '算命',
    '预测',
    '吉凶',
    '大吉',
    '中吉',
    '小吉',
    '测感情',
    '测事业',
    '运势',
    '改运',
    '转运',
    '精准',
    '必然',
    '一定',
    '占卜',
  ]

  sourceFiles.forEach(file => {
    const content = read(file)
    forbiddenTerms.forEach(term => {
      assert.ok(!content.includes(term), `${file} should not include sensitive term: ${term}`)
    })
  })

  const indexWxml = read('pages/index/index.wxml')
  const resultWxml = read('pages/result/result.wxml')
  const resultJs = read('pages/result/result.js')
  const historyJs = read('utils/history.js')
  const historyWxml = read('pages/history/history.wxml')

  assert.ok(indexWxml.includes('不选也可以，系统会自动识别'), 'index should allow topic auto-recognition copy')
  assert.ok(indexWxml.includes('history-entry'), 'index should expose a local history entry')
  assert.ok(indexWxml.includes('内容用于传统文化学习与自我梳理'), 'index should show natural disclaimer copy')
  assert.ok(resultWxml.includes('当前倾向'), 'result should use tendency wording')
  assert.ok(resultWxml.includes('文化参考'), 'result should use culture-reference wording')
  assert.ok(resultWxml.includes('source-card'), 'result should render a lightweight source card')
  assert.ok(resultWxml.includes('资料来源'), 'source card should use a simple source title')
  assert.ok(resultWxml.includes('卦辞爻辞参考《周易》通行文本'), 'source card should explain the text basis')
  assert.ok(resultWxml.includes('当前页面为文化学习参考'), 'source card should keep the learning-reference positioning')
  assert.ok(resultJs.includes('resetPreviousIndexState'), 'result should reset index state when returning')
  assert.ok(resultJs.includes('saveHistoryRecord'), 'result should save successful readings locally')
  assert.ok(resultJs.includes('dateTime'), 'result should preserve reading dateTime for history replay')
  assert.ok(historyJs.includes('MAX_HISTORY_RECORDS = 20'), 'history should keep the latest 20 records')
  assert.ok(historyJs.includes('saveHistoryRecord'), 'history utility should expose saveHistoryRecord')
  assert.ok(historyJs.includes('getHistoryRecords'), 'history utility should expose getHistoryRecords')
  assert.ok(historyJs.includes('deleteHistoryRecord'), 'history utility should expose deleteHistoryRecord')
  assert.ok(historyWxml.includes('历史记录仅保存在本机。'), 'history page should explain that records are local-only')

  console.log('prelaunch check passed')
}

if (require.main === module) {
  main()
}
