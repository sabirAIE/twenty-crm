import uniqBy from 'lodash.uniqby';

import { type MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';

export const uniqueEntries = (
  data: MatchColumnsStepProps['data'],
  index: number,
): Partial<SpreadsheetMatchedOptions>[] =>
  uniqBy(
    (data ?? [])
      .filter((row) => Array.isArray(row) && isDefined(row[index]))
      .map((row) => ({ entry: row[index] })),
    'entry',
  ).filter(({ entry }) => !!entry);
