/**
 * 用神自动匹配
 *
 * 根据用户问题关键词确定用神（核心关注点）。
 * 匹配优先级：按数组顺序，先匹配到的为准。
 * 默认无匹配时取世爻为用神。
 */
const { LIUQIN_TYPES } = require('../data/constants')

const RULES = [
  // [关键词列表, 用神六亲]
  [['财运','收入','赚钱','投资','生意','买卖','股票','基金','理财','涨跌','亏'], '妻财'],
  [['工作','升职','求职','事业','调动','面试','跳槽','公司','创业','业绩'], '官鬼'],
  [['考研','考试','学业','学习','成绩','升学','毕业','录取','分数','考'], '官鬼'],
  [['健康','疾病','看病','身体','治疗','手术','康复','体检','生病','住院'], '子孙'],
  [['家宅','房子','装修','风水','买房','租房','搬迁','搬家','房产'], '父母'],
  [['出行','旅行','外出','出差','旅游','开车','交通','航班','路'], '世爻'],
  [['官司','诉讼','纠纷','维权','仲裁','投诉','举报'], '官鬼'],
  [['婚姻','感情','恋爱','女友','男友','老婆','老公','结婚','离婚','对象'], '妻财'], // 默认以男视角
  [['官运','升官','考公','公务员','公考','编制'], '官鬼'],
  [['运势','运气','气运','流年','大运'], '世爻'],
]

/**
 * 匹配用神
 * @param {string} question - 用户输入的问题文本
 * @returns {{ yongshen: string, matchedKeyword: string }}
 */
function matchYongshen(question) {
  if (!question || !question.trim()) {
    return { yongshen: '世爻', matchedKeyword: '' }
  }

  const q = question.trim()
  for (const [keywords, liuqin] of RULES) {
    for (const kw of keywords) {
      if (q.includes(kw)) {
        return { yongshen: liuqin, matchedKeyword: kw }
      }
    }
  }

  return { yongshen: '世爻', matchedKeyword: '' }
}

module.exports = { matchYongshen, RULES }
