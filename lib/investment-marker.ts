/**
 * 在「描述」最前面加此字符，表示本条为投资相关流水（与日常储蓄/支出分开统计）。
 * 提交后会自动去掉该字符，仅保留标记。
 */
export const INVESTMENT_DESC_PREFIX = '^' as const

export function parseInvestmentDescription(raw: string): {
  description: string
  isInvestment: boolean
} {
  const trimmed = raw.trim()
  if (trimmed.startsWith(INVESTMENT_DESC_PREFIX)) {
    const description = trimmed.slice(INVESTMENT_DESC_PREFIX.length).trim()
    return { description, isInvestment: true }
  }
  return { description: trimmed, isInvestment: false }
}
