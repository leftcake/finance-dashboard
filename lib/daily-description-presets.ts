import type { Category } from '@/lib/types';

/** 支出：餐饮、交通 */
export const EXPENSE_DESCRIPTION_PRESETS = ['Eat', 'Drink', 'Bus', 'MRT'] as const;

/** 收入：工资、奖金等 */
export const INCOME_DESCRIPTION_PRESETS = [
  'Salary',
  'Bonus',
  'Side income',
  'Gift',
] as const;

/** 储蓄：银行存款、定存、应急金等 */
export const SAVINGS_DESCRIPTION_PRESETS = [
  'Bank Savings',
  'Fixed Deposit',
  'Emergency Fund',
] as const;

export function getDescriptionPresetsForCategory(cat: Category): readonly string[] {
  switch (cat) {
    case 'expense':
      return EXPENSE_DESCRIPTION_PRESETS;
    case 'income':
      return INCOME_DESCRIPTION_PRESETS;
    case 'savings':
      return SAVINGS_DESCRIPTION_PRESETS;
    default:
      return EXPENSE_DESCRIPTION_PRESETS;
  }
}

export function defaultPresetForCategory(cat: Category): string {
  return getDescriptionPresetsForCategory(cat)[0];
}
