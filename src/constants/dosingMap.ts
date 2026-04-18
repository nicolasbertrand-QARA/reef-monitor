import { ParameterKey } from '@/src/models/types';

/**
 * Maps dosing product names (lowercased) to the parameters they affect.
 * A product can affect multiple parameters (e.g. All-for-Reef affects Ca, Alk, Mg).
 * Matching is done by substring so user-typed names also work.
 */
const DOSING_PARAMETER_MAP: { match: string; params: ParameterKey[] }[] = [
  { match: 'kalkwasser', params: ['alkalinity', 'calcium', 'ph'] },
  { match: 'all-for-reef', params: ['alkalinity', 'calcium', 'magnesium'] },
  { match: 'all for reef', params: ['alkalinity', 'calcium', 'magnesium'] },
  { match: 'ca', params: ['calcium'] },
  { match: 'calcium', params: ['calcium'] },
  { match: 'alk', params: ['alkalinity'] },
  { match: 'kh', params: ['alkalinity'] },
  { match: 'mg', params: ['magnesium'] },
  { match: 'magnés', params: ['magnesium'] },
  { match: 'magnes', params: ['magnesium'] },
  { match: 'amino', params: ['nitrate'] },
  { match: 'nourriture', params: ['nitrate', 'phosphate'] },
  { match: 'coral food', params: ['nitrate', 'phosphate'] },
  { match: 'korallenfutter', params: ['nitrate', 'phosphate'] },
  { match: 'no3', params: ['nitrate'] },
  { match: 'po4', params: ['phosphate'] },
  { match: 'phosphat', params: ['phosphate'] },
  { match: 'nitrat', params: ['nitrate'] },
];

export function getAffectedParams(productName: string): ParameterKey[] {
  const lower = productName.toLowerCase();
  for (const entry of DOSING_PARAMETER_MAP) {
    if (lower.includes(entry.match)) return entry.params;
  }
  // Unknown product — show on all charts
  return [];
}

export function isDoseRelevant(productName: string, parameter: ParameterKey): boolean {
  const affected = getAffectedParams(productName);
  // If no mapping found, show everywhere so user doesn't miss it
  return affected.length === 0 || affected.includes(parameter);
}
