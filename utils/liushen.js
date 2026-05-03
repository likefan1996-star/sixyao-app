/**
 * 六神装配 - 根据日干确定六神在六爻上的分布
 *
 * 规则：
 *   日干甲乙：青龙→朱雀→勾陈→腾蛇→白虎→玄武（初爻→上爻）
 *   日干丙丁：朱雀→勾陈→腾蛇→白虎→玄武→青龙
 *   日干戊己：勾陈→腾蛇→白虎→玄武→青龙→朱雀
 *   日干庚辛：白虎→玄武→青龙→朱雀→勾陈→腾蛇
 *   日干壬癸：玄武→青龙→朱雀→勾陈→腾蛇→白虎
 */

const { LIUSHEN_ORDER } = require('../data/constants')

/**
 * 获取六神列表
 * @param {string} dayStem - 日干（甲~癸）
 * @returns {string[]} 6个六神名称，初爻→上爻
 */
function getLiushenList(dayStem) {
  const order = LIUSHEN_ORDER[dayStem]
  if (!order) {
    // 默认使用甲日
    return LIUSHEN_ORDER['甲']
  }
  return order
}

module.exports = { getLiushenList }
