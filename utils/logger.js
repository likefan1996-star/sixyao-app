/**
 * 轻量行为日志入口。
 * 当前只输出到本地控制台，后续接入统计服务时统一替换这里即可。
 */
function logUserAction(action, detail = {}) {
  try {
    console.info('[sixyao]', action, {
      ...detail,
      at: new Date().toISOString(),
    })
  } catch (e) {
    // 日志失败不影响主流程
  }
}

module.exports = { logUserAction }
