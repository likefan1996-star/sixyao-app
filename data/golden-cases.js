/**
 * 标准案例盘草稿库
 *
 * 说明：
 * - draft 表示仅占位和人工待校验，不作为标准答案。
 * - verified 表示已经由人工或可信资料确认 expected，可进入自动回归校验。
 * - 不要把当前程序输出直接复制成 expected，除非已完成外部校验。
 */

const GOLDEN_CASES = [
  {
    id: 'case_001_relationship_single_moving',
    title: '感情关系：单动爻观察',
    status: 'draft',
    source: '待人工校验',
    question: '这段关系接下来怎么发展',
    topicType: 'relationship',
    role: 'whole',
    dateTime: '2026-05-04T20:00:00+08:00',
    yao: ['shaoyang', 'shaoyin', 'shaoyang', 'laoyang', 'shaoyin', 'shaoyang'],
    expected: null,
    notes: '用于校验本卦、变卦、世应、六亲、六神和关系类解读输出。',
  },
  {
    id: 'case_002_work_static',
    title: '工作事业：静卦观察',
    status: 'draft',
    source: '待人工校验',
    question: '目前这个工作机会怎么看',
    topicType: 'work',
    role: '',
    dateTime: '2026-05-05T19:30:00+08:00',
    yao: ['shaoyin', 'shaoyang', 'shaoyin', 'shaoyang', 'shaoyin', 'shaoyang'],
    expected: null,
    notes: '用于校验无动爻时的变卦为空、动爻说明和解读兜底。',
  },
  {
    id: 'case_003_finance_multi_moving',
    title: '财务合作：多动爻观察',
    status: 'draft',
    source: '待人工校验',
    question: '这次合作的收益和风险怎么看',
    topicType: 'finance',
    role: '',
    dateTime: '2026-06-06T10:15:00+08:00',
    yao: ['laoyin', 'shaoyang', 'shaoyin', 'laoyang', 'shaoyang', 'laoyin'],
    expected: null,
    notes: '用于校验多动爻、变卦、财务合作类用神和结构依据输出。',
  },
  {
    id: 'case_004_solar_term_boundary_before',
    title: '节气边界：立夏前',
    status: 'verified',
    source: 'Claude Code 第二轮外部规则校验：2026-05-05 19:00 仍为辰月',
    question: '节气交界前的月建校验',
    topicType: 'other',
    role: '',
    dateTime: '2026-05-05T19:00:00+08:00',
    yao: ['shaoyang', 'shaoyang', 'shaoyin', 'shaoyin', 'shaoyang', 'shaoyin'],
    expected: {
      monthBranch: '辰',
    },
    notes: '重点校验立夏前仍按辰月取月建。',
  },
  {
    id: 'case_005_solar_term_boundary_after',
    title: '节气边界：立夏后',
    status: 'verified',
    source: 'Claude Code 第二轮外部规则校验：2026-05-05 20:00 切换为巳月',
    question: '节气交界后的月建校验',
    topicType: 'other',
    role: '',
    dateTime: '2026-05-05T20:00:00+08:00',
    yao: ['shaoyang', 'shaoyang', 'shaoyin', 'shaoyin', 'shaoyang', 'shaoyin'],
    expected: {
      monthBranch: '巳',
    },
    notes: '重点校验立夏后切换为巳月。',
  },
]

module.exports = { GOLDEN_CASES }
